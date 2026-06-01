"use client";

import { DotsThreeIcon } from "@phosphor-icons/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReservationItem } from "@/types/reservation/Reservation";

import { BookTitleCell, ClientNameCell } from "./AsyncTableCells";

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
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold ${colorClasses}`}
    >
      {label}
    </span>
  );
}

function buildColumns(): ColumnDef<ReservationItem>[] {
  return [
    {
      accessorKey: "userId",
      header: "Client",
      cell: ({ row }) => <ClientNameCell userId={row.original.userId} />,
    },
    {
      accessorKey: "bookUnitId",
      header: "Book",
      cell: ({ row }) => <BookTitleCell bookUnitId={row.original.bookUnitId} />,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => <div>{formatDate(row.original.startDate)}</div>,
    },
    {
      accessorKey: "endDate",
      header: "Due Date",
      cell: ({ row }) => <div>{formatDate(row.original.endDate)}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: () => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled
            aria-label="Manage reservation"
          >
            <DotsThreeIcon className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];
}

interface Props {
  reservations: ReservationItem[];
}

export default function RentalsTable({ reservations }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = buildColumns();

  const table = useReactTable({
    data: reservations,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
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
    </div>
  );
}
