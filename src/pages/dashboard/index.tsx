import { useMemo } from "react";
import styles from "./dashboard.module.scss";
import { BarChart } from "@src/components/barchart";
import { MultiRingPieChart, type PieNode } from "@src/components/piechart";
import clsx from "clsx";
import { DataTable } from "@src/components/ui/table";
import { ExpenseRow } from "@src/store/type";
import { tableColumns } from "@src/utils/com";

export function Dashboard() {
  const columns = tableColumns();
  const barData = useMemo(
    () => [
      { category: "Food", amount: 317.8 },
      { category: "Travel", amount: 530 },
      { category: "Work", amount: 74.15 },
    ],
    []
  );

  const pieData = useMemo<PieNode[]>(
    () => [
      {
        name: "Food",
        children: [
          { name: "Groceries", value: 112.3 },
          {
            name: "Restaurants",
            children: [
              { name: "Lunch", value: 85.5 },
              { name: "Dinner", value: 120 },
            ],
          },
        ],
      },
      {
        name: "Travel",
        children: [
          { name: "Flights", value: 450 },
          { name: "Taxi", value: 80 },
        ],
      },
      {
        name: "Work",
        children: [
          { name: "Software", value: 29 },
          { name: "Supplies", value: 45.15 },
        ],
      },
    ],
    []
  );
  const data = useMemo<ExpenseRow[]>(
    () => [
      {
        date: 1731235200000,
        description: "Software Subscription",
        amount: 29,
        transactions: 1,
        tags: ["Work"],
      },
      {
        date: 1731235200000,
        description: "Lunch Meeting",
        amount: 85.5,
        transactions: 17,
        tags: ["Food", "Work"],
      },
      {
        date: 1731235200000,
        description: "Groceries",
        amount: 112.3,
        transactions: 20,
        tags: ["Food"],
      },
      {
        date: 1731235200000,
        description: "Flight to SFO",
        amount: 450,
        transactions: 12,
        tags: ["Travel"],
      },
      {
        date: 1731235200000,
        description: "Office Supplies",
        amount: 45.15,
        transactions: 80,
        tags: ["Work"],
      },
    ],
    []
  );

  return (
    <div className={clsx(styles.container, "h-full")}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>Dashboard</h1>
      </div>

      <div className="flex justify-start gap-4 mb-4">
        <div className="bordered p-6 rounded-2">
          <div className="fs-1 mb-2">Total Expense</div>
          <div className="fs-4 fw-bold">$1000</div>
        </div>

        <div className="bordered p-6 rounded-2">
          <div className="fs-1 mb-2">Transactions</div>
          <div className="fs-4 fw-bold">100</div>
        </div>

        <div className="bordered p-6 rounded-2">
          <div className="fs-1 mb-2">Total Income</div>
          <div className="fs-4 fw-bold">$1000</div>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={clsx("bordered rounded-2 p-2 bg-slate-800")}>
          <BarChart
            data={barData}
            xKey="category"
            series={[{ dataKey: "amount", name: "Amount", color: "#16a34a" }]}
            height={220}
            yTickFormatter={(v) => `$${(v as number).toFixed(0)}`}
          />
        </div>
        <div className={clsx("bordered rounded-2 p-2 bg-slate-800")}>
          <MultiRingPieChart
            data={pieData}
            height={220}
            maxDepth={4}
            showLegend={false}
          />
        </div>
      </div>

      <DataTable data={data} columns={columns} />
    </div>
  );
}
