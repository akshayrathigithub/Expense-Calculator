import { getDb } from "./db";
import { nanoid } from "nanoid";

export async function getUsers(): Promise<
  Array<{ id: string; displayName: string; createdAt: number }>
> {
  const db = await getDb();
  const rows = (await db.select(
    "SELECT id, display_name AS displayName, created_at AS createdAt FROM users ORDER BY created_at ASC"
  )) as Array<{ id: string; displayName: string; createdAt: number }>;
  return rows ?? [];
}

export async function getSelectedUser(): Promise<string | null> {
  const db = await getDb();
  const rows = (await db.select(
    "SELECT selected_user_id FROM meta WHERE id = 1"
  )) as Array<{ selected_user_id: string | null }>;
  return rows.length ? rows[0].selected_user_id ?? null : null;
}

export async function setSelectedUserId(userId: string | null): Promise<void> {
  const db = await getDb();
  // Upsert the singleton row
  if (userId) {
    await db.execute(
      "INSERT INTO meta (id, selected_user_id) VALUES (1, $1) ON CONFLICT(id) DO UPDATE SET selected_user_id = excluded.selected_user_id",
      [userId]
    );
  } else {
    await db.execute(
      "INSERT INTO meta (id, selected_user_id) VALUES (1, NULL) ON CONFLICT(id) DO UPDATE SET selected_user_id = NULL"
    );
  }
}

export async function createUser(displayName: string): Promise<string> {
  const db = await getDb();
  const id = nanoid();
  await db.execute(
    "INSERT INTO users (id, display_name, email, created_at, updated_at) VALUES ($1, $2, NULL, unixepoch(), unixepoch())",
    [id, displayName]
  );
  return id;
}

export async function getOnboardingStatus(): Promise<boolean> {
  const db = await getDb();
  const rows = (await db.select(
    "SELECT onboarding_completed FROM meta WHERE id = 1"
  )) as Array<{ onboarding_completed: number | null }>;
  return rows.length ? !!rows[0].onboarding_completed : false;
}

export async function setOnboardingStatus(completed: boolean): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE meta SET onboarding_completed = $1 WHERE id = 1", [
    completed ? 1 : 0,
  ]);
}
