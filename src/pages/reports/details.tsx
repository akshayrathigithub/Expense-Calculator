import { Button } from "@src/components/ui/button";
import BackIcon from "@src/assets/back.svg?react";
import { tableColumns } from "@src/utils/com";
import { ExpenseRow } from "@src/store/type";
import { DataTable } from "@src/components/ui/table";

interface ReportsDetailsProps {
  onBackBtnClick: () => void;
  transactions: ExpenseRow[];
}
export const ReportsDetails = (props: ReportsDetailsProps) => {
  const { onBackBtnClick, transactions } = props;
  const columns = tableColumns();
  return (
    <div className="text-slate-100 p-4">
      <Button onClick={onBackBtnClick} variant="link" leftIcon={<BackIcon />}>
        Back to Detailed Reports
      </Button>
      <h1 className="fs-6 fw-bold mt-2">All Transactions List</h1>

      <div className="mt-2">
        <DataTable data={transactions} columns={columns} />
      </div>
    </div>
  );
};
