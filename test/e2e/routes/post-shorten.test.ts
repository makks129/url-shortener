import { startApp, stopApp } from '../init';
import { FastifyInstance } from 'fastify';
import * as urlsManager from '../../../src/managers/urls';

describe('POST /shorten', () => {
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

	it('returns 400 if invalid url is provided', async () => {
		const resp = await app.inject({
			method: 'POST',
			url: '/shorten',
			payload: {
				url: 'invalid-url',
			},
		});

		expect(resp.statusCode).toBe(400);
	});

	it('returns 500 on server error', async () => {
		jest.spyOn(urlsManager, 'createCodeForUrl').mockImplementation(() => {
			throw new Error('Server error');
		});

		const validUrl = 'http://www.example.com';
		const resp = await app.inject({
			method: 'POST',
			url: '/shorten',
			payload: {
				url: validUrl,
			},
		});

		expect(resp.statusCode).toBe(500);
	});

	it('returns 200 when generates a random code for a valid url', async () => {
		const validUrl = 'http://www.example.com';
		const resp = await app.inject({
			method: 'POST',
			url: '/shorten',
			payload: {
				url: validUrl,
			},
		});

		// Checking API response
		expect(resp.statusCode).toBe(200);
		const json = await resp.json();
		expect(json.code.length).toBe(6);

		// Checking correct data in DB
		const queryRes = await app.db('urls').select('code').where('original_url', validUrl).first();

		expect(json.code).toEqual(queryRes.code);
	});
});
