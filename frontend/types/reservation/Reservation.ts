export type ReservationStatus = "Reserved" | "Taken" | "Returned" | "Overdue";

export interface ReservationItem {
  id: number;
  bookUnitId: string;
  userId: number;
  startDate: string;
  endDate: string;
  returnedDate?: string | null;
  bookConditionUponReturn?: string | null;
  status: string;
  repurchasePrice: number;
  createdAt: string;
  additionalNote?: string | null;
}

export interface EnrichedReservationItem extends ReservationItem {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  bookTitle: string;
  bookAuthor: string;
  bookLanguage: string;
  bookYear: number;
  bookCoverUri: string;
}
