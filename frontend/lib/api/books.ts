import {
  AddBookUnitRequest,
  Book,
  BookCard,
  BookPreview,
  BookUnit,
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
  includeInactive?: boolean;
}

function buildSearchParams(params: GetBooksParams): URLSearchParams {
  const sp = new URLSearchParams();

  if (params.searchToken) {
      sp.set("searchToken", params.searchToken);
  }
  if (params.authorId) {
      sp.set("authorId", params.authorId);
  }
  if (params.publisherId) {
      sp.set("publisherId", params.publisherId);
  }
  params.categoryIds?.forEach((id) => sp.append("categoryIds", id));
  if (params.minPublicationYear != null) {
      sp.set("minPublicationYear", String(params.minPublicationYear));
  }
  if (params.maxPublicationYear != null) {
      sp.set("maxPublicationYear", String(params.maxPublicationYear));
  }
  if (params.isAvailable != null) {
      sp.set("isAvailable", String(params.isAvailable));
  }
  if (params.pageNumber != null) {
      sp.set("pageNumber", String(params.pageNumber));
  }
  if (params.sortBy) {
      sp.set("sortBy", params.sortBy);
  }
  if (params.sortDescending != null) {
      sp.set("sortDescending", String(params.sortDescending));
  }
  if (params.includeInactive != null) {
      sp.set("includeInactive", String(params.includeInactive));
  }

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
  if (!res.ok) {
      return [];
  }
  return res.json() as Promise<BookCard[]>;
}

export async function getBooksPages(
  params: GetBooksParams,
  baseUrl?: string,
): Promise<number> {
  const sp = buildSearchParams(params);
  const url = baseUrl
    ? `${baseUrl}/books/pages?${sp.toString()}`
    : `/api/books/pages?${sp.toString()}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
      return 1;
  }
  return res.json() as Promise<number>;
}

export async function getBookById(id: number): Promise<BookPreview> {
  const res = await fetch(`/api/books/book/${id}`, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch book (${res.status})`);
  }
  return res.json() as Promise<BookPreview>;
}

export async function updateBook(
  id: number,
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

export async function deleteBook(id: number): Promise<void> {
  const res = await fetch(`/api/books/book/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Failed to delete book (${res.status})`);
  }
}

export async function getBookUnitById(id: number): Promise<BookUnit | null> {
  const res = await fetch(`/api/books/bookUnit/${id}`, {
    method: "GET",
    cache: "force-cache",
  });
  if (!res.ok) {
      return null;
  }
  return res.json() as Promise<BookUnit>;
}

export async function addBookUnit(bookId: number): Promise<void> {
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

export async function deleteBookUnit(unitId: number): Promise<void> {
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
  bookId: number,
  count: number,
): Promise<void> {
  const requests = Array.from({ length: count }, () => addBookUnit(bookId));
  await Promise.all(requests);
}

export async function getBookUnitsForBook(bookId: number): Promise<BookUnit[]> {
  const res = await fetch(`/api/books/book/${bookId}/units`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
      return [];
  }
  return res.json() as Promise<BookUnit[]>;
}

export async function archiveBookUnit(unitId: number): Promise<boolean> {
  const res = await fetch(`/api/books/bookUnit/${unitId}/archive`, {
    method: "PATCH",
    credentials: "include",
  });
  return res.ok;
}

export async function unarchiveBookUnit(unitId: number): Promise<boolean> {
  const res = await fetch(`/api/books/bookUnit/${unitId}/unarchive`, {
    method: "PATCH",
    credentials: "include",
  });
  return res.ok;
}

export async function getReviewedBooks(): Promise<number[]> {
  const res = await fetch(`/api/books/me/reviewed-books`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
      return [];
  }
  return res.json() as Promise<number[]>;
}
