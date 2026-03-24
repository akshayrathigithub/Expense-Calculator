import { useMemo } from "react";
import styles from "./dashboard.module.scss";
import { BarChart } from "@src/components/barchart";
import clsx from "clsx";
import { Button, Radio, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { CustomAreaChart } from "@src/components/areachart";
import { TableV2 } from "@src/components/ui/tableV2";
import dayjs from "dayjs";
import type { TableProps } from "antd";
import commonStyles from "@src/common.module.scss";

const columns: TableProps<any>["columns"] = [
  {
    title: "Item",
    dataIndex: "item",
    key: "item",
    render: (item: string) => (
      <span style={{ color: "#ffffff", fontWeight: 500 }}>{item}</span>
    ),
  },
  {
    title: "Tags",
    dataIndex: "tags",
    key: "tags",
    render: (tags: any[]) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tags.map((tag, i) => (
          <div key={i}>
            <div style={{ color: "#ffffff", fontWeight: 500, fontSize: "14px", lineHeight: "1.2" }}>
              {tag.name}
            </div>
            {tag.path && (
              <div
                style={{
                  color: "#9db9a6",
                  fontSize: "12px",
                  lineHeight: "1.2",
                  marginTop: "4px",
                }}
              >
                {tag.path}
              </div>
            )}
            {i < tags.length - 1 && (
              <div style={{ borderBottom: "1px dashed #1a3325", margin: "10px 0", width: "100%" }} />
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (date: number) => (
      <span style={{ color: "#9db9a6", whiteSpace: "nowrap" }}>
        {dayjs(date).format("MMM D, YYYY")}
      </span>
    ),
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    render: (type: any) => (
      <Tag
        style={{
          border: "none",
          borderRadius: 6,
          fontWeight: 500,
          fontSize: 12,
          padding: "2px 10px",
          background: type === "income" ? "rgba(19, 236, 91, 0.1)" : "rgba(239, 68, 68, 0.12)",
          color: type === "income" ? "#13ec5b" : "#f87171",
        }}
      >
        {type === "income" ? "Income" : "Expense"}
      </Tag>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: (amount: number, record: any) => {
      const isIncome = record.type === "income";
      return (
        <span
          style={{
            color: isIncome ? "#13ec5b" : "#ffffff",
            fontWeight: 600,
            fontSize: "15px",
            whiteSpace: "nowrap",
          }}
        >
          {isIncome ? "+" : "-"}₹{amount.toFixed(2)}
        </span>
      );
    },
  },
];

export function Dashboard() {
  // const columns = tableColumns();
  const barData = useMemo(
    () => [
      { category: "Food", amount: 317.8 },
      { category: "Travel", amount: 530 },
      { category: "Work", amount: 74.15 },
    ],
    []
  );

  // Sample data — replace with real props as needed
  const defaultData = [
    { name: "Jan", value: 340 },
    { name: "Feb", value: 620 },
    { name: "Mar", value: 480 },
    { name: "Apr", value: 720 },
    { name: "May", value: 250 },
    { name: "Jun", value: 580 },
    { name: "Jul", value: 900 },
    { name: "Aug", value: 420 },
    { name: "Sep", value: 160 },
    { name: "Oct", value: 680 },
    { name: "Nov", value: 310 },
    { name: "Dec", value: 760 },
  ];
  const data = useMemo<any[]>(
    () => [
      {
        key: "1",
        date: 1698278400000,
        item: "Starbucks Coffee",
        amount: 5.75,
        type: "expense",
        tags: [
          { name: "Business Lunch", path: "Work > Client Meetings > Business Lunch" },
          { name: "Food", path: "Food > Coffee" },
        ],
      },
      {
        key: "2",
        date: 1698192000000,
        item: "Monthly Rent",
        amount: 850,
        type: "expense",
        tags: [{ name: "Utilities", path: "Home > Utilities" }],
      },
      {
        key: "3",
        date: 1698192000000,
        item: "October Salary",
        amount: 4200,
        type: "income",
        tags: [{ name: "Work", path: "Work" }],
      },
      {
        key: "4",
        date: 1698105600000,
        item: "Grocery Shopping",
        amount: 78.32,
        type: "expense",
        tags: [
          { name: "Food", path: "Food" },
          { name: "Groceries", path: "Home > Groceries" },
        ],
      },
      {
        key: "5",
        date: 1697932800000,
        item: "Flight to New York",
        amount: 341.5,
        type: "expense",
        tags: [{ name: "Client Meeting", path: "Work > Travel > Client Meeting" }],
      },
    ],
    []
  );

  return (
    <div className={clsx("h-full")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="fw-black lh-9 text-white-50 fs-6">Dashboard</p>
          <p className="fs-2 text-zinc-500 mt-1">Here's an overview of your spending for the selected period</p>
        </div>
        <Button type="primary" icon={<PlusOutlined className="fw-medium" />} className={clsx("text-black-50 fw-medium fs-2", commonStyles["primary-btn"])}>
          Add New Expense
        </Button>
      </div>

      <Radio.Group defaultValue="a" buttonStyle="solid" className={clsx(styles["custom-radio-group"], "my-6")}>
        <Radio.Button value="a">This Week</Radio.Button>
        <Radio.Button value="b">This Month</Radio.Button>
        <Radio.Button value="c">This Year</Radio.Button>
      </Radio.Group>

      <div className="flex justify-start gap-4 mb-4">
        <div className="bordered p-6 rounded-2 border-green-700">
          <div className="fs-3 text-white-50">Total Expense</div>
          <div className="fs-6 my-2 fw-bold text-white-50">₹1000</div>
          <div className="fs-3 text-green-500 mt-3">+10%</div>
        </div>

        <div className="bordered p-6 rounded-2 border-green-700">
          <div className="fs-3 text-white-50">Transactions</div>
          <div className="fs-6 my-2 fw-bold text-white-50">100</div>
          <div className="fs-3 text-green-500 mt-3">-10%</div>
        </div>

        <div className="bordered p-6 rounded-2 border-green-700">
          <div className="fs-3 text-white-50">Total Income</div>
          <div className="fs-6 my-2 fw-bold text-white-50">₹1000</div>
          <div className="fs-3 text-green-500 mt-3">+10%</div>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={clsx("bordered rounded-2 p-6 border-green-700")}>
          <div className="flex flex-col gap-2">
            <p className="fs-3 text-white-50 lh-6">Spending By Category</p>
            <p className="fs-6 fw-bold text-white-50 lh-8">₹1000</p>
            <p className="fs-3 text-zinc-500 lh-5">This Month</p>
          </div>
          <BarChart
            data={barData}
            xKey="category"
            series={[{ dataKey: "amount", name: "Amount", color: "#16a34a" }]}
            height={220}
            yTickFormatter={(v) => `$${(v as number).toFixed(0)}`}
          />
        </div>
        <div className={clsx("bordered rounded-2 p-6 border-green-700")}>
          <div className="flex flex-col gap-2">
            <p className="fs-3 text-white-50 lh-6">Spending By Category</p>
            <p className="fs-6 fw-bold text-white-50 lh-8">₹1000</p>
            <p className="fs-3 text-zinc-500 lh-5">This Month</p>
          </div>
          <CustomAreaChart height={220} data={defaultData} />
        </div>
      </div>
      <div className="bordered rounded-2 p-6 border-green-700 mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="fs-5 fw-bold text-white-50 lh-7">Recent Transactions</p>
          <Button type="link" className={clsx(commonStyles["link-btn"], "")}>View All</Button>
        </div>
        <TableV2 data={data} columns={columns} />
      </div>
    </div>
  );
}
