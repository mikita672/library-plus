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
  createPublisher,
  deletePublisher,
  getPublishers,
  updatePublisher,
} from "@/lib/api/publishers";
import { Publisher } from "@/types/book/Publisher";

function buildColumns(
  onEdit: (publisher: Publisher) => void,
  onDelete: (publisher: Publisher) => void,
): ColumnDef<Publisher>[] {
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
        const publisher = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(publisher)}
              aria-label={`Edit ${publisher.name}`}
              className="h-8 w-8 p-0"
            >
              <PencilSimpleIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(publisher)}
              aria-label={`Delete ${publisher.name}`}
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

export default function PublishersTab() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(
    null,
  );
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPublishers = useCallback(async () => {
    setLoading(true);
    const data = await getPublishers();
    setPublishers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchPublishers();
  }, [fetchPublishers]);

  const openAddDialog = () => {
    setEditingPublisher(null);
    setNameInput("");
    setDialogOpen(true);
  };

  const openEditDialog = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    setNameInput(publisher.name);
    setDialogOpen(true);
  };

  const handleDelete = async (publisher: Publisher) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${publisher.name}"?`,
    );
    if (!confirmed) return;

    try {
      await deletePublisher(publisher.id);
      toast.success(`"${publisher.name}" has been deleted`);
      void fetchPublishers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete publisher",
      );
    }
  };

  const handleSubmit = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      if (editingPublisher) {
        await updatePublisher(editingPublisher.id, trimmed);
        toast.success(`"${editingPublisher.name}" updated`);
      } else {
        await createPublisher(trimmed);
        toast.success(`Publisher "${trimmed}" created`);
      }
      setDialogOpen(false);
      void fetchPublishers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save publisher",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const columns = buildColumns(openEditDialog, handleDelete);

  const table = useReactTable({
    data: publishers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button className="h-10 px-4 text-lg" onClick={openAddDialog}>
          <PlusIcon />
          Add publisher
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : !publishers.length ? (
        <div className="text-center text-muted-foreground">
          No publishers found.
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
              {editingPublisher ? "Edit Publisher" : "Add Publisher"}
            </DialogTitle>
            <DialogDescription>
              {editingPublisher
                ? "Update the publisher name below."
                : "Enter the name of the new publisher."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publisher-name" className="text-right">
                Name
              </Label>
              <Input
                id="publisher-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="col-span-3"
                placeholder="Enter publisher name"
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
            <Button
              onClick={handleSubmit}
              disabled={submitting || !nameInput.trim()}
            >
              {submitting
                ? "Saving..."
                : editingPublisher
                  ? "Save Changes"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
