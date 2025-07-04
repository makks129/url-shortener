import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';

export async function startApp(): Promise<FastifyInstance> {
	const app = await buildApp();

	await app.ready();
	// Clear the database before starting tests
	await app.db('urls').truncate();

	return app;
}

export async function stopApp(app: FastifyInstance): Promise<void> {
	await app.db('urls').truncate();
	await app.close();
}
