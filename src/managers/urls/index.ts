import { FastifyRequest } from 'fastify';
import { generateRandomCode } from './code-generator';

type CreateCodeResponse = {
	code: string;
};

export async function createCodeForUrl(req: FastifyRequest, url: string): Promise<CreateCodeResponse> {
	const code = generateRandomCode(6);

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
