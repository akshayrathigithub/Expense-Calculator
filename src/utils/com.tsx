import { ColumnDef } from "@tanstack/react-table";
import { ExpenseRow } from "@src/store/type";
import { Button } from "@src/components/ui/button";

interface ColumnProps {
  onTransactionClick?: ({ index, id }: { index: number; id?: string }) => void;
  hiddenColumns?: string[];
}

export const tableColumns = (props?: ColumnProps): ColumnDef<ExpenseRow>[] => {
  const onTransactionClick = props?.onTransactionClick;

  const defaultColumns: ColumnDef<ExpenseRow>[] = [
    {
      header: "Date",
      accessorKey: "date",
      cell: (info) => info.getValue<number>(),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (info) => (
        <span className="text-slate-100 fw-medium">
          {info.getValue<string>()}
        </span>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (info) => (
        <span className="text-slate-100">{info.getValue<number>()}</span>
      ),
    },
    {
      header: "Transactions",
      accessorKey: "transactions",
      cell: (info) => {
        const transactions = info.getValue<number>();
        const rowIndex = info.row.index;
        return (
          <span className="text-slate-100">
            {onTransactionClick ? (
              <Button
                variant="link"
                onClick={() =>
                  onTransactionClick({
                    index: rowIndex,
                  })
                }
              >
                {transactions}
              </Button>
            ) : (
              transactions
            )}
          </span>
        );
      },
    },
    {
      header: "Tags",
      accessorKey: "tags",
      cell: (info) => {
        const tags = info.getValue<string[]>();
        return (
          <div className="flex gap-2">
            {tags.map((t) => (
              <span key={t} className="text-slate-100">
                {t}
              </span>
            ))}
          </div>
        );
      },
    },
  ];

  if (props?.hiddenColumns) {
    return defaultColumns.filter((col) => {
      // Check if the column has an accessorKey property
      if ("accessorKey" in col) {
        return !props.hiddenColumns?.includes(col.accessorKey);
      }
      return true;
    });
  }

  return defaultColumns;
};
