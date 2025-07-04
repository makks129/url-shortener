import { FastifyRequest } from 'fastify';
import { generateRandomCode } from './code-generator';
import { NotFoundError } from '../../errors';

const CODE_LENGTH = 6;

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
	const res = await req.db('urls').select('original_url').where('code', code).first();

	if (!res) {
		throw new NotFoundError();
	}

	return { url: res.original_url };
}
