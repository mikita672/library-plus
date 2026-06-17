import { ReservationItem } from "@/types/reservation/Reservation";

export function calculateFine(reservation: ReservationItem): number {
  let fine = 0;

  if (reservation.bookConditionUponReturn?.toLowerCase().includes("minor")) {
    fine += reservation.repurchasePrice / 3;
  }

  if (reservation.status.toLowerCase() === "overdue") {
    const dueDate = new Date(reservation.endDate);
    const now = new Date();

    if (now > dueDate) {
      const diffTime = Math.abs(now.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine += diffDays * 1;
    }
  }

  return Math.round(fine * 100) / 100;
}
