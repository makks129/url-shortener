import fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import db from './plugins/db';
import { routes } from './routes';

export async function buildApp(): Promise<FastifyInstance> {
	const app = fastify();

	app.withTypeProvider<TypeBoxTypeProvider>();
	app.register(db);
	app.register(routes);

	return app;
}
