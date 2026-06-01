"use client";

import {
  PencilSimpleIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBook } from "@/lib/api/books";
import { BookCard } from "@/types/book/Book";
import EditBookModal from "./EditBookModal";

function SortableHeader({
  label,
  column,
}: {
  label: string;
  column: Column<BookCard>;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="px-0"
    >
      {label}
      {column.getIsSorted() === "asc" ? (
        <SortAscendingIcon className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <SortDescendingIcon className="ml-2 h-4 w-4" />
      ) : (
        <SortAscendingIcon className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}

function AvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span
      className={`font-medium ${isAvailable ? "text-green-600" : "text-destructive"}`}
    >
      {isAvailable ? "Available" : "Unavailable"}
    </span>
  );
}

function buildColumns(
  onEditClick: (book: BookCard) => void,
  onDeleteClick: (book: BookCard) => void,
): ColumnDef<BookCard>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => <SortableHeader label="Title" column={column} />,
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "authorName",
      header: ({ column }) => <SortableHeader label="Author" column={column} />,
      cell: ({ row }) => (
        <div>{(row.getValue("authorName") as string | null) ?? "-"}</div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: ({ column }) => <SortableHeader label="Category" column={column} />,
      cell: ({ row }) => (
        <div>{(row.getValue("categoryName") as string | null) ?? "-"}</div>
      ),
    },
    {
      accessorKey: "language",
      header: ({ column }) => (
        <SortableHeader label="Language" column={column} />
      ),
      cell: ({ row }) => <div>{row.getValue("language")}</div>,
    },
    {
      accessorKey: "publicationYear",
      header: ({ column }) => <SortableHeader label="Year" column={column} />,
      cell: ({ row }) => (
        <div>
          {row.original.originalPublicationYear ??
            row.getValue("publicationYear")}
        </div>
      ),
    },
    {
      id: "availability",
      header: "Availability",
      cell: ({ row }) => (
        <AvailabilityBadge isAvailable={row.original.isAvailable} />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditClick(book)}
              aria-label={`Edit ${book.title}`}
              className="h-8 w-8 p-0"
            >
              <PencilSimpleIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteClick(book)}
              aria-label={`Delete ${book.title}`}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}

interface Props {
  books: BookCard[];
}

export default function BookCatalogTable({ books }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingBook, setEditingBook] = useState<BookCard | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEditClick = (book: BookCard) => {
    setEditingBook(book);
    setEditModalOpen(true);
  };

  const handleDeleteClick = async (book: BookCard) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteBook(book.id);
      toast.success(`"${book.title}" has been deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete book");
    }
  };

  const handleSaveBook = async (updatedBook: BookCard) => {
    setEditModalOpen(false);
    setEditingBook(null);
  };

  const columns = buildColumns(handleEditClick, handleDeleteClick);

  const table = useReactTable({
    data: books,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
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
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
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

      <EditBookModal
        book={editingBook}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveBook}
      />
    </div>
  );
}
