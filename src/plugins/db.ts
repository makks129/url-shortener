import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import knex, { Knex } from 'knex';
import path from 'path';

declare module 'fastify' {
	interface FastifyInstance {
		db: Knex;
	}

	interface FastifyRequest {
		db: Knex;
	}
}

async function plugin(fastify: FastifyInstance) {
	const knexInstance = knex({
		client: 'mysql2',
		connection: {
			host: process.env.DB_HOST,
			port: Number(process.env.DB_PORT),
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
		},
		pool: {
			min: 2,
			max: 10,
		},
		// debug: process.env.NODE_ENV === 'development',
	});

	// Add knex instance to fastify
	fastify.decorate('db', knexInstance);

	// Decorate request with db instance
	fastify.decorateRequest('db', {
		getter: () => knexInstance,
	});

	// Run migrations
	await knexInstance.migrate.latest({
		directory: path.join(__dirname, '../migrations'),
		loadExtensions: [process.env.NODE_ENV === 'test' ? '.ts' : '.js'],
	});

	// Close the connection when Fastify shuts down
	fastify.addHook('onClose', async (app) => {
		fastify.log.info('Closing database connections');
		await app.db.destroy();
	});
}

export default fp(plugin, {
	name: 'db',
	dependencies: [],
});
