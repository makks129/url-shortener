import { FastifyRequest } from 'fastify';
import { generateRandomCode } from './code-generator';

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
