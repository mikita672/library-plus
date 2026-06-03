"use client";

import { useCallback, useEffect, useState, type SubmitEvent } from "react";

import { getBookById, getBookUnitById } from "@/lib/api/books";
import {
  GetReservationsParams,
  getReservationPages,
  getReservations,
} from "@/lib/api/reservations";
import { getUserById } from "@/lib/api/users";
import { EnrichedReservationItem } from "@/types/reservation/Reservation";

import RentalsTable from "./RentalsTable";
import { PaginationControls } from "@/components/ui/pagination-controls";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
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
  const [allReservations, setAllReservations] = useState<
    EnrichedReservationItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchToken, setSearchToken] = useState("");
  const [inputValue, setInputValue] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params: GetReservationsParams = {
        pageNumber,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(searchToken ? { searchToken } : {}),
      };

      const [data, pages] = await Promise.all([
        getReservations(params),
        getReservationPages(params),
      ]);

      const uniqueUserIds = Array.from(new Set(data.map((r) => r.userId)));
      const uniqueUnitIds = Array.from(new Set(data.map((r) => r.bookUnitId)));

      const usersData = await Promise.all(
        uniqueUserIds.map((id) =>
          getUserById(id)
            .then((u) => ({ id, user: u }))
            .catch(() => ({ id, user: null })),
        ),
      );
      const userMap = Object.fromEntries(
        usersData.map(({ id, user }) => [id, user]),
      );

      const unitsData = await Promise.all(
        uniqueUnitIds.map((id) =>
          getBookUnitById(id)
            .then(async (unit) => {
              if (!unit) return { id, book: null };
              const book = await getBookById(unit.bookId).catch(() => null);
              return { id, book };
            })
            .catch(() => ({ id, book: null })),
        ),
      );
      const unitBookMap = Object.fromEntries(
        unitsData.map(({ id, book }) => [id, book]),
      );

      const enrichedData: EnrichedReservationItem[] = data.map((r) => {
        const u = userMap[r.userId];
        const b = unitBookMap[r.bookUnitId];
        return {
          ...r,
          clientName: u?.name || "Unknown User",
          clientEmail: u?.email || "",
          clientPhone: u?.phoneNumber || "none",
          bookTitle: b?.title || "Unknown Book",
          bookAuthor: b?.author?.name || "Unknown Author",
          bookLanguage: b?.language || "Unknown Language",
          bookYear: b?.publicationYear || 0,
          bookCoverUri: b?.coverURI || "",
        };
      });

      setAllReservations(enrichedData);
      setTotalPages(Math.max(1, pages));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, statusFilter, searchToken]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSearch = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchToken(inputValue);
    setPageNumber(1);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setSearchToken("");
    setInputValue("");
    setPageNumber(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 max-w mr-4 gap-2">
          <Input
            className="h-10 text-base"
            placeholder="Search reservations (book, client name or email)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button type="submit" variant="outline" className="h-10 w-10 p-0">
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Status</Label>
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
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : error ? (
        <div className="text-destructive py-8">
          Failed to fetch reservations
        </div>
      ) : (
        <div className="min-h-[600px] flex flex-col justify-between">
          <RentalsTable reservations={allReservations} onRefresh={fetchData} />
          <PaginationControls
            pageNumber={pageNumber}
            totalPages={totalPages}
            onPageChange={setPageNumber}
          />
        </div>
      )}
    </div>
  );
}
