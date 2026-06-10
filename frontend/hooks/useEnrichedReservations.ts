import { useState, useCallback, useEffect } from "react";
import { getBookById, getBookUnitById } from "@/lib/api/books";
import {
  GetReservationsParams,
  getReservationPages,
  getReservations,
  getUserReservationPages,
  getUserReservations,
} from "@/lib/api/reservations";
import { getUserById, UserMeShort } from "@/lib/api/users";
import { EnrichedReservationItem } from "@/types/reservation/Reservation";

interface UseEnrichedReservationsProps {
  pageNumber: number;
  statusFilter: string;
  debouncedSearch: string;
  isUserView?: boolean;
}

export function useEnrichedReservations({
  pageNumber,
  statusFilter,
  debouncedSearch,
  isUserView = false,
}: UseEnrichedReservationsProps) {
  const [reservations, setReservations] = useState<EnrichedReservationItem[]>([]);
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

      const fetchFn = isUserView ? getUserReservations : getReservations;
      const fetchPagesFn = isUserView ? getUserReservationPages : getReservationPages;

      const [data, pages] = await Promise.all([
        fetchFn(params),
        fetchPagesFn(params),
      ]);

      const unitIds = [...new Set(data.map((r) => r.bookUnitId))];
      const units = await Promise.all(unitIds.map((id) => getBookUnitById(Number(id)).catch(() => null)));
      const unitMap = Object.fromEntries(unitIds.map((id, i) => [id, units[i]]));

      const bookIds = [...new Set(units.map((u) => u?.bookId).filter(Boolean) as number[])];
      const books = await Promise.all(bookIds.map((id) => getBookById(Number(id)).catch(() => null)));
      const bookMap = Object.fromEntries(bookIds.map((id, i) => [id, books[i]]));

      let userMap: Record<number, UserMeShort | null> = {};
      if (!isUserView) {
        const userIds = [...new Set(data.map((r) => r.userId))];
        const users = await Promise.all(userIds.map((id) => getUserById(id).catch(() => null)));
        userMap = Object.fromEntries(userIds.map((id, i) => [id, users[i]]));
      }

      const enriched: EnrichedReservationItem[] = data.map((r) => {
        const u = isUserView ? null : userMap[r.userId];
        const bu = unitMap[r.bookUnitId];
        const b = bu ? bookMap[bu.bookId] : null;
        return {
          ...r,
          clientName: u?.name || u?.email || (isUserView ? "" : "Unknown"),
          clientEmail: u?.email || "",
          clientPhone: u?.phoneNumber || (isUserView ? "" : "none"),
          clientAvatarUrl: u?.avatarUrl || "",
          bookTitle: b?.title || "Unknown",
          bookAuthor: b?.author?.name || "Unknown",
          bookLanguage: b?.language || "Unknown",
          bookYear: b?.publicationYear || 0,
          bookCoverUri: b?.coverURI || "",
        };
      });

      setReservations(enriched);
      setTotalPages(Math.max(1, pages));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, statusFilter, debouncedSearch, isUserView]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    reservations,
    loading,
    error,
    totalPages,
    refetch: fetchData,
  };
}
