"use client";

import {
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createAuthor,
  deleteAuthor,
  getAuthors,
  updateAuthor,
} from "@/lib/api/authors";
import { Author } from "@/types/book/Author";

function buildColumns(
  onEdit: (author: Author) => void,
  onDelete: (author: Author) => void,
): ColumnDef<Author>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const author = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(author)}
              aria-label={`Edit ${author.name}`}
              className="h-8 w-8 p-0"
            >
              <PencilSimpleIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(author)}
              aria-label={`Delete ${author.name}`}
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

export default function AuthorsTab() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    const data = await getAuthors();
    setAuthors(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAuthors();
  }, [fetchAuthors]);

  const openAddDialog = () => {
    setEditingAuthor(null);
    setNameInput("");
    setDialogOpen(true);
  };

  const openEditDialog = (author: Author) => {
    setEditingAuthor(author);
    setNameInput(author.name);
    setDialogOpen(true);
  };

  const handleDelete = async (author: Author) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${author.name}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteAuthor(author.id);
      toast.success(`"${author.name}" has been deleted`);
      void fetchAuthors();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete author",
      );
    }
  };

  const handleSubmit = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      if (editingAuthor) {
        await updateAuthor(editingAuthor.id, trimmed);
        toast.success(`"${editingAuthor.name}" updated`);
      } else {
        await createAuthor(trimmed);
        toast.success(`Author "${trimmed}" created`);
      }
      setDialogOpen(false);
      void fetchAuthors();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save author",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const columns = buildColumns(openEditDialog, handleDelete);

  const table = useReactTable({
    data: authors,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button className="h-10 px-4 text-lg" onClick={openAddDialog}>
          <PlusIcon />
          Add author
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : !authors.length ? (
        <div className="text-center text-muted-foreground">
          No authors found.
        </div>
      ) : (
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
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAuthor ? "Edit Author" : "Add Author"}
            </DialogTitle>
            <DialogDescription>
              {editingAuthor
                ? "Update the author name below."
                : "Enter the name of the new author."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="author-name" className="text-right">
                Name
              </Label>
              <Input
                id="author-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="col-span-3"
                placeholder="Enter author name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !nameInput.trim()}>
              {submitting
                ? "Saving..."
                : editingAuthor
                  ? "Save Changes"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
