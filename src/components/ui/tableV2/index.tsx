import { Table, TableProps } from "antd";

export interface TableV2Props<T> {
    data: T[];
    loading?: boolean;
    className?: string;
    columns: TableProps<T>["columns"];
    rowKey?: string | ((record: T) => string);
}

export const TableV2 = <T extends object>({
    data,
    loading,
    className,
    columns,
    rowKey = "key",
}: TableV2Props<T>) => {
    return (
        <Table<T>
            className={className}
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={false}
            rowKey={rowKey}
            style={{ background: "transparent" }}
        />
    );
};