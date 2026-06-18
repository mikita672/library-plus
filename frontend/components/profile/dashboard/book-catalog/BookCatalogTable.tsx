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
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import BookCopiesModal from "./BookCopiesModal";

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
  onTitleClick: (book: BookCard) => void,
): ColumnDef<BookCard>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => <SortableHeader label="Title" column={column} />,
      cell: ({ row }) => (
        <button
          onClick={() => onTitleClick(row.original)}
          className="max-w-50 truncate text-left text-primary underline underline-offset-2 hover:text-primary/80 block"
          title={row.getValue("title")}
        >
          {row.getValue("title")}
        </button>
      ),
    },
    {
      accessorKey: "authorName",
      header: ({ column }) => <SortableHeader label="Author" column={column} />,
      cell: ({ row }) => {
        const val = row.getValue("authorName") as string | null;
        return (
          <div className="max-w-37.5 truncate" title={val ?? ""}>
            {val ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "publisherName",
      header: ({ column }) => <SortableHeader label="Publisher" column={column} />,
      cell: ({ row }) => {
        const val = row.getValue("publisherName") as string | null;
        return (
          <div className="max-w-30 truncate" title={val ?? ""}>
            {val ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "categoryName",
      header: ({ column }) => (
        <SortableHeader label="Category" column={column} />
      ),
      cell: ({ row }) => {
        const val = row.getValue("categoryName") as string | null;
        return (
          <div className="max-w-30 truncate" title={val ?? ""}>
            {val ?? "-"}
          </div>
        );
      },
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
      header: () => <div className="text-right">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditClick(book)}
              aria-label={`Edit ${book.title}`}
              className="h-8 w-8 p-0"
            >
              <PencilSimpleIcon className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Deactivate ${book.title}`}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-none border border-border bg-background p-4 mr-10 mb-2">
                <div className="space-y-3">
                  <div className="text-sm font-semibold">Deactivate Book</div>
                  <p className="text-xs text-muted-foreground">
                    Are you sure you want to deactivate "{book.title}"? It will no longer be shown in the catalog.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
                        onDeleteClick(book);
                      }}
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
    },
  ];
}

interface Props {
  books: BookCard[];
  onSuccess?: () => void;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
}

export default function BookCatalogTable({ books, onSuccess, sorting, setSorting }: Props) {
  "use no memo";
  const [editingBook, setEditingBook] = useState<BookCard | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copiesBook, setCopiesBook] = useState<BookCard | null>(null);
  const [copiesModalOpen, setCopiesModalOpen] = useState(false);

  const handleEditClick = useCallback((book: BookCard) => {
    setEditingBook(book);
    setEditModalOpen(true);
  }, []);

  const handleTitleClick = useCallback((book: BookCard) => {
    setCopiesBook(book);
    setCopiesModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    async (book: BookCard) => {
      try {
        await deleteBook(book.id);
        toast.success(`"${book.title}" has been deactivated`);
        onSuccess?.();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete book",
        );
      }
    },
    [onSuccess],
  );

  const handleSaveBook = useCallback(async () => {
    setEditModalOpen(false);
    setEditingBook(null);
    onSuccess?.();
  }, [onSuccess]);

  const columns = useMemo(
    () => buildColumns(handleEditClick, handleDeleteClick, handleTitleClick),
    [handleEditClick, handleDeleteClick, handleTitleClick],
  );

  const data = useMemo(() => books, [books]);


  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: useMemo(() => getCoreRowModel(), []),
    getSortedRowModel: useMemo(() => getSortedRowModel(), []),
    manualSorting: true,
    state: useMemo(() => ({ sorting }), [sorting]),
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

      <BookCopiesModal
        book={copiesBook}
        open={copiesModalOpen}
        onOpenChange={setCopiesModalOpen}
      />
    </div>
  );
}
