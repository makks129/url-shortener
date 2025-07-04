import { FastifyRequest } from 'fastify';
import { generateRandomCode } from './code-generator';
import { GoneError, NotFoundError } from '../../errors';
import { SHORT_URL_CODE_LENGTH, SHORT_URL_EXPIRATION_TIME_MS } from '../../configs';

type CreateCodeResponse = {
	code: string;
};

export async function createCodeForUrl(
	req: FastifyRequest,
	url: string,
	oneTime?: boolean,
): Promise<CreateCodeResponse> {
	const code = generateRandomCode(SHORT_URL_CODE_LENGTH);

	await req
		.db('urls')
		.insert({
			original_url: url,
			code,
			one_time: oneTime,
		})
		.onConflict('code')
		.ignore();

	req.log.debug(`Created code for URL: ${JSON.stringify({ url, code, oneTime })}`);

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
			req.log.debug(`URL not found for short link code: ${JSON.stringify({ code })}`);
			throw new NotFoundError();
		}

		const isCodeOlderThan24Hours = new Date(res.created_at).getTime() < Date.now() - SHORT_URL_EXPIRATION_TIME_MS;
		if (isCodeOlderThan24Hours) {
			req.log.debug(
				`Short link is expired: ${JSON.stringify({ code, url: res.original_url, created_at: res.created_at })}`,
			);
			throw new GoneError();
		}

		const alreadyVisitedOneTimeCode = res.one_time && res.visits > 0;
		if (alreadyVisitedOneTimeCode) {
			req.log.debug(
				`One-time short link has already been visited : ${JSON.stringify({
					code,
					url: res.original_url,
					visits: res.visits,
				})}`,
			);
			throw new GoneError();
		}

		await trx('urls').where('code', code).increment('visits', 1);

		return { url: res.original_url };
	});
}

type GetAnalyticsByCodeResponse = {
	visits: number;
};

export async function getAnalyticsByCode(req: FastifyRequest, code: string): Promise<GetAnalyticsByCodeResponse> {
	const res = await req.db('urls').select('visits').where('code', code).first();

	if (!res) {
		req.log.debug(`Analytics not found for short link code: ${JSON.stringify({ code })}`);
		throw new NotFoundError();
	}

	return { visits: res.visits };
}
