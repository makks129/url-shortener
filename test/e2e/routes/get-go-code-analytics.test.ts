import { startApp, stopApp } from '../init';
import { FastifyInstance } from 'fastify';
import * as urlsManager from '../../../src/managers/urls';

describe('GET /go/:code/analytics', () => {
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

	it('returns 400 if invalid code is provided', async () => {
		const resp = await app.inject({
			method: 'GET',
			url: '/go/1234567/analytics', // Invalid code (too long)
		});

		expect(resp.statusCode).toBe(400);
	});

	it('returns 500 on server error', async () => {
		jest.spyOn(urlsManager, 'getAnalyticsByCode').mockImplementation(() => {
			throw new Error('Server error');
		});

		const resp = await app.inject({
			method: 'GET',
			url: '/go/123456/analytics', // valid code
		});

		expect(resp.statusCode).toBe(500);
	});

	it('returns 200 and analytics for a valid code', async () => {
		const validUrl = 'http://www.example.com';
		const postShortenResp = await app.inject({
			method: 'POST',
			url: '/shorten',
			payload: {
				url: validUrl,
			},
		});
		const postShortenJson = await postShortenResp.json();

		// Visit the short link 1 time
		await app.inject({
			method: 'GET',
			url: `/go/${postShortenJson.code}`,
		});

		const resp = await app.inject({
			method: 'GET',
			url: `/go/${postShortenJson.code}/analytics`,
		});

		// Checking API response
		expect(resp.statusCode).toBe(200);
		const json = await resp.json();
		expect(json.visits).toBe(1); // link visited 1 time
	});
});
