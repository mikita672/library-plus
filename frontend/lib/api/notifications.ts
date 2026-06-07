import { Notification } from "@/types/user/Notification";

export async function getNotifications(page: number): Promise<Notification[]> {
  const sp = new URLSearchParams();
  sp.set("pageNumber", String(page));
  const res = await fetch(`/api/users/notifications?${sp.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json() as Promise<Notification[]>;
}

export async function getNotificationsCount(): Promise<{ pagesCount: number; notReadCount: number }> {
  const res = await fetch("/api/users/notifications/count", {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return { pagesCount: 0, notReadCount: 0 };
  return res.json();
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const res = await fetch(`/api/notifications/read/${id}`, {
    method: "PATCH",
  });
  return res.ok;
}

export async function sendNotificationToUser(
  email: string,
  subject: string,
  text: string,
): Promise<boolean> {
  const res = await fetch("/api/notifications/sendOne", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      notificationBody: { subject, text },
    }),
  });
  return res.ok;
}

export async function sendNotificationToAll(
  subject: string,
  text: string,
): Promise<boolean> {
  const res = await fetch("/api/notifications/sendAll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, text }),
  });
  return res.ok;
}

export interface UserSuggestion {
  email: string;
  name: string | null;
}

export async function suggestUsers(query: string): Promise<UserSuggestion[]> {
  const sp = new URLSearchParams();
  sp.set("query", query);
  const res = await fetch(`/api/notifications/suggestUsers?${sp.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json() as Promise<UserSuggestion[]>;
}
