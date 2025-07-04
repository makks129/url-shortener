import { FastifyInstance } from 'fastify';
import { PostShortenBody, PostShortenResponse } from '../schemas/index';
import { createCodeForUrl } from '../managers/urls';
import { POST_SHORTEN_RATE_LIMITS_REQS } from '../configs';

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
			// rate limits are handled by src/plugins/rate-limiter.ts Fastify plugin
			rateLimits: {
				maxReqPerInverval: POST_SHORTEN_RATE_LIMITS_REQS,
			},
		},
		handler: async (req) => {
			const { url, one_time: oneTime } = req.body;

			const { code } = await createCodeForUrl(req, url, oneTime);

			req.server.customMetrics.urlShortenCounter.inc({ one_time: oneTime ? 'true' : 'false' });

			return { code };
		},
	});
}
