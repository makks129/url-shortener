import { startApp, stopApp } from '../init';
import { FastifyInstance } from 'fastify';

const TEST_ROUTE_RATE_LIMIT = 3;

describe('plugins/rate-limiter', () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		app = await startApp(async (app) => {
			// Define GET /test route to test rate limiting
			app.get<{}>('/test', {
				schema: {
					response: { 200: {} },
					rateLimits: {
						maxReqPerInverval: TEST_ROUTE_RATE_LIMIT,
					},
				},
				handler: async () => 'ok',
			});
		});

		return app;
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

	it('returns 200 before rate limit is applied and 429 when it is exceeded', async () => {
		for (let i = 0; i < TEST_ROUTE_RATE_LIMIT; i++) {
			const resp = await app.inject({ method: 'GET', url: '/test' });
			expect(resp.statusCode).toBe(200);
		}

		const resp = await app.inject({ method: 'GET', url: '/test' });
		expect(resp.statusCode).toBe(429);
	});
});
