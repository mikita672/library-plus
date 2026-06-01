import {
  AddBookUnitRequest,
  Book,
  BookCard,
  CreateBookRequest,
  UpdateBookRequest,
} from "@/types/book/Book";

export interface GetBooksParams {
  searchToken?: string;
  authorId?: string;
  publisherId?: string;
  categoryIds?: string[];
  minPublicationYear?: number;
  maxPublicationYear?: number;
  isAvailable?: boolean;
  pageNumber?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

function buildSearchParams(params: GetBooksParams): URLSearchParams {
  const sp = new URLSearchParams();

  if (params.searchToken) sp.set("searchToken", params.searchToken);
  if (params.authorId) sp.set("authorId", params.authorId);
  if (params.publisherId) sp.set("publisherId", params.publisherId);
  params.categoryIds?.forEach((id) => sp.append("categoryIds", id));
  if (params.minPublicationYear != null)
    sp.set("minPublicationYear", String(params.minPublicationYear));
  if (params.maxPublicationYear != null)
    sp.set("maxPublicationYear", String(params.maxPublicationYear));
  if (params.isAvailable != null)
    sp.set("isAvailable", String(params.isAvailable));
  if (params.pageNumber != null)
    sp.set("pageNumber", String(params.pageNumber));
  if (params.sortBy) sp.set("sortBy", params.sortBy);
  if (params.sortDescending != null)
    sp.set("sortDescending", String(params.sortDescending));

  return sp;
}

export async function getBooks(
  params: GetBooksParams,
  baseUrl?: string,
): Promise<BookCard[]> {
  const sp = buildSearchParams(params);
  const url = baseUrl
    ? `${baseUrl}/books?${sp.toString()}`
    : `/api/books?${sp.toString()}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) return [];
  return res.json() as Promise<BookCard[]>;
}

export async function updateBook(
  id: string,
  body: UpdateBookRequest,
): Promise<void> {
  const res = await fetch(`/api/books/book/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to update book (${res.status})`);
  }
}

export async function deleteBook(id: string): Promise<void> {
  const res = await fetch(`/api/books/book/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to delete book (${res.status})`);
  }
}

export async function addBookUnit(bookId: string): Promise<void> {
  const body: AddBookUnitRequest = { bookId };
  const res = await fetch(`/api/books/bookUnit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to add book unit (${res.status})`);
  }
}

export async function deleteBookUnit(unitId: string): Promise<void> {
  const res = await fetch(`/api/books/bookUnit/${unitId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to delete book unit (${res.status})`);
  }
}

export async function createBook(body: CreateBookRequest): Promise<Book> {
  const res = await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to create book (${res.status})`);
  }

  return res.json() as Promise<Book>;
}

export async function addBookUnits(
  bookId: string,
  count: number,
): Promise<void> {
  const requests = Array.from({ length: count }, () => addBookUnit(bookId));
  await Promise.all(requests);
}
