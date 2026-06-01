import { ReservationItem } from "@/types/reservation/Reservation";

export interface GetReservationsParams {
  pageNumber: number;
  status?: string;
}

export async function getReservations(
  params: GetReservationsParams,
): Promise<ReservationItem[]> {
  const sp = new URLSearchParams();
  sp.set("pageNumber", String(params.pageNumber));
  if (params.status) sp.set("status", params.status);

  const res = await fetch(`/api/reservations/all?${sp.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json() as Promise<ReservationItem[]>;
}

export async function getReservationPages(
  params: GetReservationsParams,
): Promise<number> {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);

  const res = await fetch(`/api/reservations/all/pages?${sp.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return 1;
  return res.json() as Promise<number>;
}
