import { ExpenseForm } from "@src/store/type";
import { getDb } from "./db";
import { nanoid } from "nanoid";

export async function addExpense(
  formValues: ExpenseForm,
  userId: string
): Promise<void> {
  const db = await getDb();
  const id = nanoid();
  const currency = "INR";
  const { amount, date, note, categories } = formValues;
  const amountCents = Math.round(Number(amount) * 100);
  await db.execute(
    "INSERT INTO expense_entries (id, user_id, amount_cents, currency, note, occurred_at) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, userId, amountCents, currency, note, date]
  );
  for (const category of categories) {
    await db.execute(
      "INSERT INTO expense_categories (expense_id, category_id) VALUES ($1, $2)",
      [id, category]
    );
  }
}

export type ExpenseDetail = {
  id: string;
  amountCents: number;
  currency: string;
  occurredAt: number;
  note: string | null;
  categories: Array<{ id: string; name: string }>;
};

export async function getExpenseDetailsByIds({
  userId,
  expenseIds,
}: {
  userId: string;
  expenseIds: string[];
}): Promise<ExpenseDetail[]> {
  if (!expenseIds.length) {
    return [];
  }

  const normalizedIds = Array.from(
    new Set(expenseIds.filter((id) => typeof id === "string" && id.trim()))
  );

  if (!normalizedIds.length) {
    return [];
  }

  const db = await getDb();
  const idPlaceholders = normalizedIds
    .map((_, idx) => `$${idx + 2}`)
    .join(", ");
  const params = [userId, ...normalizedIds];

  const expenseRows = (await db.select(
    `
    SELECT
      id,
      amount_cents,
      currency,
      occurred_at,
      note
    FROM expense_entries
    WHERE user_id = $1
      AND deleted = 0
      AND id IN (${idPlaceholders})
  `,
    params
  )) as Array<{
    id: string;
    amount_cents: number;
    currency: string;
    occurred_at: number;
    note: string | null;
  }>;

  if (!expenseRows.length) {
    return [];
  }

  const categoryRows = (await db.select(
    `
    SELECT
      ec.expense_id,
      c.id AS category_id,
      c.name AS category_name
    FROM expense_categories ec
    INNER JOIN categories c ON c.id = ec.category_id
    WHERE c.user_id = $1
      AND ec.expense_id IN (${idPlaceholders})
  `,
    params
  )) as Array<{
    expense_id: string;
    category_id: string;
    category_name: string;
  }>;

  const categoryMap = new Map<string, Array<{ id: string; name: string }>>();
  for (const row of categoryRows) {
    if (!categoryMap.has(row.expense_id)) {
      categoryMap.set(row.expense_id, []);
    }
    categoryMap.get(row.expense_id)!.push({
      id: row.category_id,
      name: row.category_name,
    });
  }

  const expenseRowMap = new Map<string, ExpenseDetail>();
  for (const row of expenseRows) {
    expenseRowMap.set(row.id, {
      id: row.id,
      amountCents: Number(row.amount_cents),
      currency: row.currency,
      occurredAt: Number(row.occurred_at) * 1000,
      note: row.note ?? null,
      categories: categoryMap.get(row.id) ?? [],
    });
  }

  return normalizedIds
    .map((id) => expenseRowMap.get(id))
    .filter((row): row is ExpenseDetail => Boolean(row));
}

type Transaction = {
  id: string;
  amount: number;
  occurredAt: number;
  note: string;
  categories: Array<{
    id: string;
    name: string;
    path: string[];
  }>;
};

type BucketResult = {
  totalAmount: number;
  startDate: number;
  endDate: number;
  transactions: Transaction[];
};

