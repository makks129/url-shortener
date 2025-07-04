import fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import db from './plugins/db';
import rateLimiter from './plugins/rate-limiter';
import { routes } from './routes';
import { DEFAULT_RATE_LIMITS_REQS } from './configs';

export async function buildApp(): Promise<FastifyInstance> {
	const app = fastify();

	app.withTypeProvider<TypeBoxTypeProvider>();

	app.register(db);

	app.register(rateLimiter, {
		defaults: {
			maxReqPerInverval: DEFAULT_RATE_LIMITS_REQS,
		},
	});

	app.register(routes);

	return app;
}
