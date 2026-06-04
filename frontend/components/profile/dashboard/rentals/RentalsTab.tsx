"use client";

import { useCallback, useEffect, useState } from "react";
import { getBookById, getBookUnitById } from "@/lib/api/books";
import {
  GetReservationsParams,
  getReservationPages,
  getReservations,
} from "@/lib/api/reservations";
import { getUserById } from "@/lib/api/users";
import { EnrichedReservationItem } from "@/types/reservation/Reservation";
import { useDebounce } from "@/hooks/useDebounce";

import RentalsTable from "./RentalsTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Reserved", label: "Pending" },
  { value: "Taken", label: "Rented" },
  { value: "Returned", label: "Returned" },
  { value: "Overdue", label: "Overdue" },
];

export default function RentalsTab() {
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
        getReservations(params),
        getReservationPages(params),
      ]);

      const userIds = [...new Set(data.map((r) => r.userId))];
      const unitIds = [...new Set(data.map((r) => r.bookUnitId))];

      const [users, units] = await Promise.all([
        Promise.all(userIds.map((id) => getUserById(id).catch(() => null))),
        Promise.all(unitIds.map((id) => getBookUnitById(id).catch(() => null))),
      ]);

      const userMap = Object.fromEntries(userIds.map((id, i) => [id, users[i]]));
      const unitMap = Object.fromEntries(unitIds.map((id, i) => [id, units[i]]));

      const bookIds = [...new Set(units.map((u) => u?.bookId).filter(Boolean) as string[])];
      const books = await Promise.all(bookIds.map((id) => getBookById(id).catch(() => null)));
      const bookMap = Object.fromEntries(bookIds.map((id, i) => [id, books[i]]));

      const enriched = data.map((r) => {
        const u = userMap[r.userId];
        const bu = unitMap[r.bookUnitId];
        const b = bu ? bookMap[bu.bookId] : null;
        return {
          ...r,
          clientName: u?.name || "Unknown",
          clientEmail: u?.email || "",
          clientPhone: u?.phoneNumber || "none",
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

  useEffect(() => { void fetchData(); }, [fetchData]);

  useEffect(() => { setPageNumber(1); }, [debouncedSearch, statusFilter]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setInputValue("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 max-w mr-4 gap-2">
          <Input
            className="h-10 text-base"
            placeholder="Search reservations..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button variant="outline" className="h-10 w-10 p-0 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-destructive py-8">Error loading reservations</div>
      ) : (
        <div className="min-h-[600px] flex flex-col justify-between">
          <RentalsTable reservations={allReservations} onRefresh={fetchData} />
          <PaginationControls pageNumber={pageNumber} totalPages={totalPages} onPageChange={setPageNumber} />
        </div>
      )}
    </div>
  );
}
