"use client";

import { Button } from "@/src/components/ui/Button";
import { Category } from "@/src/db/schema";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface CategoriesTableProps {
  data: Category[];
  isLoading: boolean;
  onEdit: (subject: Category) => void;
  onDelete: (subject: Category) => Promise<void>;
}

export const CategoriesTable = ({
  data,
  isLoading,
  onEdit,
  onDelete,
}: CategoriesTableProps) => {
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {row.original.slug}
        </code>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onEdit(row.original)}>
            Edit
          </Button>

          <Button variant="destructive" onClick={() => onDelete(row.original)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto border">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-left font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Loading categories...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No categories found.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
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
};
