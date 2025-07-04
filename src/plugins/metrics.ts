import { FastifyInstance } from 'fastify';
import fastifyMetrics from 'fastify-metrics';
import fp from 'fastify-plugin';
import client from 'prom-client';

export const customMetrics = {
	urlShortenCounter: new client.Counter({
		name: 'url_shortener_generated_total',
		help: 'Total number of shortened URLs generated',
		labelNames: ['one_time'] as const,
	}),
	urlAccessCounter: new client.Counter({
		name: 'url_shortener_access_total',
		help: 'Total number of shortened URL accesses',
		labelNames: ['status'] as const,
	}),
	urlAnalyticsAccessCounter: new client.Counter({
		name: 'url_shortener_analytics_access_total',
		help: 'Total number of shortened URL analytics accesses',
		labelNames: ['status'] as const,
	}),
	rateLimit429Counter: new client.Counter({
		name: 'url_shortener_rate_limit_exceeded_total',
		help: 'Total number of rate limit exceeded responses',
		labelNames: ['path'] as const,
	}),
};

export interface CustomMetrics {
	urlShortenCounter: client.Counter<'one_time'>;
	urlAccessCounter: client.Counter<'status'>; // Not adding code here as label here as it will explode cardinality of metrics
	urlAnalyticsAccessCounter: client.Counter<'status'>; // Not adding code here as label here as it will explode cardinality of metrics
	rateLimit429Counter: client.Counter<'path'>;
}

// Register the plugin
async function plugin(fastify: FastifyInstance) {
	// Register the metrics plugin - this will automatically add the /metrics endpoint
	await fastify.register(fastifyMetrics, {
		endpoint: '/metrics',
		routeMetrics: {
			enabled: true,
		},
	});

	// Add a decorator to access custom metrics throughout the application
	fastify.decorate('customMetrics', customMetrics);
}

// Add TypeScript type definitions
declare module 'fastify' {
	interface FastifyInstance {
		customMetrics: CustomMetrics;
	}
}

export default fp(plugin, {
	name: 'metrics',
	dependencies: [],
});
