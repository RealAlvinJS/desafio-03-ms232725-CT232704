import type { SQLiteDatabase } from 'expo-sqlite';

import type { Ticket } from '@/types/Entity';

interface CacheRow {
  data: string;
}

// La caché solo guarda copias de MockAPI; se descartan si vienen de otra baseURL.
export async function readCachedTickets(db: SQLiteDatabase, baseUrl: string): Promise<Ticket[]> {
  const rows = await db.getAllAsync<CacheRow>(
    'SELECT data FROM tickets_cache WHERE base_url = ?',
    baseUrl,
  );
  return rows.map((row) => JSON.parse(row.data) as Ticket);
}

// Reemplazo total tras un GET exitoso: la caché refleja exactamente el último listado del servidor.
export async function replaceCachedTickets(
  db: SQLiteDatabase,
  baseUrl: string,
  tickets: readonly Ticket[],
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM tickets_cache');
    for (const ticket of tickets) {
      await db.runAsync(
        'INSERT INTO tickets_cache (id, base_url, data) VALUES (?, ?, ?)',
        ticket.id,
        baseUrl,
        JSON.stringify(ticket),
      );
    }
  });
}

export async function upsertCachedTicket(
  db: SQLiteDatabase,
  baseUrl: string,
  ticket: Ticket,
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO tickets_cache (id, base_url, data) VALUES (?, ?, ?)',
    ticket.id,
    baseUrl,
    JSON.stringify(ticket),
  );
}

export async function deleteCachedTicket(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM tickets_cache WHERE id = ?', id);
}

// Un departamento está en uso si algún ticket conocido lo referencia por nombre.
export async function countTicketsInDepartment(db: SQLiteDatabase, name: string): Promise<number> {
  const row = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM tickets_cache WHERE json_extract(data, '$.category') = ? COLLATE NOCASE",
    name.trim(),
  );
  return row?.total ?? 0;
}
