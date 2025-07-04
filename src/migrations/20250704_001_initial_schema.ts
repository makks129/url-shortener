import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('urls', (table) => {
		table.increments('id').primary();
		table.string('original_url').notNullable();
		table.string('code', 6).notNullable().unique().index();
		table.boolean('one_time').defaultTo(false);
		table.integer('visits').unsigned().defaultTo(0);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('urls');
}
