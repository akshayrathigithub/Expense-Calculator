import { formatCurrency } from "@src/utils/common";
import { formatDate, subDays } from "date-fns";

export const getDateRange = (value?: string) => {
  switch (value) {
    case "last-7-days":
      return {
        startDate: Math.floor(subDays(new Date(), 7).getTime() / 1000),
        endDate: Math.floor(new Date().getTime() / 1000),
      };
    case "last-30-days":
      return {
        startDate: Math.floor(subDays(new Date(), 30).getTime() / 1000),
        endDate: Math.floor(new Date().getTime() / 1000),
      };
    case "last-90-days":
      return {
        startDate: Math.floor(subDays(new Date(), 90).getTime() / 1000),
        endDate: Math.floor(new Date().getTime() / 1000),
      };
    case "last-180-days":
      return {
        startDate: Math.floor(subDays(new Date(), 180).getTime() / 1000),
        endDate: Math.floor(new Date().getTime() / 1000),
      };
    case "last-365-days":
      return {
        startDate: Math.floor(subDays(new Date(), 365).getTime() / 1000),
        endDate: Math.floor(new Date().getTime() / 1000),
      };
  }
};

export const formatTabularData = (data: any, groupBy: string) => {
  if (groupBy === "category") {
    return data.map((item: any) => ({
      date: "-",
      description: "-",
      amount: formatCurrency(item.totalAmount),
      transactions: item.transactions.length,
      tags: [item.category.path],
    }));
  }

  return data.map((item: any) => ({
    date: formatDate(item.occurredAt, "MMM d, yyyy"),
    description: item.note,
    amount: item.amount,
    transactions: 1,
    tags: item.categories,
  }));
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
