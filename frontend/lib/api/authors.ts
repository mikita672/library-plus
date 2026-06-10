import { Author } from "@/types/book/Author";

export async function getAuthors(): Promise<Author[]> {
  const res = await fetch("/api/authors", { method: "GET" });
  if (!res.ok) return [];
  return res.json() as Promise<Author[]>;
}

export async function createAuthor(name: string): Promise<Author | null> {
  const res = await fetch("/api/authors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to create author (${res.status})`);
  }

  return res.json() as Promise<Author>;
}

export async function updateAuthor(id: number, name: string): Promise<void> {
  const res = await fetch(`/api/authors/author/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to update author (${res.status})`);
  }
}

export async function deleteAuthor(id: number): Promise<void> {
  const res = await fetch(`/api/authors/author/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to delete author (${res.status})`);
  }
}
