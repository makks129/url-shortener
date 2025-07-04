import { Static, Type } from '@fastify/type-provider-typebox';

export const PostShortenBody = Type.Object({
	url: Type.String({ format: 'uri' }),
});

export const PostShortenResponse = Type.Object({
	code: Type.String({ minLength: 6, maxLength: 6 }),
});

// Types

export type PostShortenBody = Static<typeof PostShortenBody>;
export type PostShortenResponse = Static<typeof PostShortenResponse>;
