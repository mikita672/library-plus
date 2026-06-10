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
import { EnrichedReservationItem } from "@/types/reservation/Reservation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ManageRentalDialog } from "./ManageRentalDialog";
import { updateReservationStatus } from "@/lib/api/reservations";
import { toast } from "sonner";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let colorClasses: string;
  let label = status;

  switch (normalized) {
    case "reserved":
      colorClasses =
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      label = "Pending";
      break;
    case "taken":
      colorClasses =
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      label = "Rented";
      break;
    case "returned":
      colorClasses =
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      label = "Returned";
      break;
    case "overdue":
      colorClasses =
        "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      label = "Overdue";
      break;
    case "waiting for payment":
      colorClasses =
        "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      label = "Waiting for payment";
      break;
    default:
      colorClasses = "bg-muted text-muted-foreground";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${colorClasses}`}
    >
      {label}
    </span>
  );
}



function buildColumns(
  onManageClick: (r: EnrichedReservationItem) => void,
  onStatusChange: (id: number, newStatus: string) => void,
): ColumnDef<EnrichedReservationItem>[] {
  return [
    {
      accessorKey: "userId",
      header: "Client",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 max-w-55">
          {row.original.clientAvatarUrl ? (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border">
              <Image
                src={row.original.clientAvatarUrl}
                alt={row.original.clientName || "Avatar"}
                fill
                sizes="32px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border">
              <span className="text-muted-foreground text-xs font-semibold">
                {row.original.clientName && row.original.clientName !== "Unknown" ? row.original.clientName.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
          )}
          <div className="overflow-hidden">
            <Link
              href={`/profile/dashboard/clients?search=${encodeURIComponent(row.original.clientEmail)}`}
              className="block truncate font-medium text-sm text-primary underline underline-offset-2 hover:text-primary/80"
              title={row.original.clientName}
            >
              {row.original.clientName === "Unknown" ? row.original.clientEmail : row.original.clientName}
            </Link>
            {row.original.clientEmail && row.original.clientName !== row.original.clientEmail && row.original.clientName !== "Unknown" && (
              <div
                className="truncate text-xs text-muted-foreground"
                title={row.original.clientEmail}
              >
                {row.original.clientEmail}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "bookUnitId",
      header: "Book",
      cell: ({ row }) => {
        const title = row.original.bookTitle;
        if (
          title === "Loading..." ||
          title === "Unknown Book" ||
          title === "Error"
        ) {
          return <span className="text-muted-foreground text-sm">{title}</span>;
        }

        return (
          <Link
            href={`/profile/dashboard/book-catalog?${new URLSearchParams({ searchToken: title }).toString()}`}
            className="block max-w-50 truncate text-primary text-sm underline underline-offset-2 hover:text-primary/80"
            title={title}
          >
            {title}
          </Link>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "endDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original.endDate),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const r = row.original;
        const isOverdue = r.status !== "Returned" && new Date(r.endDate).getTime() < new Date().setHours(0,0,0,0);
        const displayStatus = isOverdue ? "Overdue" : r.status;
        return <StatusBadge status={displayStatus} />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const r = row.original;
        const isOverdue = r.status !== "Returned" && new Date(r.endDate).getTime() < new Date().setHours(0,0,0,0);
        const displayStatus = isOverdue ? "Overdue" : r.status;
        
        return (
          <div className="flex gap-2">
            {displayStatus === "Reserved" && (
              <>
                <Button variant="outline" size="sm" onClick={() => onStatusChange(r.id, "Taken")}>
                  Confirm rent
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onStatusChange(r.id, "Returned")}>
                  Cancel
                </Button>
              </>
            )}
            
            {(displayStatus === "Taken" || displayStatus === "Overdue") && (
              <Button variant="outline" size="sm" onClick={() => onManageClick(r)}>
                Return
              </Button>
            )}
            {displayStatus === "Returned" && (
              <Button variant="outline" size="sm" onClick={() => onManageClick(r)}>
                See details
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}

export default function RentalsTable({
  reservations,
  onRefresh,
}: {
  reservations: EnrichedReservationItem[];
  onRefresh: () => void;
}) {
  "use no memo";
  const [selectedReservation, setSelectedReservation] =
    useState<EnrichedReservationItem | null>(null);

  const handleStatusChange = useCallback(
    async (id: number, newStatus: string) => {
      try {
        const success = await updateReservationStatus(id, newStatus);
        if (success) {
          toast.success(`Status updated to ${newStatus}`);
          onRefresh();
        } else {
          toast.error("Failed to update status");
        }
      } catch {
        toast.error("An error occurred while updating status");
      }
    },
    [onRefresh],
  );

  const columns = useMemo(
    () => buildColumns((r) => setSelectedReservation(r), handleStatusChange),
    [handleStatusChange],
  );

  const data = useMemo(() => reservations, [reservations]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: useMemo(() => getCoreRowModel(), []),
  });

  if (!reservations.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No reservations found.
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

      <ManageRentalDialog
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onSuccess={onRefresh}
        readOnly={selectedReservation?.status.toLowerCase() === "returned"}
      />
    </div>
  );
}
