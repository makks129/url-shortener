import { FastifyRequest } from 'fastify';
import { generateRandomCode } from './code-generator';
import { GoneError, NotFoundError } from '../../errors';

const CODE_LENGTH = 6;
const SHORT_URL_EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours

type CreateCodeResponse = {
	code: string;
};

export async function createCodeForUrl(req: FastifyRequest, url: string): Promise<CreateCodeResponse> {
	const code = generateRandomCode(CODE_LENGTH);

	await req
		.db('urls')
		.insert({
			original_url: url,
			code,
		})
		.onConflict('code')
		.ignore();

	return { code };
}

type GetUrlByCodeResponse = {
	url: string;
};

export async function getUrlByCode(req: FastifyRequest, code: string): Promise<GetUrlByCodeResponse> {
	const res = await req.db('urls').select('original_url', 'created_at').where('code', code).first();

	if (!res) {
		throw new NotFoundError();
	}

	const isCodeOlderThan24Hours = new Date(res.created_at).getTime() < Date.now() - SHORT_URL_EXPIRATION_TIME_MS;
	if (isCodeOlderThan24Hours) {
		throw new GoneError();
	}

	return { url: res.original_url };
}
