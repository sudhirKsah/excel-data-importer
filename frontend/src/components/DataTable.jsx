import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

const DataTable = ({ data, onDeleteRow, hideDelete }) => {
  const columns = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    return Object.keys(data[0])
      .filter(key => key !== '_deleted')
      .map((key) => ({
        id: key,
        header: () => <span className="font-medium">{key}</span>,
        accessorKey: key,
        cell: info => {
          const value = info.getValue();
          if (key === 'Date') {
            return new Date(value).toLocaleDateString('en-IN');
          }
          if (key === 'Amount') {
            return new Intl.NumberFormat('en-IN', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            }).format(value);
          }
          return value;
        }
      }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-50">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-3 text-left border border-gray-200">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
              <th className="p-3 text-left border border-gray-200">Actions</th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const actualIndex = pageIndex * pageSize + row.index;

            return (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 border border-gray-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}

                {!hideDelete && (
                  <td className="p-3 border border-gray-200">
                    <button
                      onClick={() => onDeleteRow(actualIndex)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete row"
                    >
                      ❌
                    </button>
                  </td>
                )}


              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <span className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  );
};

export default DataTable;