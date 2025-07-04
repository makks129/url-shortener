import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';

export async function startApp(onBeforeReady?: (app: FastifyInstance) => Promise<void>): Promise<FastifyInstance> {
	const app = await buildApp();

	// Allow tests to optionally modify app before it is ready
	await onBeforeReady?.(app);

	await app.ready();

	// Clear the database before starting tests
	await app.db('urls').truncate();

	return app;
}

export async function stopApp(app: FastifyInstance): Promise<void> {
	await app.db('urls').truncate();
	await app.close();
}
