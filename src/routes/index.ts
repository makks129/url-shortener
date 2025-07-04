import { FastifyInstance } from 'fastify';
import { postShorten } from './post-shorten';

export async function routes(app: FastifyInstance) {
	await postShorten(app);
}
