"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  SortAscendingIcon,
  SortDescendingIcon,
  TrashIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Book = {
  id: string;
  title: string;
  author: string;
  language: string;
  year: number;
  available: number;
  total: number;
};

const placeholderData: Book[] = [
  {
    id: "392",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    language: "English",
    year: 1925,
    available: 36,
    total: 40,
  },
  {
    id: "412",
    title: "Little Prince",
    author: "Antoine de Saint-Exupéry",
    language: "French",
    year: 1943,
    available: 27,
    total: 35,
  },
  {
    id: "392",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    language: "English",
    year: 1925,
    available: 36,
    total: 40,
  },
  {
    id: "412",
    title: "Little Prince",
    author: "Antoine de Saint-Exupéry",
    language: "French",
    year: 1943,
    available: 27,
    total: 35,
  },
  {
    id: "392",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    language: "English",
    year: 1925,
    available: 36,
    total: 40,
  },
  {
    id: "412",
    title: "Little Prince",
    author: "Antoine de Saint-Exupéry",
    language: "French",
    year: 1943,
    available: 27,
    total: 35,
  },
];

const columns: ColumnDef<Book>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        ID
        {column.getIsSorted() === "asc" ? (
          <SortAscendingIcon className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <SortDescendingIcon className="ml-2 h-4 w-4" />
        ) : (
          <SortAscendingIcon className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Title
        {column.getIsSorted() === "asc" ? (
          <SortAscendingIcon className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <SortDescendingIcon className="ml-2 h-4 w-4" />
        ) : (
          <SortAscendingIcon className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Author
        {column.getIsSorted() === "asc" ? (
          <SortAscendingIcon className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <SortDescendingIcon className="ml-2 h-4 w-4" />
        ) : (
          <SortAscendingIcon className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("author")}</div>,
  },
  {
    accessorKey: "language",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Language
        {column.getIsSorted() === "asc" ? (
          <SortAscendingIcon className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <SortDescendingIcon className="ml-2 h-4 w-4" />
        ) : (
          <SortAscendingIcon className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("language")}</div>,
  },
  {
    accessorKey: "year",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Year
        {column.getIsSorted() === "asc" ? (
          <SortAscendingIcon className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <SortDescendingIcon className="ml-2 h-4 w-4" />
        ) : (
          <SortAscendingIcon className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("year")}</div>,
  },
  {
    accessorKey: "available",
    header: "Available",
    cell: ({ row }) => {
      const available = row.getValue("available") as number;
      const total = row.original.total;
      return <div>{`${available}/${total}`}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Edit book"
          >
            <PencilSimpleIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            title="Remove book"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function BookCatalogTable() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: placeholderData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No books found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
