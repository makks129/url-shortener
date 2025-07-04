import { Static, Type } from '@fastify/type-provider-typebox';

export const PostShortenBody = Type.Object({
	url: Type.String({ format: 'uri' }),
	one_time: Type.Optional(Type.Boolean()),
});

export const PostShortenResponse = Type.Object({
	code: Type.String({ minLength: 6, maxLength: 6 }),
});

export const GetGoCodeParams = Type.Object({
	code: Type.String({ minLength: 6, maxLength: 6 }),
});

export const GetGoCodeAnalyticsParams = Type.Object({
	code: Type.String({ minLength: 6, maxLength: 6 }),
});

export const GetGoCodeAnalyticsResponse = Type.Object({
	visits: Type.Integer(),
});

// Types

export type PostShortenBody = Static<typeof PostShortenBody>;
export type PostShortenResponse = Static<typeof PostShortenResponse>;
export type GetGoCodeParams = Static<typeof GetGoCodeParams>;
export type GetGoCodeAnalyticsParams = Static<typeof GetGoCodeAnalyticsParams>;
export type GetGoCodeAnalyticsResponse = Static<typeof GetGoCodeAnalyticsResponse>;
