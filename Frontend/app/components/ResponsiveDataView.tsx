"use client";

import { ReactNode } from "react";

export type ColumnDef<T> = {
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
  /** Title at top of mobile card */
  cardRole?: "title" | "actions" | "field";
};

interface ResponsiveDataViewProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowKey: (row: T, index: number) => string | number;
  tableClassName?: string;
  headerRowClassName?: string;
  getRowClassName?: (row: T) => string;
  emptyMessage?: string;
  striped?: boolean;
  /** When true, table/cards scroll inside the parent instead of growing the page */
  scrollable?: boolean;
  /** When true, hides the desktop table header row */
  hideHeader?: boolean;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function ResponsiveDataView<T>({
  data,
  columns,
  getRowKey,
  tableClassName = "w-full border border-gray-300 text-xs",
  headerRowClassName = "bg-red-50",
  getRowClassName,
  emptyMessage = "No records found",
  striped = true,
  scrollable = false,
  hideHeader = false,
}: ResponsiveDataViewProps<T>) {
  if (data.length === 0) {
    return (
      <p className="text-red-700 font-medium text-sm py-4">{emptyMessage}</p>
    );
  }

  const titleColumns = columns.filter((c) => c.cardRole === "title");
  const actionColumns = columns.filter((c) => c.cardRole === "actions");
  const fieldColumns = columns.filter(
    (c) => c.cardRole !== "title" && c.cardRole !== "actions",
  );

  const scrollClass = scrollable
    ? "flex-1 min-h-0 overflow-auto overscroll-contain print:overflow-visible print:max-h-none print:h-auto"
    : "";

  return (
    <div className={scrollable ? "flex flex-col h-full min-h-0" : "contents"}>
      {/* Mobile / tablet cards */}
      <div
        data-responsive-view="mobile"
        className={`lg:hidden print:hidden space-y-3 ${scrollClass}`}
      >
        {data.map((row, index) => {
          const rowClass = getRowClassName?.(row) ?? "";
          return (
            <article
              key={getRowKey(row, index)}
              className={`rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden ${rowClass}`}
            >
              {titleColumns.length > 0 && (
                <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                  {titleColumns.map((col) => (
                    <div
                      key={col.header}
                      className="text-red-950 font-semibold text-sm"
                    >
                      {col.render(row)}
                    </div>
                  ))}
                </div>
              )}
              <dl className="px-4 py-2 divide-y divide-gray-100">
                {fieldColumns.map((col) => (
                  <div
                    key={col.header}
                    className="flex justify-between gap-3 py-2.5 text-sm"
                  >
                    <dt className="text-gray-500 font-medium shrink-0">
                      {col.header}
                    </dt>
                    <dd
                      className={`text-gray-900 font-medium min-w-0 ${alignClass[col.align ?? "right"]}`}
                    >
                      {col.render(row)}
                    </dd>
                  </div>
                ))}
              </dl>
              {actionColumns.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  {actionColumns.map((col) => (
                    <div key={col.header}>{col.render(row)}</div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Desktop table */}
      <div
        data-responsive-view="desktop"
        className={`hidden lg:block print:block ${scrollable ? scrollClass : "overflow-x-auto"}`}
      >
        <table className={`${tableClassName} print:w-full`}>
          {!hideHeader && (
            <thead className={scrollable ? "sticky top-0 z-10" : undefined}>
              <tr className={headerRowClassName}>
                {columns.map((col) => (
                  <th
                    key={col.header}
                    className={`p-2 ${alignClass[col.align ?? "left"]} ${col.headerClassName ?? "text-red-900 bg-red-50"}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {data.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className={`${striped ? "odd:bg-white even:bg-gray-100" : ""} border-gray-300 ${getRowClassName?.(row) ?? ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className={`text-gray-900 font-medium p-2 ${alignClass[col.align ?? "left"]} ${col.cellClassName ?? ""}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
