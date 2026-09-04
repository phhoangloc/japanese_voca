import { Spinner } from "./Spinner";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyMessage = "No records yet.",
  actions,
}: DataTableProps<T>) {
  const span = columns.length + (actions ? 1 : 0);

  return (
    <div className="card px-5 py-1.5">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-line-soft">
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  className={`table-head ${i === 0 ? "pl-0" : ""} ${c.className ?? ""}`}
                >
                  {c.header}
                </th>
              ))}
              {actions && <th className="table-head pr-0 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={span} className="px-0 py-8">
                  <Spinner />
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={span}
                  className="px-0 py-12 text-center text-[13px] text-ink-faint"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-line-faint last:border-0 hover:bg-line-faint/50"
                >
                  {columns.map((c, i) => (
                    <td
                      key={c.key}
                      className={[
                        "table-cell",
                        i === 0 ? "pl-0 font-bold text-ink" : "",
                        c.className ?? "",
                      ].join(" ")}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="table-cell pr-0 text-right">
                      <div className="flex justify-end gap-1.5">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
