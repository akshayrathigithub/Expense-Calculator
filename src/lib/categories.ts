import { getDb } from "./db";

export type TreeNode = {
  id: string;
  name: string;
  children?: Record<string, TreeNode>;
};

type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
};

type EdgeRow = {
  ancestor: string;
  descendant: string;
  depth: number;
};

/**
 * Fetches all categories and parent-child relations (depth=1) for a user
 * and builds a nested tree keyed by root ids.
 */
export async function fetchCategoryTree(
  userId: string
): Promise<Record<string, TreeNode>> {
  const db = await getDb();

  const categories = (await db.select(
    "SELECT id, user_id, name FROM categories WHERE user_id = $1",
    [userId]
  )) as CategoryRow[];

  if (categories.length === 0) return {};

  const edges = (await db.select(
    "SELECT ancestor, descendant, depth FROM category_closure WHERE user_id = $1 AND depth = 1",
    [userId]
  )) as EdgeRow[];

  const idToNode: Record<string, TreeNode> = {};
  for (const c of categories) {
    idToNode[c.id] = { id: c.id, name: c.name, children: {} };
  }

  const childToParent: Record<string, string> = {};
  for (const e of edges) {
    childToParent[e.descendant] = e.ancestor;
  }

  // Attach children to parents
  for (const childId of Object.keys(childToParent)) {
    const parentId = childToParent[childId];
    const parent = idToNode[parentId];
    const child = idToNode[childId];
    if (!parent || !child) continue;
    if (!parent.children) parent.children = {};
    parent.children[childId] = child;
  }

  // Roots are categories that are never a descendant (at depth=1)
  const roots: Record<string, TreeNode> = {};
  const descendants = new Set(Object.keys(childToParent));
  for (const c of categories) {
    if (!descendants.has(c.id)) {
      roots[c.id] = idToNode[c.id];
    }
  }
  // If every node has a parent (cyclic/malformed), fallback to all as roots
  if (Object.keys(roots).length === 0) {
    for (const c of categories) roots[c.id] = idToNode[c.id];
  }
  return roots;
}

/**
 * Create a new category. If parentId is provided, it links the new node under
 * the parent using the closure table. Returns the created category id.
 */
export async function createCategory(
  userId: string,
  name: string,
  categoryId: string,
  parentId?: string
): Promise<string> {
  const db = await getDb();
  const id = categoryId;
  try {
    await db.execute("BEGIN");
    await db.execute(
      "INSERT INTO categories (id, user_id, name, slug, created_at, updated_at) VALUES ($1, $2, $3, NULL, unixepoch(), unixepoch())",
      [id, userId, name]
    );
    // self link
    await db.execute(
      "INSERT INTO category_closure (user_id, ancestor, descendant, depth) VALUES ($1, $2, $2, 0)",
      [userId, id]
    );

    if (parentId) {
      // inherit all ancestors from parent (including the parent itself)
      await db.execute(
        `INSERT INTO category_closure (user_id, ancestor, descendant, depth)
         SELECT $1 AS user_id, ancestor, $2 AS descendant, depth + 1
         FROM category_closure
         WHERE user_id = $1 AND descendant = $3`,
        [userId, id, parentId]
      );
    }
    await db.execute("COMMIT");
    return id;
  } catch (e) {
    await db.execute("ROLLBACK");
    throw e;
  }
}

/**
 * Rename an existing category.
 */
export async function updateCategoryName(
  userId: string,
  categoryId: string,
  newName: string
): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE categories SET name = $1, updated_at = unixepoch() WHERE id = $2 AND user_id = $3",
    [newName, categoryId, userId]
  );
}

/**
 * Delete a category and all of its descendants (subtree).
 * Thanks to FK cascades, removing from categories will clean up closure rows.
 */
export async function deleteCategorySubtree(
  userId: string,
  categoryId: string
): Promise<void> {
  const db = await getDb();
  // Fetch all descendants including the node itself (depth >= 0)
  const rows = (await db.select(
    "SELECT descendant FROM category_closure WHERE user_id = $1 AND ancestor = $2",
    [userId, categoryId]
  )) as Array<{ descendant: string }>;
  if (!rows.length) return;
  try {
    await db.execute("BEGIN");
    for (const r of rows) {
      await db.execute(
        "DELETE FROM categories WHERE user_id = $1 AND id = $2",
        [userId, r.descendant]
      );
    }
    await db.execute("COMMIT");
  } catch (e) {
    await db.execute("ROLLBACK");
    throw e;
  }
}
