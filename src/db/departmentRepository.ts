import type { SQLiteDatabase } from 'expo-sqlite';

import type { Department } from '@/types/Entity';

interface DepartmentRow {
  id: number;
  name: string;
  created_at: string;
}

function toDepartment(row: DepartmentRow): Department {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export async function listDepartments(db: SQLiteDatabase): Promise<Department[]> {
  const rows = await db.getAllAsync<DepartmentRow>(
    'SELECT id, name, created_at FROM departments ORDER BY name COLLATE NOCASE',
  );
  return rows.map(toDepartment);
}

// Los nombres son únicos sin distinguir mayúsculas; al renombrar se ignora el propio registro.
export async function isDepartmentNameTaken(
  db: SQLiteDatabase,
  name: string,
  excludeId?: number,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM departments WHERE name = ? COLLATE NOCASE AND id != ?',
    name.trim(),
    excludeId ?? -1,
  );
  return row !== null;
}

export async function insertDepartment(db: SQLiteDatabase, name: string): Promise<Department> {
  const createdAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO departments (name, created_at) VALUES (?, ?)',
    name.trim(),
    createdAt,
  );
  return { id: result.lastInsertRowId, name: name.trim(), createdAt };
}

export async function renameDepartment(
  db: SQLiteDatabase,
  id: number,
  name: string,
): Promise<void> {
  await db.runAsync('UPDATE departments SET name = ? WHERE id = ?', name.trim(), id);
}

export async function deleteDepartment(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM departments WHERE id = ?', id);
}
