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
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api/categories";
import { Category } from "@/types/book/Category";

function buildColumns(
  onEdit: (category: Category) => void,
  onDelete: (category: Category) => void,
): ColumnDef<Category>[] {
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
        const category = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              aria-label={`Edit ${category.name}`}
              className="h-8 w-8 p-0"
            >
              <PencilSimpleIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category)}
              aria-label={`Delete ${category.name}`}
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

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const openAddDialog = () => {
    setEditingCategory(null);
    setNameInput("");
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setNameInput(category.name);
    setDialogOpen(true);
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteCategory(category.id);
      toast.success(`"${category.name}" has been deleted`);
      void fetchCategories();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    }
  };

  const handleSubmit = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, trimmed);
        toast.success(`"${editingCategory.name}" updated`);
      } else {
        await createCategory(trimmed);
        toast.success(`Category "${trimmed}" created`);
      }
      setDialogOpen(false);
      void fetchCategories();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save category",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const columns = buildColumns(openEditDialog, handleDelete);

  const table = useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button className="h-10 px-4 text-lg" onClick={openAddDialog}>
          <PlusIcon />
          Add category
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : !categories.length ? (
        <div className="text-center text-muted-foreground">
          No categories found.
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
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category name below."
                : "Enter the name of the new category."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-name" className="text-right">
                Name
              </Label>
              <Input
                id="category-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="col-span-3"
                placeholder="Enter category name"
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
                : editingCategory
                  ? "Save Changes"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
