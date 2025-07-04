import { startApp, stopApp } from '../init';
import { FastifyInstance } from 'fastify';
import * as urlsManager from '../../../src/managers/urls';

describe('GET /go/:code', () => {
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
			url: '/go/1234567', // Invalid code (too long)
		});

		expect(resp.statusCode).toBe(400);
	});

	it('returns 500 on server error', async () => {
		jest.spyOn(urlsManager, 'getUrlByCode').mockImplementation(() => {
			throw new Error('Server error');
		});

		const resp = await app.inject({
			method: 'GET',
			url: '/go/123456', // valid code
		});

		expect(resp.statusCode).toBe(500);
	});

	it('returns 302 to redirect to original url by valid code', async () => {
		const validUrl = 'http://www.example.com';
		const postShortenResp = await app.inject({
			method: 'POST',
			url: '/shorten',
			payload: {
				url: validUrl,
			},
		});
		const postShortenJson = await postShortenResp.json();

		// Check that visits are initially 0
		const query1Res = await app.db('urls').select('visits').where('code', postShortenJson.code).first();
		expect(query1Res.visits).toEqual(0);

		const resp = await app.inject({
			method: 'GET',
			url: `/go/${postShortenJson.code}`,
		});

		// Checking API response
		expect(resp.statusCode).toBe(302);
		expect(resp.headers.location).toBe(validUrl);

		// Checking that visits are incremented as well
		const query2Res = await app.db('urls').select('visits').where('code', postShortenJson.code).first();
		expect(query2Res.visits).toEqual(1);
	});

	it('returns 410 when the link is expired', async () => {
		const validUrl = 'http://www.example-expired.com';
		const postShortenResp = await app.inject({
			method: 'POST',
			url: '/shorten',
			payload: {
				url: validUrl,
			},
		});
		const postShortenJson = await postShortenResp.json();

		// Set created_at to more than 24 hours ago (25 hours)
		const pastDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
		await app.db('urls').where('code', postShortenJson.code).update({
			created_at: pastDate,
		});

		// Now try to access the expired link
		const resp = await app.inject({
			method: 'GET',
			url: `/go/${postShortenJson.code}`,
		});

		expect(resp.statusCode).toBe(410);
	});

	it('returns 302 and then 410 when one-time link is visited twice', async () => {
		const validUrl = 'http://www.example.com';
		const postShortenResp = await app.inject({
			method: 'POST',
			url: '/shorten',
			payload: {
				url: validUrl,
				one_time: true, // Make it a one-time link!
			},
		});
		const postShortenJson = await postShortenResp.json();

		// Access one-time link once
		const get1 = await app.inject({
			method: 'GET',
			url: `/go/${postShortenJson.code}`,
		});

		expect(get1.statusCode).toBe(302);

		// Access one-time link twice
		const get2 = await app.inject({
			method: 'GET',
			url: `/go/${postShortenJson.code}`,
		});

		expect(get2.statusCode).toBe(410);
	});
});
