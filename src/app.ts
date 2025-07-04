import fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import db from './plugins/db';

export async function buildApp(): Promise<FastifyInstance> {
	const app = fastify();

	app.withTypeProvider<TypeBoxTypeProvider>();
	app.register(db);

	return app;
}
