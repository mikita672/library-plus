import { Category } from "@/types/book/Category";

export async function getCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories", { method: "GET" });
  if (!res.ok) return [];
  return res.json() as Promise<Category[]>;
}

export async function createCategory(name: string): Promise<Category | null> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to create category (${res.status})`);
  }

  return res.json() as Promise<Category>;
}

export async function updateCategory(
  id: string,
  name: string,
): Promise<void> {
  const res = await fetch(`/api/categories/category/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to update category (${res.status})`);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/category/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to delete category (${res.status})`);
  }
}
