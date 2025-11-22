import { ExpenseRow } from "@src/store/type";
import { formatCurrency } from "@src/utils/common";
import { formatDate, subDays } from "date-fns";

export const getDateRange = (value?: string) => {
  switch (value) {
    case "last-7-days":
      return {
        startDate: subDays(new Date(), 7).getTime(),
        endDate: new Date().getTime(),
      };
    case "last-30-days":
      return {
        startDate: subDays(new Date(), 30).getTime(),
        endDate: new Date().getTime(),
      };
    case "last-90-days":
      return {
        startDate: subDays(new Date(), 90).getTime(),
        endDate: new Date().getTime(),
      };
    case "last-180-days":
      return {
        startDate: subDays(new Date(), 180).getTime(),
        endDate: new Date().getTime(),
      };
    case "last-365-days":
      return {
        startDate: subDays(new Date(), 365).getTime(),
        endDate: new Date().getTime(),
      };
  }
};

export const formatTabularData = (
  data: any,
  groupBy: string
): {
  tableData: ExpenseRow[];
  totalIncome: number;
  totalTransactions: number;
  totalExpenses: number;
  hiddenColumns: string[];
} => {
  let totalIncome = 0;
  let totalTransactions = 0;
  let totalExpenses = 0;

  const tableData = data.map((item: any) => {
    totalExpenses += item.totalAmount || 0;
    totalTransactions += item.transactions.length;

    if (groupBy === "category") {
      return {
        date: "-",
        description: "-",
        amount: formatCurrency(item.totalAmount),
        transactions: item.transactions.length,
        tags: [item.category.path],
      };
    }

    const commonData = {
      description: item.note,
      amount: formatCurrency(item.totalAmount),
      transactions: item.transactions.length,
      tags: item.categories,
    };

    if (groupBy === "daily") {
      return {
        ...commonData,
        date: formatDate(item.startDate, "MMM d, yyyy"),
      };
    }

    const startDate = formatDate(item.startDate, "MMM d, yyyy");
    const endDate = formatDate(item.endDate, "MMM d, yyyy");
    return {
      ...commonData,
      date: `${startDate} - ${endDate}`,
    };
  });

  const hiddenColumns =
    groupBy === "category" ? ["date", "description"] : ["description", "tags"];

  return {
    tableData,
    totalIncome,
    totalTransactions,
    totalExpenses,
    hiddenColumns,
  };
};

export const formatDetailsTabularData = (data: any) => {
  return data.map((item: any) => ({
    date: formatDate(item.occurredAt, "MMM d, yyyy"),
    description: item.note,
    amount: formatCurrency(item.amount),
    transactions: 1,
    tags: ["-"],
  }));
};
