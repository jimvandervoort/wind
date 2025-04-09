#!/usr/bin/env bun

import fs from 'fs';
import { Db } from './src/db';
const entries = fs.readdirSync(`${__dirname}/migrations`);
const db = new Db();

async function ensureMigrationsTable() {
  try {
    await db.query(`CREATE TABLE migrations (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL)`);
    console.log('📦 Created migrations table');
  } catch (error) {
    if (error?.message?.includes('relation "migrations" already exists')) {
      return;
    }

    throw error;
  }
}

async function migrate() {
  await ensureMigrationsTable();

  for (const entry of entries) {
    const migration = require(`${__dirname}/migrations/${entry}`);
    const existingRow = await db.queryOne('SELECT * FROM migrations WHERE name = $1', [entry]);
    if (existingRow) {
      console.log(`✅ ${entry} already applied`);
      continue;
    }

    try {
      await migration.up(db);
      await db.query('INSERT INTO migrations (name) VALUES ($1)', [entry]);
      console.log(`✨ ${entry} applied`);
    } catch (error) {
      console.error(`❌ ${entry} failed`);
      console.error(error);
      process.exit(1);
    }
  }

  process.exit(0);
}

migrate();
