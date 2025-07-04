import { FastifyInstance } from 'fastify';
import { PostShortenBody, PostShortenResponse } from '../schemas/index';
import { createCodeForUrl } from '../managers/urls';

export async function postShorten(app: FastifyInstance) {
	app.post<{
		Body: PostShortenBody;
		Reply: PostShortenResponse;
	}>('/shorten', {
		schema: {
			body: PostShortenBody,
			response: {
				200: PostShortenResponse,
			},
		},
		handler: async (req) => {
			const { url } = req.body;

			const { code } = await createCodeForUrl(req, url);

			return { code };
		},
	});
}
