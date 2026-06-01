import { Publisher } from "@/types/book/Publisher";

export async function getPublishers(): Promise<Publisher[]> {
  const res = await fetch("/api/publishers", { method: "GET" });
  if (!res.ok) return [];
  return res.json() as Promise<Publisher[]>;
}

export async function createPublisher(name: string): Promise<Publisher | null> {
  const res = await fetch("/api/publishers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to create publisher (${res.status})`);
  }

  return res.json() as Promise<Publisher>;
}

export async function updatePublisher(
  id: string,
  name: string,
): Promise<void> {
  const res = await fetch(`/api/publishers/publisher/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to update publisher (${res.status})`);
  }
}

export async function deletePublisher(id: string): Promise<void> {
  const res = await fetch(`/api/publishers/publisher/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to delete publisher (${res.status})`);
  }
}
