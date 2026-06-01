"use client";

import { useCallback, useEffect, useState } from "react";

import { getBooks, type GetBooksParams } from "@/lib/api/books";
import { BookCard } from "@/types/book/Book";
import AddBookDialog from "./AddBookDialog";
import BookCatalogTable from "./BookCatalogTable";

export default function BooksTab() {
  const [books, setBooks] = useState<BookCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params: GetBooksParams = { pageNumber: 1 };
      const data = await getBooks(params);
      setBooks(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBooks();
  }, [fetchBooks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <AddBookDialog />
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="text-destructive">Failed to fetch books</div>
      ) : (
        <BookCatalogTable books={books} />
      )}
    </div>
  );
}
