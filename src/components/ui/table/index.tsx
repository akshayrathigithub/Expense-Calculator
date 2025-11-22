import clsx from "clsx";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import styles from "./table.module.scss";

export type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  maxHeight?: string;
  className?: string; // wrapper
  empty?: React.ReactNode;
};

export function DataTable<TData extends unknown>({
  data,
  columns,
  className,
  maxHeight = "400px",
  empty,
}: DataTableProps<TData>) {
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className={clsx(styles._wrap, className)} style={{ maxHeight }}>
      <table className={clsx(styles._table)}>
        <thead className={clsx(styles._thead)}>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} className={styles._th}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles._td} colSpan={table.getAllColumns().length}>
                {empty ?? "No data"}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className={clsx(styles._row)}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={clsx(styles._td)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
