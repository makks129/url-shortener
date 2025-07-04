import { FastifyInstance } from 'fastify';
import { GetGoCodeParams } from '../schemas/index';
import { getUrlByCode } from '../managers/urls';

export async function getGoCode(app: FastifyInstance) {
	app.get<{
		Params: GetGoCodeParams;
	}>('/go/:code', {
		schema: {
			params: GetGoCodeParams,
			response: {
				302: {},
			},
		},
		handler: async (req, reply) => {
			const { code } = req.params;

			const { url } = await getUrlByCode(req, code);

			req.log.debug(`Found original URL by short link code, redirecting: ${JSON.stringify({ code, url })}`);

			return reply.redirect(url);
		},
	});
}
