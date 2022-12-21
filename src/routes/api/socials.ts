import { Router } from 'express';
import CacheHandler from '../../helpers/CacheHandler';
import TwitchHandler from '../../helpers/TwitchHandler';
import Error from '../../utils/Errors';
import axios from 'axios';
const router = Router();

export default function() {
	const SteamHandler = new CacheHandler();
	const GithubHandler = new CacheHandler();
	const TwitchCacheHandler = new TwitchHandler();

	/**
   * @API
   * /socials/steam:
   *   get:
   *     description: Get information on a steam account
   *     tags: socials
   *			parameters:
   *       - name: platform
   *         description: The platform, the user uses
   *         required: true
   *         type: string
   *       - name: username
   *         description: The username of the player
   *         required: true
   *         type: string
  */
	router.get('/steam', async (req, res) => {
		const username = req.query.username as string;
		if (!username) return Error.MissingQuery(res, 'username');

		let data = {};
		if (SteamHandler.data.get(username)) {
			data = SteamHandler.data.get(username) as object;
		} else {
			try {
				// Convert steam username to steam ID
				const { response } = (await axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.steam}&vanityurl=${username}`)).data;
				if (response.message == 'No match') return res.json({ error: 'No steam account with that name' });

				// Fetch player data + VAC bans
				const [{ data: { response: data1 } }, { data: data2 }] = await Promise.all([
					axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.steam}&steamids=${response.steamid}`),
					axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${process.env.steam}&steamids=${response.steamid}`),
				]);

				data = {
					id: data1.players[0].steamid,
					url: data1.players[0].profileurl,
					realname: data1.players[0].realname,
					avatar: data1.players[0].avatarfull,
					createdAt: data1.players[0].timecreated,
					CommunityBanned: data2.players[0].CommunityBanned,
					VACBanned: data2.players[0].VACBanned,
					NumberOfVACBans: data2.players[0].NumberOfVACBans,
					DaysSinceLastBan: data2.players[0].DaysSinceLastBan,
					NumberOfGameBans: data2.players[0].NumberOfGameBans,
				};
				SteamHandler._addData({ id: username, data: data });
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}

		// Return the data
		res.json({ data: data });
	});

	/**
   * @API
   * /socials/github:
   *   get:
   *     description: Get information on a Github repo
   *     tags: social
   *			parameters:
   *       - name: repo
   *         description: The name of the author and name of repo
   *         required: true
   *         type: string
  */
	router.get('/github', async (req, res) => {
		const repo = req.query.repo as string;
		if (!repo) return Error.MissingQuery(res, 'repo');

		let sentData = {};
		if (GithubHandler.data.get(repo)) {
			sentData = GithubHandler.data.get(repo) as object;
		} else {
			try {
				const data = (await axios.get(`https://api.github.com/repos/${repo}`)).data;
				GithubHandler._addData({ id: repo, data: data });
				sentData = data;
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}
		res.json({ data: sentData });
	});

	/**
   * @API
   * /socials/twitch:
   *   get:
   *     description: Get information on a twitch username
   *     tags: social
   *			parameters:
   *       - name: username
   *         description: The username of the twitch account.
   *         required: true
   *         type: string
  */
	router.get('/twitch', async (req, res) => {
		const username = req.query.username as string;
		if (!username) return Error.MissingQuery(res, 'username');

		let sentData = {};
		if (TwitchCacheHandler.data.get(username)) {
			sentData = TwitchCacheHandler.data.get(username) as object;
		} else {
			try {
				const res1 = await TwitchCacheHandler.getUserByUsername(username);
				const res2 = await TwitchCacheHandler.getStreamByUsername(username);
				const data = Object.assign(res1, res2);

				TwitchCacheHandler._addData({ id: username, data: data });
				sentData = data;
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}

		res.json({ data: sentData });
	});

	return router;
}
