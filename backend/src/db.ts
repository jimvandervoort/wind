import { Pool } from 'pg';
import type { JwtPayload } from './types/jwt';

export class User {
  private id: string;
  private email: string;
  private fullname: string;

  constructor({
    id,
    email,
    fullname,
  }: {
    id: string;
    email: string;
    fullname: string;
  }) {
    this.id = id;
    this.email = email;
    this.fullname = fullname;
  }
}

export class Db {
  public pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
    });
  }

  async query(sql: string, params: any[]) {
    const rows = await this.pool.query(sql, params);
    return rows.rows;
  }

  async queryOne(sql: string, params: any[]) {
    const rows = await this.query(sql, params);
    return rows[0];
  }

  async registerUser(jwt: JwtPayload) {
    await this.query('INSERT INTO users (id) VALUES ($1)', [jwt.sub]);
  }

  async userFromJwt(jwt: JwtPayload) {
    const row = await this.queryOne('SELECT * FROM users WHERE id = $1', [jwt.sub]);
    if (!row) {
      await this.registerUser(jwt);
    }

    return new User({
      id: row.id,
      email: row.email,
      fullname: row.fullname,
    });
  }
}
