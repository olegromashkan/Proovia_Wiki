import { getDb } from "./sqlite";

export type Department = { id: number; name: string };

export function listDepartments(): Department[] {
  const db = getDb();
  const rows = db.prepare(`SELECT id, name FROM departments ORDER BY name ASC`).all() as Department[];
  return rows;
}

export function addDepartment(name: string): Department {
  const db = getDb();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("name required");
  db.prepare(`INSERT INTO departments(name) VALUES(?)`).run(trimmed);
  const dep = db.prepare(`SELECT id, name FROM departments WHERE name = ?`).get(trimmed) as Department;
  return dep;
}

export function deleteDepartment(id: number): void {
  const db = getDb();
  db.prepare(`DELETE FROM departments WHERE id = ?`).run(id);
}

