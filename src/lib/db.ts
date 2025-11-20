import Database from "@tauri-apps/plugin-sql";

let dbPromise: Promise<Database> | null = null;

export function isTauri(): boolean {
  return !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
}

export async function getDb(): Promise<Database> {
  if (!isTauri()) {
    throw new Error("Database is only available inside Tauri runtime.");
  }
  if (!dbPromise) {
    dbPromise = Database.load("sqlite:expenses.db");
  }
  return dbPromise;
}

export async function closeDb(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    await db.close();
    dbPromise = null;
  }
}
