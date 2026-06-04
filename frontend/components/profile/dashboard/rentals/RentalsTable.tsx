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
import { useCallback, useMemo, useState } from "react";
import { ManageRentalDialog } from "./ManageRentalDialog";
import { updateReservationStatus } from "@/lib/api/reservations";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const STATUSES = [
  "Reserved",
  "Taken",
  "Returned",
  "Overdue",
  "Waiting for payment",
];

function buildColumns(
  onManageClick: (r: EnrichedReservationItem) => void,
  onStatusChange: (id: string, newStatus: string) => void,
): ColumnDef<EnrichedReservationItem>[] {
  return [
    {
      accessorKey: "userId",
      header: "Client",
      cell: ({ row }) => (
        <div className="max-w-45">
          <Link
            href={`/profile/dashboard/clients?search=${encodeURIComponent(row.original.clientEmail)}`}
            className="block truncate font-medium text-sm text-primary underline underline-offset-2 hover:text-primary/80"
            title={row.original.clientName}
          >
            {row.original.clientName}
          </Link>
          {row.original.clientEmail && (
            <div
              className="truncate text-xs text-muted-foreground"
              title={row.original.clientEmail}
            >
              {row.original.clientEmail}
            </div>
          )}
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
            href={`/profile/dashboard/book-catalog?search=${encodeURIComponent(title)}`}
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
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageClick(row.original)}
            >
              Manage
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => onStatusChange(row.original.id, s)}
                    className={
                      row.original.status === s ? "bg-accent font-bold" : ""
                    }
                  >
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
    async (id: string, newStatus: string) => {
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
      />
    </div>
  );
}
