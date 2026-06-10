"use client";
import Link from "next/link";
import { PencilSimpleIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PaginationControls } from "@/components/ui/pagination-controls";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BaseLookupModel {
  id: number;
  name: string;
}

interface LookupManagementTabProps<T extends BaseLookupModel> {
  entityName: string;
  entityNamePlural: string;
  paramKey: string;
  fetchItems: () => Promise<T[]>;
  createItem: (name: string) => Promise<T | null>;
  updateItem: (id: number, name: string) => Promise<unknown>;
  deleteItem: (id: number) => Promise<unknown>;
}

function buildColumns<T extends BaseLookupModel>(
  onEdit: (item: T) => void,
  onDelete: (item: T) => void,
  paramKey: string,
): ColumnDef<T>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const val = row.getValue("name") as string;
        const id = row.original.id;
        const searchParam = new URLSearchParams({ [paramKey]: id.toString(), tab: "books" }).toString();
        return (
          <Link
            href={`/profile/dashboard/book-catalog?${searchParam}`}
            className="block max-w-75 truncate text-primary underline underline-offset-2 hover:text-primary/80"
            title={val}
          >
            {val}
          </Link>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)} className="h-8 w-8 p-0">
            <PencilSimpleIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(row.original)} className="h-8 w-8 p-0 text-destructive">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}

export default function LookupManagementTab<T extends BaseLookupModel>({
  entityName,
  entityNamePlural,
  paramKey,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
}: LookupManagementTabProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchItems());
    } catch {
      toast.error(`Failed to load ${entityNamePlural}`);
    } finally {
      setLoading(false);
    }
  }, [fetchItems, entityNamePlural]);

  useEffect(() => { void loadItems(); }, [loadItems]);

  const openAddDialog = useCallback(() => {
    setEditingItem(null);
    setNameInput("");
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((item: T) => {
    setEditingItem(item);
    setNameInput(item.name);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (item: T) => {
    if (!window.confirm(`Delete ${entityName} "${item.name}"?`)) return;
    try {
      if (await deleteItem(item.id)) {
        toast.success(`${entityName} deleted`);
        await loadItems();
      }
    } catch {
      toast.error(`Error deleting ${entityName}`);
    }
  }, [entityName, deleteItem, loadItems]);

  const handleSubmit = async () => {
    if (!nameInput.trim()) return;
    setSubmitting(true);
    try {
      if (editingItem) {
        if (await updateItem(editingItem.id, nameInput.trim())) {
          toast.success(`${entityName} updated`);
          await loadItems();
          setDialogOpen(false);
        }
      } else {
        await createItem(nameInput.trim());
        toast.success(`${entityName} created`);
        await loadItems();
        setDialogOpen(false);
      }
    } catch {
      toast.error(`Error saving ${entityName}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())), [items, searchQuery]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => filteredItems.slice((pageNumber - 1) * ITEMS_PER_PAGE, pageNumber * ITEMS_PER_PAGE), [filteredItems, pageNumber]);
  
  useEffect(() => { setPageNumber(1); }, [searchQuery]);

  const columns = useMemo(() => buildColumns<T>(openEditDialog, handleDelete, paramKey), [openEditDialog, handleDelete, paramKey]);

  const table = useReactTable({
    data: paginatedItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 max-w mr-4 gap-2">
          <Input className="h-10 text-base" placeholder={`Search ${entityNamePlural.toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Button variant="outline" className="h-10 w-10 p-0 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Button>
        </div>
        <Button className="h-10 px-4 text-lg" onClick={openAddDialog}>
          <PlusIcon /> Add {entityName.toLowerCase()}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : !filteredItems.length ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? `No matches for "${searchQuery}"` : `No ${entityNamePlural.toLowerCase()} found.`}
        </div>
      ) : (
        <div className="flex flex-col justify-between space-y-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(h => (
                    <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center mt-4">
            <PaginationControls pageNumber={pageNumber} totalPages={totalPages} onPageChange={setPageNumber} />
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} {entityName}</DialogTitle>
            <DialogDescription>Enter the name of the {entityName.toLowerCase()}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Name" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Saving..." : editingItem ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
