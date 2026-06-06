"use client";

import { useCallback, useEffect, useState } from "react";
import { getBookById, getBookUnitById } from "@/lib/api/books";
import { getUserReservations, getUserReservationPages, GetReservationsParams } from "@/lib/api/reservations";
import { EnrichedReservationItem } from "@/types/reservation/Reservation";
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
import { useDebounce } from "@/hooks/useDebounce";

import UserRentalsTable from "./UserRentalsTable";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Reserved", label: "Pending" },
  { value: "Taken", label: "Rented" },
  { value: "Returned", label: "Returned" },
  { value: "Overdue", label: "Overdue" },
];

export default function UserRentalsTab() {
  const [allReservations, setAllReservations] = useState<EnrichedReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue, 500);

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

      const unitIds = [...new Set(data.map((r) => r.bookUnitId))];

      const units = await Promise.all(unitIds.map((id) => getBookUnitById(id).catch(() => null)));
      const unitMap = Object.fromEntries(unitIds.map((id, i) => [id, units[i]]));

      const bookIds = [...new Set(units.map((u) => u?.bookId).filter(Boolean) as string[])];
      const books = await Promise.all(bookIds.map((id) => getBookById(id).catch(() => null)));
      const bookMap = Object.fromEntries(bookIds.map((id, i) => [id, books[i]]));

      const enriched: EnrichedReservationItem[] = data.map((r) => {
        const bu = unitMap[r.bookUnitId];
        const b = bu ? bookMap[bu.bookId] : null;
        return {
          ...r,
          clientName: "",
          clientEmail: "",
          clientPhone: "",
          bookTitle: b?.title || "Unknown",
          bookAuthor: b?.author?.name || "Unknown",
          bookLanguage: b?.language || "Unknown",
          bookYear: b?.publicationYear || 0,
          bookCoverUri: b?.coverURI || "",
        };
      });

      setAllReservations(enriched);
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
    setPageNumber(1);
  }, [debouncedSearch, statusFilter]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setInputValue("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Rentals</h2>
          <p className="text-muted-foreground">
            View and manage your book rentals and fines here.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
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
        <div className="min-h-100 flex flex-col justify-between space-y-4">
          <UserRentalsTable reservations={allReservations} />
          
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
