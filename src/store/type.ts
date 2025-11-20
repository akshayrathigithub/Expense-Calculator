export type TagNode = {
  id: string;
  name: string;
  children?: Record<string, TagNode>;
  parentId?: string;
};

export type User = {
  id: string;
  displayName: string;
  createdAt: number;
  active: boolean;
};

export type ExpenseForm = {
  amount: string;
  date: number | null;
  note: string;
  categories: string[];
};

export type ExpenseRow = {
  date: number; // ISO string or display-ready date
  description: string;
  amount: number; // in dollars for simplicity
  tags: string[];
  transactions: number;
};
