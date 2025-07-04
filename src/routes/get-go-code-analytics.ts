import { FastifyInstance } from 'fastify';
import { GetGoCodeAnalyticsParams, GetGoCodeAnalyticsResponse } from '../schemas/index';
import { getAnalyticsByCode } from '../managers/urls';

export async function getGoCodeAnalytics(app: FastifyInstance) {
	app.get<{
		Params: GetGoCodeAnalyticsParams;
	}>('/go/:code/analytics', {
		schema: {
			params: GetGoCodeAnalyticsParams,
			response: {
				200: GetGoCodeAnalyticsResponse,
			},
		},
		handler: async (req) => {
			const { code } = req.params;

			const { visits } = await getAnalyticsByCode(req, code);

			return { visits };
		},
	});
}
