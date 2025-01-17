import { Router } from 'express';
const router = Router();
import axios from 'axios';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from 'nsfwjs';
import type { Tensor3D } from '@tensorflow/tfjs-node';
import Error from '../../utils/Errors';

export default function() {
	/**
	  * @API
	  * /nsfw/image:
	  *   get:
	  *     description: Get a link to a NSFW image
	  *     tags: nsfw
	  *			parameters:
	  *       - name: type
	  *         description: Type of image
	  *         required: true
	  *         type: string
	*/
	router.get('/image', async (req, res) => {
		const type = req.query.type as string;
		if (!type) return Error.MissingQuery(res, 'type');

		// Make sure type is from set
		const allowedTypes = ['cosplay', 'hentai', 'ass', 'pgif', 'swimsuit', 'thigh', 'hass', 'boobs', 'hboobs', 'pussypaizuri', 'pantsu', 'lewdneko', 'feet', 'hyuri', 'hthigh', 'hmidriff', 'anal', 'nakadashi', 'blowjob', 'gonewild', 'hkitsune', 'tentacle', '4k', 'kanna', 'hentai_anal', 'food', 'neko', 'holo', 'pee', 'kemonomimi', 'coffee', 'yaoi', 'futa', 'gah'];
		if (!allowedTypes.includes(type)) return Error.InvalidValue(res, 'type', allowedTypes);

		try {
			const { data } = await axios.get(`https://nekobot.xyz/api/image?type=${type}`);
			res.json({ data: data.message });
		} catch (err: any) {
			res.json({ error: err.message });
		}
	});

	/**
	  * @API
	  * /nsfw/check:
	  *   get:
	  *     description: Check if an image is NSFW or not
	  *     tags: nsfw
	  *			parameters:
	  *       - name: type
	  *         description: The url of the image.
	  *         required: true
	  *         type: string
	*/
	router.get('/check', async (req, res) => {
		const url = req.query.url as string;
		if (!url) return Error.MissingQuery(res, 'url');

		try {
			const model = await nsfwjs.load();
			const image = await axios.get(url, { responseType: 'arraybuffer' });
			const imageBuffer = new Uint8Array(Buffer.from(image.data, 'utf-8'));
			const decodedImage = tf.node.decodeImage(imageBuffer);
			const data = await model.classify(decodedImage as Tensor3D);
			decodedImage.dispose();

			res.json({ data: {
				isNSFW: (['Porn', 'Hentai', 'Sexy'].includes(data[0].className)),
				probabilities: data },
			});
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	return router;
}
