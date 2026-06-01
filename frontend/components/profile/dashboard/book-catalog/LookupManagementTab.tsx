"use client";

import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
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

export interface BaseLookupModel {
  id: string;
  name: string;
}

interface LookupManagementTabProps<T extends BaseLookupModel> {
  entityName: string;
  entityNamePlural: string;
  fetchItems: () => Promise<T[]>;
  createItem: (name: string) => Promise<T | null>;
  updateItem: (id: string, name: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

function buildColumns<T extends BaseLookupModel>(
  entityName: string,
  onEdit: (item: T) => void,
  onDelete: (item: T) => void,
): ColumnDef<T>[] {
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
        const item = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.name}`}
              className="h-8 w-8 p-0"
            >
              <PencilSimpleIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item)}
              aria-label={`Delete ${item.name}`}
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

export default function LookupManagementTab<T extends BaseLookupModel>({
  entityName,
  entityNamePlural,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
}: LookupManagementTabProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      toast.error(`Failed to load ${entityNamePlural.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [fetchItems, entityNamePlural]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const openAddDialog = () => {
    setEditingItem(null);
    setNameInput("");
    setDialogOpen(true);
  };

  const openEditDialog = (item: T) => {
    setEditingItem(item);
    setNameInput(item.name);
    setDialogOpen(true);
  };

  const handleDelete = async (item: T) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteItem(item.id);
      toast.success(`"${item.name}" has been deleted`);
      void loadItems();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : `Failed to delete ${entityName.toLowerCase()}`,
      );
    }
  };

  const handleSubmit = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, trimmed);
        toast.success(`"${editingItem.name}" updated`);
      } else {
        await createItem(trimmed);
        toast.success(`${entityName} "${trimmed}" created`);
      }
      setDialogOpen(false);
      void loadItems();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : `Failed to save ${entityName.toLowerCase()}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const columns = buildColumns<T>(entityName, openEditDialog, handleDelete);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button className="h-10 px-4 text-lg" onClick={openAddDialog}>
          <PlusIcon />
          Add {entityName.toLowerCase()}
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : !items.length ? (
        <div className="text-center text-muted-foreground">
          No {entityNamePlural.toLowerCase()} found.
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
              {editingItem ? `Edit ${entityName}` : `Add ${entityName}`}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? `Update the ${entityName.toLowerCase()} name below.`
                : `Enter the name of the new ${entityName.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`${entityName.toLowerCase()}-name`} className="text-right">
                Name
              </Label>
              <Input
                id={`${entityName.toLowerCase()}-name`}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="col-span-3"
                placeholder={`Enter ${entityName.toLowerCase()} name`}
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
                : editingItem
                  ? "Save Changes"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
