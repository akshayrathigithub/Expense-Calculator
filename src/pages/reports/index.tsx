import { BarChart } from "@src/components/barchart";
import CategorySelect from "@src/components/category-select";
import { DatePicker } from "@src/components/datepicker";
import { Dropdown } from "@src/components/ui/dropdown";
import { DataTable } from "@src/components/ui/table";
import { ExpenseRow } from "@src/store/type";
import { useUiStore } from "@src/store/ui";
import { tableColumns } from "@src/utils/com";
import clsx from "clsx";
import { useMemo, useState } from "react";
import styles from "./index.module.scss";
import {
  DATE_RANGE_OPTIONS,
  GROUP_BY_OPTIONS,
  TYPE_OPTIONS,
} from "@src/constant";
import { IReportFilters } from "./type";
import {
  formatDetailsTabularData,
  formatTabularData,
  getDateRange,
} from "./utils";
import { formatDate } from "date-fns";
import cloneDeep from "lodash/cloneDeep";
import { Button } from "@src/components/ui/button";
import { getExpenses, getExpensesByCategories } from "@src/lib/expense";
import { ReportsDetails } from "./details";
import { toast } from "react-toastify";

export function Reports() {
  const { categories, users } = useUiStore();
  const [filters, setFilters] = useState<IReportFilters>({
    dateRange: {
      startDate: null,
      endDate: null,
      value: "",
      showDateRange: false,
      options: cloneDeep(DATE_RANGE_OPTIONS),
    },
    categories: [],
    groupBy: "daily",
    type: "expense",
  });
  const [detailedTable, setDetailedTable] = useState<{
    showDetailedTable: boolean;
    transactions: ExpenseRow[];
  }>({
    showDetailedTable: false,
    transactions: [],
  });
  const [reportData, setReportData] = useState<{
    rawData: any;
    barData: any[];
    tableData: ExpenseRow[];
  }>({
    rawData: [],
    barData: [],
    tableData: [],
  });
  const columns = tableColumns({
    onTransactionClick,
  });

  const barData = [
    { category: "Food", amount: 317.8 },
    { category: "Travel", amount: 530 },
    { category: "Work", amount: 74.15 },
    { category: "Housing", amount: 317.8 },
    { category: "Transportation", amount: 530 },
    { category: "Utilities", amount: 74.15 },
    { category: "Entertainment", amount: 317.8 },
    { category: "Healthcare", amount: 530 },
    { category: "Other", amount: 74.15 },
  ];

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

  const handleApply = async () => {
    const { dateRange, categories, groupBy, type } = filters;
    const { startDate, endDate } = dateRange;
    const userId = users.selectedId;
    if (userId && startDate && endDate) {
      const duration = {
        start: startDate,
        end: endDate,
      };

      let fetchPromise = null;
      if (groupBy === "category") {
        fetchPromise = getExpensesByCategories({
          userId,
          categories,
          duration,
        });
      } else {
        fetchPromise = getExpenses({
          userId,
          duration,
          categories,
          granularity: groupBy,
        });
      }

      toast.promise(fetchPromise, {
        pending: "Fetching report data...",
        success: "Report generated successfully!",
        error: "Failed to fetch report data",
      });

      try {
        const expenses = await fetchPromise;
        console.log(expenses, "expenses");
        const formattedData = formatTabularData(expenses, groupBy);
        console.log(formattedData, "formattedData");
        setReportData({
          rawData: expenses,
          barData: formattedData,
          tableData: formattedData,
        });
        // Handle the expenses data here
      } catch (error) {
        console.log(error);
      }
    }
  };

  const renderForm = () => {
    return (
      <div
        className={clsx(
          "bordered rounded-2 p-2 bg-slate-800 flex gap-2 items-center"
        )}
      >
        <div style={{ width: "450px" }} className="relative">
          <Dropdown
            searchable={false}
            multiple={false}
            id="report-type"
            label="Date Range"
            options={filters.dateRange.options}
            value={filters.dateRange.value}
            onChange={(option) => {
              const value = option?.value;
              if (value === "custom") {
                setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, showDateRange: true },
                });
                return;
              }
              const dateRange = getDateRange(value);
              if (dateRange && value) {
                setFilters({
                  ...filters,
                  dateRange: {
                    ...filters.dateRange,
                    ...dateRange,
                    showDateRange: false,
                    value,
                  },
                });
              }
            }}
          />
          {filters.dateRange.showDateRange && (
            <div className={styles.popover}>
              <DatePicker
                mode="range"
                onChange={(range) => {
                  if (range?.from && range?.to) {
                    const startDate = range.from.getTime();
                    const endDate = range.to.getTime();
                    const label = `${formatDate(
                      startDate,
                      "dd-MM-yy"
                    )} - ${formatDate(endDate, "dd-MM-yy")}`;
                    // update label of custom option
                    const options = cloneDeep(DATE_RANGE_OPTIONS);
                    const customOption = options.find(
                      (option) => option.value === "custom"
                    );
                    if (customOption) {
                      customOption.label = label;
                    }

                    setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        startDate,
                        endDate,
                        showDateRange: false,
                        value: "custom",
                        options,
                      },
                    });
                  }
                }}
                showTrigger={false}
                alwaysOpen
              />
            </div>
          )}
        </div>

        <div style={{ width: "350px" }}>
          <Dropdown
            searchable={false}
            id="group-by"
            label="Group By"
            value={filters.groupBy}
            options={GROUP_BY_OPTIONS}
            onChange={(option) => {
              if (option?.value) {
                setFilters({ ...filters, groupBy: option.value });
              }
            }}
          />
        </div>

        <div style={{ width: "320px" }}>
          <Dropdown
            searchable={false}
            id="type"
            label="Type"
            options={TYPE_OPTIONS}
            value={filters.type}
            onChange={(option) => {
              if (option?.value) {
                setFilters({ ...filters, type: option.value });
              }
            }}
          />
        </div>

        <CategorySelect
          id="categories"
          label="Category"
          categories={categories}
          value={filters.categories}
          onChange={(actionMeta) => {
            if (actionMeta.action === "clear") {
              setFilters((prev) => ({ ...prev, categories: [] }));
              return;
            }
            if (actionMeta.action === "remove-value") {
              setFilters((prev) => ({
                ...prev,
                categories: prev.categories.filter(
                  (c) => c !== actionMeta.removedValue?.value
                ),
              }));
              return;
            }
            if (
              actionMeta.action === "select-option" &&
              actionMeta.option?.value
            ) {
              setFilters({
                ...filters,
                categories: [...filters.categories, actionMeta.option.value],
              });
              return;
            }
          }}
          placeholder="Search categories..."
        />

        <Button onClick={handleApply}>Apply</Button>
      </div>
    );
  };

  const renderSummary = () => {
    return (
      <div className="flex justify-start gap-4 my-4">
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
    );
  };

  const renderCharts = () => {
    return (
      <>
        <div className={clsx("bordered rounded-2 p-2 bg-slate-800")}>
          <BarChart
            data={barData}
            xKey="category"
            series={[{ dataKey: "amount", name: "Amount", color: "#16a34a" }]}
            height={220}
            yTickFormatter={(v) => `$${(v as number).toFixed(0)}`}
          />
        </div>

        <div className="mt-2">
          <DataTable data={reportData.tableData} columns={columns} />
        </div>
      </>
    );
  };

  const renderReportHeader = () => {
    return (
      <>
        <h1 className="fs-4 fw-bold">Reports</h1>
        <p className="fs-1 text-slate-400">
          Generate detailed expense reports based on custom filters
        </p>
      </>
    );
  };

  function onTransactionClick({ index }: { index: number }) {
    setDetailedTable({
      showDetailedTable: true,
      transactions: formatDetailsTabularData(
        reportData.rawData[index].transactions
      ),
    });
  }

  function onBackToDetailedReports() {
    setDetailedTable({
      showDetailedTable: false,
      transactions: [],
    });
  }

  if (detailedTable.showDetailedTable) {
    return (
      <ReportsDetails
        onBackBtnClick={onBackToDetailedReports}
        transactions={detailedTable.transactions}
      />
    );
  }

  return (
    <div className="p-2 text-slate-100">
      {renderReportHeader()}
      {renderForm()}
      {renderSummary()}
      {renderCharts()}
    </div>
  );
}
