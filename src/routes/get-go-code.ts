import { FastifyInstance } from 'fastify';
import { GetGoCodeParams, PostShortenResponse } from '../schemas/index';
import { getUrlByCode } from '../managers/urls';

export async function getGoCode(app: FastifyInstance) {
	app.get<{
		Params: GetGoCodeParams;
	}>('/go/:code', {
		schema: {
			params: GetGoCodeParams,
			response: {
				200: PostShortenResponse,
			},
		},
		handler: async (req, reply) => {
			const { code } = req.params;

			const { url } = await getUrlByCode(req, code);

			return reply.redirect(url);
		},
	});
}
