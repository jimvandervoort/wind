import type { Db } from '../src/db';

export async function up(db: Db) {
  await db.query(`
    CREATE TABLE spotlists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      spots TEXT[] NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id, user_id)
    );
  `);
}
