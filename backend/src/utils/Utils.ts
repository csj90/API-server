import { readdirSync, statSync } from 'fs';
import { join, parse, sep } from 'path';
import type { Request } from 'express';
import { decode } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';
import { CONSTANTS } from './CONSTANTS';

type LabelEnum = { [key: string]: JWT }
const sessionStore: LabelEnum = {};

export class Utils {
	public static generateRoutes(directory: string) {
		const seperator = '/';
		const results: FileOptions[] = [];
		for(const path of this.searchDirectory(directory)) {
			const { dir, name } = parse(path);
			const basePath = directory.split(sep).pop() as string;
			const dirIndex = dir.indexOf(basePath);
			const directoryRoute = dir.slice(dirIndex).split(sep).join(seperator).toString().replace(basePath, !basePath.startsWith(seperator) ? '' : seperator);
			results.push({ path, route: `${this.validateDynamicRoute(directoryRoute)}${this.validateDynamicRoute(name, true)}` });
		}
		return results;
	}

	private static validateDynamicRoute(context: string, isFile = false) {
		const seperator = '/';
		const dynamicRouteValidator = /(?<=\[).+?(?=\])/gi;
		const validate = (dynamicRouteValidator.exec(context));
		if(!validate) return isFile ? `${seperator}${context}` : context;
		return context.replace(`[${validate[0]}]`, isFile ? `${seperator}:${validate[0]}` : `:${validate[0]}`);
	}

	public static searchDirectory(directory: string, files: string[] = []) {
		for(const file of readdirSync(directory)) {
			const path = join(directory, file);
			const is = statSync(path);
			if(is.isFile()) files.push(path);
			if(is.isDirectory()) files = files.concat(this.searchDirectory(path));
		}
		return files;
	}

	public static randomInteger(num1: number, num2 = 1) {
		return Math.floor(Math.random() * num1) + num2;
	}

	public static getIP(req: Request) {
		if (req.headers) {
			// Standard headers used by Amazon EC2, Heroku, and others.
			if (CONSTANTS.ipv4Regex.test(req.headers['x-client-ip'] as string)) return req.headers['x-client-ip'];

			// CF-Connecting-IP - applied to every request to the origin. (Cloudflare)
			if (CONSTANTS.ipv4Regex.test(req.headers['cf-connecting-ip'] as string)) return req.headers['cf-connecting-ip'];

			// Fastly and Firebase hosting header (When forwared to cloud function)
			if (CONSTANTS.ipv4Regex.test(req.headers['fastly-client-ip'] as string)) return req.headers['fastly-client-ip'];

			// Akamai and Cloudflare: True-Client-IP.
			if (CONSTANTS.ipv4Regex.test(req.headers['true-client-ip'] as string)) return req.headers['true-client-ip'];

			// Default nginx proxy/fcgi; alternative to x-forwarded-for, used by some proxies.
			if (CONSTANTS.ipv4Regex.test(req.headers['x-real-ip'] as string)) return req.headers['x-real-ip'];

			// (Rackspace LB and Riverbed's Stingray)
			// http://www.rackspace.com/knowledge_center/article/controlling-access-to-linux-cloud-sites-based-on-the-client-ip-address
			// https://splash.riverbed.com/docs/DOC-1926
			if (CONSTANTS.ipv4Regex.test(req.headers['x-cluster-client-ip'] as string)) return req.headers['x-cluster-client-ip'];

			if (CONSTANTS.ipv4Regex.test(req.headers['x-forwarded'] as string)) return req.headers['x-forwarded'];

			if (CONSTANTS.ipv4Regex.test(req.headers['forwarded-for'] as string)) return req.headers['forwarded-for'];

			if (CONSTANTS.ipv4Regex.test(req.headers.forwarded as string)) return req.headers.forwarded;
		}

		// Remote address checks.
		if (req.socket) {
			if (CONSTANTS.ipv4Regex.test(req.socket.remoteAddress ?? '')) return req.socket.remoteAddress;

			if (req.socket && CONSTANTS.ipv4Regex.test(req.socket.remoteAddress ?? '')) return req.socket.remoteAddress;
		}

		return req.ip;
	}
	public static async getSession(req: Request): Promise<JWT | null> {
		if (req.headers.cookie == undefined) return null;

		// get Session token from cookies
		const cookies: string[] = req.headers['cookie'].split('; ');
		const parsedcookies = cookies.map((i: string) => i.split('='));

		// Get session token (Could be secure or not so check both)
		let sessionToken = parsedcookies.find(i => i[0] == '__Secure-next-auth.session-token')?.[1];
		if (sessionToken == null) {
			sessionToken = parsedcookies.find(i => i[0] == 'next-auth.session-token')?.[1];
		}
		if (!sessionToken) return null;

		// Check session from cache
		/*
		let session;
		if (sessionStore[sessionToken]) {
			session = sessionStore[req.headers.cookie];
			// Make sure it hasn't expired
			if (new Date(session?.exp ?? 0).getTime() <= new Date().getTime()) return session;
		}
		*/
		const session = await decode({ token: sessionToken, secret: process.env.sessionSecret as string });
		if (session == null) return null;
		sessionStore[sessionToken] = session;
		return session;
	}
}

interface FileOptions {
	path: string,
	route: string,
}
