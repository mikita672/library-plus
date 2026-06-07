"use client";

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
import { useCallback, useMemo } from "react";
import Image from "next/image";
import { cancelReservation } from "@/lib/api/reservations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

function calculateFine(reservation: EnrichedReservationItem): number {
  let fine = 0;
  
  if (reservation.bookConditionUponReturn?.toLowerCase().includes("minor")) {
    fine += reservation.repurchasePrice / 3;
  }

  if (reservation.status.toLowerCase() === "overdue") {
    const dueDate = new Date(reservation.endDate);
    const now = new Date();
    
    if (now > dueDate) {
      const diffTime = Math.abs(now.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine += diffDays * 1; 
    }
  }
  
  return fine;
}

function buildColumns(onCancel: (id: string) => void): ColumnDef<EnrichedReservationItem>[] {
  return [
  {
    accessorKey: "bookTitle",
    header: "Book",
    cell: ({ row }) => {
      const title = row.original.bookTitle;
      const author = row.original.bookAuthor;
      const coverUri = row.original.bookCoverUri;

      if (title === "Loading..." || title === "Unknown" || title === "Error") {
        return <span className="text-muted-foreground text-sm">{title}</span>;
      }

      return (
        <div className="flex items-center gap-4 py-2">
          {coverUri ? (
            <div className="relative h-16 w-12 shrink-0 overflow-hidden border">
              <Image
                src={coverUri}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-16 w-12 shrink-0 bg-muted border flex items-center justify-center">
              <span className="text-xs text-muted-foreground">No img</span>
            </div>
          )}
          <div className="flex flex-col max-w-50 sm:max-w-75">
            <Link
              href={`/catalog?${new URLSearchParams({ searchToken: title }).toString()}`}
              className="truncate font-medium text-sm text-primary underline-offset-2 hover:underline"
              title={title}
            >
              {title}
            </Link>
            <span className="text-xs text-muted-foreground truncate" title={author}>
              {author}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Date Rented",
    cell: ({ row }) => formatDate(row.original.startDate),
  },
  {
    accessorKey: "endDate",
    header: "Due Date",
    cell: ({ row }) => (
      <span className={new Date() > new Date(row.original.endDate) && row.original.status.toLowerCase() !== "returned" ? "text-destructive font-medium" : ""}>
        {formatDate(row.original.endDate)}
      </span>
    ),
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
    id: "fines",
    header: "Fines",
    cell: ({ row }) => {
      const fine = calculateFine(row.original);
      if (fine > 0) {
        return <span className="text-destructive font-medium">${fine.toFixed(2)}</span>;
      }
      return <span className="text-muted-foreground">-</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const r = row.original;
      const isPending = r.status.toLowerCase() === "reserved" || r.status.toLowerCase() === "pending";

      if (!isPending) return null;

      return (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onCancel(r.id)}
        >
          Cancel
        </Button>
      );
    },
  },
  ];
}

export default function UserRentalsTable({
  reservations,
  onRefresh,
}: {
  reservations: EnrichedReservationItem[];
  onRefresh: () => void;
}) {
  const handleCancel = useCallback(async (id: string) => {
    try {
      const success = await cancelReservation(id);
      if (success) {
        toast.success("Reservation canceled successfully");
        onRefresh();
      } else {
        toast.error("Failed to cancel reservation");
      }
    } catch {
      toast.error("An error occurred while canceling");
    }
  }, [onRefresh]);

  const columns = useMemo(() => buildColumns(handleCancel), [handleCancel]);
  const data = useMemo(() => reservations, [reservations]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: useMemo(() => getCoreRowModel(), []),
  });

  if (!reservations.length) {
    return (
      <div className="text-center text-muted-foreground py-12">
        You do not have any rentals yet.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
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
