import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import NodeCache from 'node-cache';
import { TooManyRequestsError } from '../errors';
import { RATE_LIMITER_INTERVAL_MS } from '../configs';

// Declare the custom schema property for Fastify routes
declare module 'fastify' {
	interface FastifySchema {
		rateLimits?: {
			maxReqPerInverval?: number;
		};
	}
}

interface RateLimiterOptions {
	// Default rate limit if not specified in the route
	defaults: {
		maxReqPerInverval: number;
	};
}

type RateLimiterCounter = {
	count: number;
	resetTime: number;
};

async function plugin(fastify: FastifyInstance, options: RateLimiterOptions) {
	const cache = new NodeCache({
		stdTTL: RATE_LIMITER_INTERVAL_MS, // TTL
		checkperiod: RATE_LIMITER_INTERVAL_MS, // Auto-cleanup every interval
		useClones: false, // Store/retrieve without cloning for better performance
	});

	// Add a hook to check rate limits before handling each request
	fastify.addHook('preHandler', async (req: FastifyRequest, reply: FastifyReply) => {
		// Check route schema definition to find rate limits
		const { schema } = req.routeOptions;
		if (!schema || !schema.rateLimits) {
			// No rate limits defined for this route
			return;
		}

		// Saving rate limit by IP address
		const key = req.ip || 'unknown';
		// Get rate limit value for this endpoint
		const maxReqPerInverval = schema.rateLimits.maxReqPerInverval || options.defaults.maxReqPerInverval;

		// Manage counter for this key
		let counter = cache.get<RateLimiterCounter>(key);

		if (!counter) {
			counter = {
				count: 1,
				resetTime: Date.now() + RATE_LIMITER_INTERVAL_MS,
			};
		}

		// Add rate limit headers
		reply.header('X-RateLimit-Limit', maxReqPerInverval);
		reply.header('X-RateLimit-Remaining', Math.max(0, maxReqPerInverval - counter.count));
		reply.header('X-RateLimit-Reset', Math.ceil(counter.resetTime / 1000));

		// Check if rate limit exceeded, throw 429
		if (counter.count > maxReqPerInverval) {
			req.log.debug(`Rate limit reached!: ${JSON.stringify({ url: req.url, ip: req.ip })}`);
			fastify.customMetrics.rateLimit429Counter.inc({ path: req.url });
			throw new TooManyRequestsError();
		}

		// Otherwise increment the counter
		counter.count++;
		cache.set(key, counter);
	});

	fastify.addHook('onClose', () => {
		// When fastify closes, close the cache
		cache.close();
	});
}

export default fp(plugin, {
	name: 'rate-limiter',
	dependencies: [],
});