export async function getExpenses({
  userId,
  duration,
  categories,
  granularity,
}: {
  userId: string;
  duration: {
    start: number;
    end: number;
  };
  categories: string[];
  granularity: string;
}): Promise<BucketResult[]> {
  const db = await getDb();
  const start = duration.start;
  const end = duration.end;

  // Step 1: Normalize selected categories to remove redundant descendants
  let canonicalCategories: string[] = [];
  if (categories.length > 0) {
    const placeholders = categories.map((_, i) => `$${i + 2}`).join(",");
    const redundant = (await db.select(
      `
      SELECT DISTINCT cc.descendant
      FROM category_closure cc
      WHERE cc.user_id = $1
        AND cc.descendant IN (${placeholders})
        AND cc.depth > 0
        AND EXISTS (
          SELECT 1 FROM category_closure cc2
          WHERE cc2.user_id = $1
            AND cc2.ancestor IN (${placeholders})
            AND cc2.descendant = cc.descendant
            AND cc2.ancestor != cc2.descendant
        )
    `,
      [userId, ...categories]
    )) as Array<{ descendant: string }>;

    const redundantSet = new Set(redundant.map((r) => r.descendant));
    canonicalCategories = categories.filter((c) => !redundantSet.has(c));
  }

  // Step 2: Expand canonical categories to include all descendants
  let expandedCategories: string[] = [];
  if (canonicalCategories.length > 0) {
    const placeholders = canonicalCategories
      .map((_, i) => `$${i + 2}`)
      .join(",");
    const expanded = (await db.select(
      `
      SELECT DISTINCT descendant
      FROM category_closure
      WHERE user_id = $1
        AND ancestor IN (${placeholders})
    `,
      [userId, ...canonicalCategories]
    )) as Array<{ descendant: string }>;
    expandedCategories = expanded.map((e) => e.descendant);
  }

  // Step 3: Build category filter for SQL
  const categoryFilter =
    expandedCategories.length > 0
      ? `AND ec.category_id IN (${expandedCategories
          .map((c) => `'${c}'`)
          .join(",")})`
      : "";

  // Step 4: Fetch all expenses with their categories and paths
  const rows = (await db.select(
    `
    SELECT 
      ee.id,
      ee.amount_cents,
      ee.occurred_at,
      ee.note,
      c.id AS category_id,
      c.name AS category_name,
      (
        SELECT GROUP_CONCAT(ancestor_cat.name, ' > ')
        FROM category_closure cc2
        INNER JOIN categories ancestor_cat ON ancestor_cat.id = cc2.ancestor
        WHERE cc2.descendant = c.id 
          AND cc2.user_id = $1
        ORDER BY cc2.depth DESC
      ) AS category_path
    FROM expense_entries ee
    INNER JOIN expense_categories ec ON ec.expense_id = ee.id
    INNER JOIN categories c ON c.id = ec.category_id
    WHERE ee.user_id = $1
      AND ee.occurred_at BETWEEN $2 AND $3
      AND ee.deleted = 0
      ${categoryFilter}
    ORDER BY ee.occurred_at ASC
  `,
    [userId, start, end]
  )) as Array<{
    id: string;
    amount_cents: number;
    occurred_at: number;
    note: string | null;
    category_id: string;
    category_name: string;
    category_path: string | null;
  }>;

  // Step 5: Group expenses by transaction ID to collect categories
  const transactionMap = new Map<string, Transaction>();
  for (const row of rows) {
    if (!transactionMap.has(row.id)) {
      transactionMap.set(row.id, {
        id: row.id,
        amount: row.amount_cents,
        occurredAt: Number(row.occurred_at) * 1000,
        note: row.note || "",
        categories: [],
      });
    }

    // Parse the category path (e.g., "Root > Parent > Child")
    const pathArray = row.category_path
      ? row.category_path.split(" > ").filter(Boolean)
      : [row.category_name];

    transactionMap.get(row.id)!.categories.push({
      id: row.category_id,
      name: row.category_name,
      path: pathArray,
    });
  }

  const transactions = Array.from(transactionMap.values());

  // Step 6: Group transactions by time bucket
  const bucketMap = new Map<number, Transaction[]>();

  for (const txn of transactions) {
    const bucketStart = getBucketStart(txn.occurredAt, granularity);
    if (!bucketMap.has(bucketStart)) {
      bucketMap.set(bucketStart, []);
    }
    bucketMap.get(bucketStart)!.push(txn);
  }

  // Step 7: Convert to result format with start/end dates
  const result: BucketResult[] = [];
  const sortedBuckets = Array.from(bucketMap.keys()).sort((a, b) => a - b);

  for (const bucketStart of sortedBuckets) {
    const bucketTransactions = bucketMap.get(bucketStart)!;
    const bucketEnd = getBucketEnd(bucketStart, granularity);

    const totalAmount = bucketTransactions.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );

    result.push({
      totalAmount,
      startDate: bucketStart,
      endDate: bucketEnd,
      transactions: bucketTransactions,
    });
  }

  return result;
}

export async function getExpensesByCategories({
  userId,
  categories,
  duration,
}: {
  userId: string;
  categories: string[];
  duration: {
    start: number;
    end: number;
  };
}): Promise<
  Array<{
    name: string;
    totalAmount: number;
    transactions: Array<{
      id: string;
      amount: number;
      occurredAt: number;
      note: string;
    }>;
  }>
