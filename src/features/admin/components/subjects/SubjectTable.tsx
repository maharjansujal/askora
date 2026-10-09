"use client";

import { useConfirm } from "@/src/components/confirm/useConfirm";
import { Button } from "@/src/components/ui/Button";
import { Subject } from "@/src/db/schema";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface SubjectsTableProps {
  data: Subject[];
  isLoading: boolean;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => Promise<void>;
}

export const SubjectsTable = ({
  data,
  isLoading,
  onEdit,
  onDelete,
}: SubjectsTableProps) => {
  const columns: ColumnDef<Subject>[] = [
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
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-125 truncate text-muted-foreground">
          {row.original.description || "—"}
        </div>
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
                Loading subjects...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No subjects found.
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
