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
import { BookCard } from "@/types/book/Book";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFieldArray } from "react-hook-form";
import EditBookModal from "./EditBookModal";

const columns: ColumnDef<BookCard>[] = [
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
      <div className="font-mono text-sm">{row.getValue("id") ?? "-"}</div>
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
    accessorKey: "authorName",
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
    cell: ({ row }) => (
      <div>{(row.getValue("authorName") as string | null) ?? "-"}</div>
    ),
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
    accessorKey: "publicationYear",
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
    cell: ({ row }) => (
      <div>
        {row.original.originalPublicationYear ??
          row.getValue("publicationYear")}
      </div>
    ),
  },
  {
    accessorKey: "isAvailable",
    header: "Available",
    cell: ({ row }) => <div>{row.original.isAvailable ? "Yes" : "No"}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => {
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

interface Props {
  books: BookCard[];
}

export default function BookCatalogTable({ books }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingBook, setEditingBook] = useState<BookCard | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const table = useReactTable({
    data: books,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const handleEditClick = (book: BookCard) => {
    setEditingBook(book);
    setEditModalOpen(true);
  };

  const handleSaveBook = async (updatedBook: BookCard) => {
    // TODO: Call API to update book
  };

  const handleDeleteClick = (book: BookCard) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`,
    );
    if (confirmed) {
      // TODO: Call API to remove the book
    }
  };

  const updatedColumns = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }: any) => {
          const book = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditClick(book)}
                aria-label={`Edit ${book.title}`}
                className="h-8 w-8 p-0"
              >
                <PencilSimpleIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(book)}
                aria-label={`Delete ${book.title}`}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      };
    }
    return col;
  });

  const tableWithUpdatedColumns = useReactTable({
    data: books,
    columns: updatedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  if (!books.length) {
    return (
      <div className="text-center text-muted-foreground">No books found.</div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          {tableWithUpdatedColumns.getHeaderGroups().map((headerGroup) => (
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
          {tableWithUpdatedColumns.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => tableWithUpdatedColumns.previousPage()}
          disabled={!tableWithUpdatedColumns.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => tableWithUpdatedColumns.nextPage()}
          disabled={!tableWithUpdatedColumns.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <EditBookModal
        book={editingBook}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveBook}
      />
    </div>
  );
}