> {
  const db = await getDb();
  const start = duration.start;
  const end = duration.end;

  // Step 1: Normalize selected categories to remove redundant descendants
  let canonicalCategories: string[] = [];
  if (categories.length > 0) {
    const placeholders = categories.map((_, i) => `$${i + 2}`).join(",");
    const redundant = (await db.select(
      `
      SELECT DISTINCT cc.descendant
      FROM category_closure cc
      WHERE cc.user_id = $1
        AND cc.descendant IN (${placeholders})
        AND cc.depth > 0
        AND EXISTS (
          SELECT 1 FROM category_closure cc2
          WHERE cc2.user_id = $1
            AND cc2.ancestor IN (${placeholders})
            AND cc2.descendant = cc.descendant
            AND cc2.ancestor != cc2.descendant
        )
    `,
      [userId, ...categories]
    )) as Array<{ descendant: string }>;

    const redundantSet = new Set(redundant.map((r) => r.descendant));
    canonicalCategories = categories.filter((c) => !redundantSet.has(c));
  }

  // Step 2: Expand canonical categories to include all descendants
  let expandedCategories: string[] = [];
  if (canonicalCategories.length > 0) {
    const placeholders = canonicalCategories
      .map((_, i) => `$${i + 2}`)
      .join(",");
    const expanded = (await db.select(
      `
      SELECT DISTINCT descendant
      FROM category_closure
      WHERE user_id = $1
        AND ancestor IN (${placeholders})
    `,
      [userId, ...canonicalCategories]
    )) as Array<{ descendant: string }>;
    expandedCategories = expanded.map((e) => e.descendant);
  }

  // Step 3: Build category filter for SQL
  const categoryFilter =
    expandedCategories.length > 0
      ? `AND ec.category_id IN (${expandedCategories
          .map((c) => `'${c}'`)
          .join(",")})`
      : "";

  // Step 4: Fetch all expenses with their categories and paths
  const rows = (await db.select(
    `
    SELECT
      ee.id,
      ee.amount_cents,
      ee.occurred_at,
      ee.note,
      c.id AS category_id,
      c.name AS category_name,
      (
        SELECT GROUP_CONCAT(ancestor_cat.name, ' > ')
        FROM category_closure cc2
        INNER JOIN categories ancestor_cat ON ancestor_cat.id = cc2.ancestor
        WHERE cc2.descendant = c.id 
          AND cc2.user_id = $1
        ORDER BY cc2.depth DESC
      ) AS category_path
    FROM expense_entries ee
    INNER JOIN expense_categories ec ON ec.expense_id = ee.id
    INNER JOIN categories c ON c.id = ec.category_id
    WHERE ee.user_id = $1
      AND ee.occurred_at BETWEEN $2 AND $3
      AND ee.deleted = 0
      ${categoryFilter}
    ORDER BY ee.amount_cents DESC
  `,
    [userId, start, end]
  )) as Array<{
    id: string;
    amount_cents: number;
    occurred_at: number;
    note: string | null;
    category_id: string;
    category_name: string;
    category_path: string | null;
  }>;

  // Step 5: Group by category and aggregate
  const categoryMap = new Map<
    string,
    {
      name: string;
      category: {
        id: string;
        name: string;
        path: string;
      };
      totalAmount: number;
      transactions: Array<{
        id: string;
        amount: number;
        occurredAt: number;
        note: string;
      }>;
    }
  >();

  for (const row of rows) {
    if (!categoryMap.has(row.category_id)) {
      categoryMap.set(row.category_id, {
        name: row.category_name,
        totalAmount: 0,
        transactions: [],
        category: {
          id: row.category_id,
          name: row.category_name,
          path: row.category_path ? row.category_path : row.category_name,
        },
      });
    }

    const category = categoryMap.get(row.category_id)!;
    const amountInDollars = row.amount_cents / 100;

    category.totalAmount += amountInDollars;
    category.transactions.push({
      id: row.id,
      amount: amountInDollars,
      occurredAt: Number(row.occurred_at) * 1000,
      note: row.note || "",
    });
  }

  // Step 6: Convert to array and sort by total amount (descending)
  const result = Array.from(categoryMap.values()).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );

  // Step 7: Sort transactions within each category by amount (descending)
  result.forEach((category) => {
    category.transactions.sort((a, b) => b.amount - a.amount);
  });

  return result;
}

function getBucketStart(timestampMs: number, granularity: string): number {
  const date = new Date(timestampMs);

  if (granularity === "daily") {
    date.setHours(0, 0, 0, 0);
  } else if (granularity === "weekly") {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
  } else if (granularity === "monthly") {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
  } else if (granularity === "yearly") {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }

  return date.getTime();
}

function getBucketEnd(bucketStartMs: number, granularity: string): number {
  const date = new Date(bucketStartMs);

  if (granularity === "daily") {
    date.setHours(23, 59, 59, 999);
  } else if (granularity === "weekly") {
    date.setDate(date.getDate() + 6);
    date.setHours(23, 59, 59, 999);
  } else if (granularity === "monthly") {
    date.setMonth(date.getMonth() + 1);
    date.setDate(0); // Last day of current month
    date.setHours(23, 59, 59, 999);
  } else if (granularity === "yearly") {
    date.setMonth(11, 31);
    date.setHours(23, 59, 59, 999);
  }

  return date.getTime();
}
