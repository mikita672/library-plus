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
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  onRemoveClick: (id: number) => void,
  onRestoreClick: (id: number) => void,
  processingId: number | null,
): ColumnDef<AdminUser>[] {
  return [
    {
      accessorKey: "email",
      header: "Client",
      cell: ({ row }) => {
        const name = row.original.name;
        const email = row.original.email;
        const avatarUrl = row.original.avatarUrl;
        const hasValidName = name && name !== "Unknown";
        
        if (avatarUrl) console.log(`Avatar URL for ${email}:`, avatarUrl);

        return (
          <div className="flex items-center gap-3 max-w-[250px]">
            {avatarUrl ? (
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border">
                <Image
                  src={avatarUrl}
                  alt={name || "Avatar"}
                  fill
                  sizes="32px"
                  className="object-cover"
                  unoptimized
                  onError={(e) => console.error(`Failed to load avatar for ${email}:`, e)}
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border">
                <span className="text-muted-foreground text-xs font-semibold">
                  {hasValidName ? name.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
            )}
            <div className="overflow-hidden">
              {hasValidName ? (
                <>
                  <div className="truncate font-medium text-sm" title={name}>{name}</div>
                  <div className="truncate text-xs text-muted-foreground" title={email}>{email}</div>
                </>
              ) : (
                <div className="truncate font-medium text-sm" title={email}>{email}</div>
              )}
            </div>
          </div>
        );
      },
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
        const isDeleted = row.original.isDeleted;

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={isDeleted ? "outline" : "destructive"}
                size="sm"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : isDeleted ? "Restore User" : "Remove User"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-none border border-border bg-background p-4">
              <div className="space-y-3">
                <div className="text-sm font-semibold">
                  {isDeleted ? "Restore user" : "Remove user"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isDeleted 
                    ? "Are you sure you want to restore this user account?" 
                    : "Are you sure you want to remove this user? They will not be able to log in."}
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => { document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={isDeleted ? "default" : "destructive"}
                    disabled={isProcessing}
                    onClick={() => {
                      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
                      if (isDeleted) {
                        onRestoreClick(row.original.id);
                      } else {
                        onRemoveClick(row.original.id);
                      }
                    }}
                  >
                    {isDeleted ? "Restore" : "Remove"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleRemove = async (id: number) => {
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

  const handleRestore = async (id: number) => {
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
