import { FastifyRequest } from 'fastify';
import { generateRandomCode } from './code-generator';
import { GoneError, NotFoundError } from '../../errors';

const CODE_LENGTH = 6;
const SHORT_URL_EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours

type CreateCodeResponse = {
	code: string;
};

export async function createCodeForUrl(
	req: FastifyRequest,
	url: string,
	oneTime?: boolean,
): Promise<CreateCodeResponse> {
	const code = generateRandomCode(CODE_LENGTH);

	await req
		.db('urls')
		.insert({
			original_url: url,
			code,
			one_time: oneTime,
		})
		.onConflict('code')
		.ignore();

	return { code };
}

type GetUrlByCodeResponse = {
	url: string;
};

export async function getUrlByCode(req: FastifyRequest, code: string): Promise<GetUrlByCodeResponse> {
	// Use a transaction to ensure atomicity
	// Lock the row for update before we finish incrementing visits
	// This is needed in case multiple requests try to access the same code (especially one-time code) at the same time
	return req.db.transaction(async (trx) => {
		const res = await trx('urls')
			.select('original_url', 'created_at', 'one_time', 'visits')
			.where('code', code)
			.forUpdate() // locks the row for update
			.first();

		if (!res) {
			throw new NotFoundError();
		}

		const isCodeOlderThan24Hours = new Date(res.created_at).getTime() < Date.now() - SHORT_URL_EXPIRATION_TIME_MS;
		if (isCodeOlderThan24Hours) {
			throw new GoneError();
		}

		const alreadyVisitedOneTimeCode = res.one_time && res.visits > 0;
		if (alreadyVisitedOneTimeCode) {
			throw new GoneError();
		}

		await trx('urls').where('code', code).increment('visits', 1);

		return { url: res.original_url };
	});
}
