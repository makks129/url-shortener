import { startApp, stopApp } from './init';
import { FastifyInstance } from 'fastify';

describe('STUB', () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		app = await startApp();
	});
	afterAll(async () => {
		await stopApp(app);
	});
	beforeEach(() => {
		jest.clearAllMocks();
	});
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('STUB', async () => {
		// To call Fastify routes use:
		// await app.inject({ method: 'GET', url: '/stub', payload: {} });

		// To mock implementation of a function:
		// jest.spyOn(app, 'someFunction').mockImplementation(() => {});

		expect(1).toBe(1);
	});
});
