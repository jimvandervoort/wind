import { Pool } from 'pg';

interface Spotlist {
  id: string;
  userId: string;
  spots: string[];
}

export class SpotlistRepository {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async create(userId: string, spots: string[], name: string): Promise<Spotlist> {
    return this.db.queryOne('INSERT INTO spotlists (user_id, spots, name) VALUES ($1, $2, $3) RETURNING *', [
      userId,
      spots,
      name,
    ]);
  }

  async update(userId: string, id: string, spots: string[], name: string): Promise<Spotlist> {
    return this.db.queryOne('UPDATE spotlists SET spots = $1, name = $2 WHERE user_id = $3 AND id = $4 RETURNING *', [
      spots,
      name,
      userId,
      id,
    ]);
  }

  async findByUserId(userId: string): Promise<Spotlist | null> {
    const spotlist = await this.db.queryOne('SELECT * FROM spotlists WHERE user_id = $1', [userId]);
    return spotlist ? new Spotlist(spotlist) : null;
  }
}

export class Db {
  private pool: Pool;
  public spotlistRepository: SpotlistRepository;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
    });

    this.spotlistRepository = new SpotlistRepository(this);
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

    return rows[0];
  }
}
