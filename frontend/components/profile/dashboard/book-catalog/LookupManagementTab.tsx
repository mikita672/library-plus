"use client";

import { PencilSimpleIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BaseLookupModel {
  id: string;
  name: string;
}

interface LookupManagementTabProps<T extends BaseLookupModel> {
  entityName: string;
  entityNamePlural: string;
  fetchItems: () => Promise<T[]>;
  addItem: (name: string) => Promise<T>;
  updateItem: (id: string, name: string) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
}

function buildColumns<T extends BaseLookupModel>(
  onEdit: (item: T) => void,
  onDelete: (item: T) => void,
): ColumnDef<T>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="max-w-75 truncate" title={row.getValue("name")}>
          {row.getValue("name")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
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
  fetchItems,
  addItem,
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
        await addItem(nameInput.trim());
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
  
  const columns = useMemo(() => buildColumns<T>(openEditDialog, handleDelete), [openEditDialog, handleDelete]);


  const table = useReactTable({
    data: filteredItems,
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
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
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
