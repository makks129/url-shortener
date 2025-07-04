import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

// Declare the custom schema property for Fastify routes
declare module 'fastify' {
	interface FastifySchema {
		rateLimits?: {
			maxReqPerMin?: number;
		};
	}
}

interface RateLimiterOptions {
	// Default rate limit if not specified in the route
	defaults: {
		maxReqPerMin: number;
	};
}

// Simple in-memory store for rate limiting counters
interface RateLimitCounter {
	count: number;
	resetTime: number;
}

// In-memory storage for rate limit counters
const counters = new Map<string, RateLimitCounter>();

// Create a key from IP and the current minute window
function createRateLimitKey(ip: string): string {
	const currentMinuteWindow = Math.floor(Date.now() / 60000);
	return `${ip}:${currentMinuteWindow}`;
}

// Clean up old counters periodically (every minute)
function startCleanupInterval(): NodeJS.Timeout {
	return setInterval(() => {
		const currentTime = Date.now();
		for (const [key, counter] of counters.entries()) {
			if (counter.resetTime < currentTime) {
				counters.delete(key);
			}
		}
	}, 60000); // Run cleanup every minute
}

async function plugin(fastify: FastifyInstance, options: RateLimiterOptions) {
	const cleanupInterval = startCleanupInterval();

	// When fastify closes, clear the cleanup interval
	fastify.addHook('onClose', () => {
		clearInterval(cleanupInterval);
	});

	// Add a hook to check rate limits before handling each request
	fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
		// Get the route's schema-defined rate limits or use defaults
		const routeOpts = request.routeOptions;
		if (!routeOpts.schema || !routeOpts.schema.rateLimits) {
			// No rate limits defined for this route
			return;
		}

		const rateLimits = routeOpts.schema.rateLimits;
		const maxReqPerMin = rateLimits.maxReqPerMin || options.defaults.maxReqPerMin;

		// Get client IP
		const ip = request.ip || 'unknown';
		const key = createRateLimitKey(ip);

		// Get or create counter for this IP and time window
		let counter = counters.get(key);
		if (!counter) {
			counter = {
				count: 0,
				resetTime: Date.now() + 60000, // Reset after 1 minute
			};
			counters.set(key, counter);
		}

		// Increment counter
		counter.count++;

		// Check if rate limit exceeded
		if (counter.count > maxReqPerMin) {
			// Return 429 Too Many Requests
			reply.status(429).send({
				statusCode: 429,
				error: 'Too Many Requests',
				message: `Rate limit exceeded. Try again in ${Math.ceil(
					(counter.resetTime - Date.now()) / 1000,
				)} seconds.`,
			});
			throw new Error('Rate limit exceeded');
		}

		// Add rate limit headers
		reply.header('X-RateLimit-Limit', maxReqPerMin);
		reply.header('X-RateLimit-Remaining', Math.max(0, maxReqPerMin - counter.count));
		reply.header('X-RateLimit-Reset', Math.ceil(counter.resetTime / 1000));
	});
}

export default fp(plugin, {
	name: 'rate-limiter',
	dependencies: [],
});
