"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReservationItem } from "@/types/reservation/Reservation";
import { formatDate } from "@/lib/utils/dates";
import { calculateFine } from "@/lib/utils/fines";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { cancelReservation } from "@/lib/api/reservations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ManageRentalDialog } from "../dashboard/rentals/ManageRentalDialog";
import { LeaveReviewDialog } from "./LeaveReviewDialog";

function buildColumns(
  onCancel: (id: number) => void,
  onManageClick: (r: ReservationItem) => void,
  onReviewClick: (r: ReservationItem) => void
): ColumnDef<ReservationItem>[] {
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
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                  priority={row.index < 5}
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
      cell: ({ row }) => {
        const r = row.original;
        const isOverdue = new Date() > new Date(r.endDate) && r.status.toLowerCase() !== "returned" && r.status.toLowerCase() !== "canceled";
        return (
          <div className="flex flex-col space-y-1">
            <span className={isOverdue ? "text-destructive font-medium" : ""}>
              {formatDate(r.endDate)}
            </span>
            {r.returnedDate && (
              <span className="text-xs text-muted-foreground">
                Returned: {formatDate(r.returnedDate)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const r = row.original;
        const isOverdue = r.status !== "Returned" && r.status !== "Canceled" && new Date(r.endDate).getTime() < new Date().setHours(0, 0, 0, 0);
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
        const isReturned = r.status.toLowerCase() === "returned";

        return (
          <div className="flex gap-2">
            {isPending && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(r.id)}
              >
                Cancel
              </Button>
            )}
            {isReturned && (
              <>
                <Button variant="outline" size="sm" onClick={() => onManageClick(r)}>
                  See details
                </Button>
                {!r.hasReviewed && (
                  <Button variant="default" size="sm" onClick={() => onReviewClick(r)}>
                    Leave review
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];
}

export default function UserRentalsTable({
  reservations,
  onRefresh,
}: {
  reservations: ReservationItem[];
  onRefresh: () => void;
}) {
  const [selectedReservation, setSelectedReservation] = useState<ReservationItem | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ bookId: number; bookTitle: string } | null>(null);

  const handleCancel = useCallback(async (id: number) => {
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

  const handleReviewClick = useCallback((r: ReservationItem) => {
    setReviewTarget({ bookId: r.bookId, bookTitle: r.bookTitle });
  }, []);

  const columns = useMemo(() => buildColumns(handleCancel, setSelectedReservation, handleReviewClick), [handleCancel, handleReviewClick]);
  const data = useMemo(() => reservations, [reservations]);

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
      <ManageRentalDialog
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onSuccess={onRefresh}
        readOnly={true}
        hideClientDetails={true}
      />
      <LeaveReviewDialog
        bookId={reviewTarget?.bookId ?? null}
        bookTitle={reviewTarget?.bookTitle ?? ""}
        onClose={() => setReviewTarget(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
