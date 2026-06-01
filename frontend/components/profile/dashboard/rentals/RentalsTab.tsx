"use client";

import { useCallback, useEffect, useState } from "react";

import {
  GetReservationsParams,
  getReservationPages,
  getReservations,
} from "@/lib/api/reservations";
import { ReservationItem } from "@/types/reservation/Reservation";

import RentalsTable from "./RentalsTable";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Reserved", label: "Pending" },
  { value: "Taken", label: "Rented" },
  { value: "Returned", label: "Returned" },
  { value: "Overdue", label: "Overdue" },
];

export default function RentalsTab() {
  const [allReservations, setAllReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params: GetReservationsParams = {
        pageNumber,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      };

      const [data, pages] = await Promise.all([
        getReservations(params),
        getReservationPages(params),
      ]);
      setAllReservations(data);
      setTotalPages(Math.max(1, pages));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, statusFilter]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setPageNumber(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPageNumber(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">
          Loading...
        </div>
      ) : error ? (
        <div className="text-destructive py-8">
          Failed to fetch reservations
        </div>
      ) : (
        <>
          <RentalsTable reservations={allReservations} />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pageNumber} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
