import { Pool } from 'pg';

interface MySpots {
  user_id: string;
  slugs: string[];
  created_at: Date;
  updated_at: Date;
}

export class MySpotsRepository {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async updateOrCreate(userId: string, slugs: string[]): Promise<MySpots | null> {
    console.log({slugs})
    return this.db.queryOne(`
      INSERT INTO myspots (user_id, slugs) VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET slugs = $2, updated_at = CURRENT_TIMESTAMP;
    `, [userId, slugs]);
  }

  async findByUserId(userId: string): Promise<MySpots | null> {
    return await this.db.queryOne('SELECT * FROM myspots WHERE user_id = $1', [userId]);
  }
}

export class Db {
  private pool: Pool;
  public myspotsRepository: MySpotsRepository;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.WIND_DB_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
    });

    this.myspotsRepository = new MySpotsRepository(this);
  }

  async query(sql: string, params: any[] = []) {
    const rows = await this.pool.query(sql, params);
    return rows.rows;
  }

  async queryOne(sql: string, params: any[]) {
    const rows = await this.query(sql, params);
    if (rows.length > 1) {
      throw new Error('Expected 1 row from queryOne, got ' + rows.length);
    }

    return rows[0] || null;
  }
}
