import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';

export async function startApp(): Promise<FastifyInstance> {
	const app = await buildApp();

	await app.ready();

	return app;
}

export async function stopApp(app: FastifyInstance): Promise<void> {
	await app.close();
}
