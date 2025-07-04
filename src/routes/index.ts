import { FastifyInstance } from 'fastify';
import { postShorten } from './post-shorten';
import { getGoCode } from './get-go-code';
import { getGoCodeAnalytics } from './get-go-code-analytics';

export async function routes(app: FastifyInstance) {
	await postShorten(app);
	await getGoCode(app);
	await getGoCodeAnalytics(app);
}
