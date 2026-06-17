"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useCallback } from "react";
import {
  GetReservationsParams,
  getUserReservationPages,
  getUserReservations,
} from "@/lib/api/reservations";
import { ReservationItem } from "@/types/reservation/Reservation";

import { PaginationControls } from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import UserRentalsTable from "./UserRentalsTable";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Reserved", label: "Pending" },
  { value: "Taken", label: "Rented" },
  { value: "Returned", label: "Returned" },
  { value: "Canceled", label: "Canceled" },
  { value: "Overdue", label: "Overdue" },
];

export default function UserRentalsTab() {
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue, 500);

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params: GetReservationsParams = {
        pageNumber,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(debouncedSearch && { searchToken: debouncedSearch }),
      };

      const [data, pages] = await Promise.all([
        getUserReservations(params),
        getUserReservationPages(params),
      ]);

      setReservations(data);
      setTotalPages(Math.max(1, pages));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, statusFilter, debouncedSearch]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(() => setPageNumber(1), 0);
    return () => clearTimeout(t);
  }, [debouncedSearch, statusFilter]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setInputValue("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Rentals</h2>
          <p className="text-muted-foreground">
            View and manage your book rentals and fines here.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-1 w-full max-w-md">
            <Input
              className="h-10 text-base"
              placeholder="Search by book title..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button variant="outline" className="h-10 w-10 p-0 pointer-events-none shrink-0">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading your rentals...</div>
      ) : error ? (
        <div className="text-destructive py-8">Error loading rentals. Please try again later.</div>
      ) : (
        <div className="flex flex-col justify-between space-y-4">
          <UserRentalsTable reservations={reservations} onRefresh={fetchData} />

          <div className="flex justify-center mt-4">
            <PaginationControls 
              pageNumber={pageNumber} 
              totalPages={totalPages} 
              onPageChange={setPageNumber} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
