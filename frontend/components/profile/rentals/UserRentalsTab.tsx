"use client";

import { useCallback, useEffect, useState } from "react";
import { getBookById, getBookUnitById } from "@/lib/api/books";
import { getUserReservations } from "@/lib/api/reservations";
import { EnrichedReservationItem, ReservationItem } from "@/types/reservation/Reservation";
import { PaginationControls } from "@/components/ui/pagination-controls";

import UserRentalsTable from "./UserRentalsTable";

export default function UserRentalsTab() {
  const [allReservations, setAllReservations] = useState<EnrichedReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data: ReservationItem[] = await getUserReservations(pageNumber);
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
      setHasMore(data.length === 8);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pageNumber]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Rentals</h2>
        <p className="text-muted-foreground">
          View and manage your book rentals and fines here.
        </p>
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
              totalPages={hasMore ? pageNumber + 1 : pageNumber} 
              onPageChange={setPageNumber} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
