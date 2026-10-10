import type { SQLiteDatabase } from 'expo-sqlite';

import { DEFAULT_DEPARTMENTS } from '@/constants/tickets';

type Migration = (db: SQLiteDatabase) => Promise<void>;

// Cada índice es una versión del esquema; nunca se edita una migración ya publicada, se agrega otra.
const MIGRATIONS: readonly Migration[] = [
  async (db) => {
    await db.execAsync(`
      CREATE TABLE departments (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL UNIQUE COLLATE NOCASE,
        created_at TEXT NOT NULL
      );

      CREATE TABLE tickets_cache (
        id       TEXT PRIMARY KEY,
        base_url TEXT NOT NULL,
        data     TEXT NOT NULL
      );
    `);

    // Los departamentos por defecto solo se insertan al crear la base; luego son del usuario.
    const now = new Date().toISOString();
    for (const name of DEFAULT_DEPARTMENTS) {
      await db.runAsync('INSERT INTO departments (name, created_at) VALUES (?, ?)', name, now);
    }
  },
];

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  for (const [index, migrate] of MIGRATIONS.entries()) {
    const version = index + 1;
    if (version <= currentVersion) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      await migrate(db);
      await db.execAsync(`PRAGMA user_version = ${version}`);
    });
  }
}
