export type ReservationStatus =
  | "Reserved"
  | "Taken"
  | "Returned"
  | "Overdue";

export interface ReservationItem {
  id: string;
  bookUnitId: string;
  userId: string;
  startDate: string;
  endDate: string;
  returnedDate?: string | null;
  bookConditionUponReturn?: string | null;
  status: string;
  repurchasePrice: number;
  createdAt: string;
}
