import type { Db } from '../src/db';

export async function up(db: Db) {
  await db.query(`
    CREATE TABLE myspots (
      user_id UUID PRIMARY KEY NOT NULL,
      slugs TEXT[] NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
