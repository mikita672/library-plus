import { EnrichedReservationItem, ReservationItem } from "@/types/reservation/Reservation";

export interface GetReservationsParams {
  pageNumber: number;
  status?: string;
  searchToken?: string;
}

export async function getReservations(
  params: GetReservationsParams,
): Promise<ReservationItem[]> {
  const sp = new URLSearchParams();
  sp.set("pageNumber", String(params.pageNumber));
  if (params.status) sp.set("status", params.status);
  if (params.searchToken) sp.set("searchToken", params.searchToken);

  const res = await fetch(`/api/reservations/all?${sp.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json() as Promise<ReservationItem[]>;
}

export async function getUserReservations(
  pageNumber: number,
): Promise<ReservationItem[]> {
  const sp = new URLSearchParams();
  sp.set("pageNumber", String(pageNumber));

  const res = await fetch(`/api/reservations?${sp.toString()}`, {
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
  if (params.searchToken) sp.set("searchToken", params.searchToken);

  const res = await fetch(`/api/reservations/all/pages?${sp.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return 1;
  return res.json() as Promise<number>;
}

export interface ReturnReservationPayload {
  bookConditionUponReturn: string;
  additionalNote: string;
  startDate: string;
  endDate: string;
}

export async function returnReservation(
  id: string,
  payload: ReturnReservationPayload,
): Promise<boolean> {
  const res = await fetch(`/api/reservations/reservation/${id}/return`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

export async function updateReservationStatus(
  id: string,
  status: string,
): Promise<boolean> {
  const res = await fetch(`/api/reservations/reservation/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.ok;
}
