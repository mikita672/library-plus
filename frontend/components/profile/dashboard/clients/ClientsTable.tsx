"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminUser, softDeleteUser, restoreUser } from "@/lib/api/users";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ isDeleted }: { isDeleted: boolean }) {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
        Removed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
      Active
    </span>
  );
}

function buildColumns(
  onRemoveClick: (id: string) => void,
  onRestoreClick: (id: string) => void,
  processingId: string | null,
): ColumnDef<AdminUser>[] {
  return [
    {
      accessorKey: "email",
      header: "Client",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="truncate font-medium text-sm" title={row.original.name || "Unknown"}>
            {row.original.name || "Unknown"}
          </div>
          <div className="truncate text-xs text-muted-foreground" title={row.original.email}>
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => row.original.phoneNumber || "-",
    },
    {
      accessorKey: "joinedAt",
      header: "Joined Date",
      cell: ({ row }) => formatDate(row.original.joinedAt),
    },
    {
      accessorKey: "isDeleted",
      header: "Status",
      cell: ({ row }) => <StatusBadge isDeleted={row.original.isDeleted} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (row.original.isAdmin) {
          return null;
        }

        const isProcessing = processingId === row.original.id;

        if (row.original.isDeleted) {
          return (
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => onRestoreClick(row.original.id)}
            >
              {isProcessing ? "Restoring..." : "Restore User"}
            </Button>
          );
        }

        return (
          <Button
            variant="destructive"
            size="sm"
            disabled={isProcessing}
            onClick={() => onRemoveClick(row.original.id)}
          >
            {isProcessing ? "Removing..." : "Remove User"}
          </Button>
        );
      },
    },
  ];
}

export default function ClientsTable({
  users,
  onRefresh,
}: {
  users: AdminUser[];
  onRefresh: () => void;
}) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;

    setProcessingId(id);
    try {
      await softDeleteUser(id);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Failed to remove user");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm("Are you sure you want to restore this user?")) return;

    setProcessingId(id);
    try {
      await restoreUser(id);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Failed to restore user");
    } finally {
      setProcessingId(null);
    }
  };

  const columns = buildColumns(handleRemove, handleRestore, processingId);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!users.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No clients found.
      </div>
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
    </div>
  );
}
