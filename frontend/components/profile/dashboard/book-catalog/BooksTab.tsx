"use client";

import { useCallback, useEffect, useState } from "react";
import { FadersIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

import { getAuthors } from "@/lib/api/authors";
import { getBooks, getBooksPages } from "@/lib/api/books";
import { getCategories } from "@/lib/api/categories";
import { getPublishers } from "@/lib/api/publishers";
import { Author } from "@/types/book/Author";
import { BookCard } from "@/types/book/Book";
import { Category } from "@/types/book/Category";
import { Publisher } from "@/types/book/Publisher";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddBookDialog from "./AddBookDialog";
import BookCatalogTable from "./BookCatalogTable";
import { PaginationControls } from "@/components/ui/pagination-controls";

const SORT_OPTIONS = [
  { value: "title", label: "Title" },
  { value: "publicationyear", label: "Year" },
  { value: "relevancy", label: "Popularity" },
];

export default function BooksTab() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<BookCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [inputValue, setInputValue] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(inputValue, 500);

  const [authorId, setAuthorId] = useState(searchParams.get("authorId") || "all");
  const [publisherId, setPublisherId] = useState(searchParams.get("publisherId") || "all");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryIds") || "all");
  const [sortBy, setSortBy] = useState("title");
  const [sortDescending, setSortDescending] = useState(false);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchBooksAndPages = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {
        searchToken: debouncedSearch,
        authorId: authorId === "all" ? undefined : authorId,
        publisherId: publisherId === "all" ? undefined : publisherId,
        categoryIds: categoryId === "all" ? [] : [categoryId],
        pageNumber,
        sortBy,
        sortDescending,
      };

      const [data, pages] = await Promise.all([getBooks(params), getBooksPages(params)]);
      setBooks(data);
      setTotalPages(Math.max(1, pages));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, authorId, publisherId, categoryId, pageNumber, sortBy, sortDescending]);

  useEffect(() => { void fetchBooksAndPages(); }, [fetchBooksAndPages]);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [a, p, c] = await Promise.all([getAuthors(), getPublishers(), getCategories()]);
        setAuthors(a);
        setPublishers(p);
        setCategories(c);
      } catch (e) { console.error(e); }
    };
    void loadLookups();
  }, []);

  useEffect(() => { setPageNumber(1); }, [debouncedSearch, authorId, publisherId, categoryId, sortBy, sortDescending]);

  const handleClearFilters = () => {
    setInputValue("");
    setAuthorId("all");
    setPublisherId("all");
    setCategoryId("all");
    setSortBy("title");
    setSortDescending(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 max-w mr-4 gap-2">
          <Input
            className="h-10 text-base"
            placeholder="Search books..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button variant="outline" className="h-10 w-10 p-0 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Button>
        </div>
        <AddBookDialog onSuccess={fetchBooksAndPages} />
      </div>

      <Collapsible>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <FadersIcon size={16} /> Filters
            </Button>
          </CollapsibleTrigger>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear all</Button>
        </div>

        <CollapsibleContent className="mt-4 p-4 border border-black space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Author</Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Publisher</Label>
              <Select value={publisherId} onValueChange={setPublisherId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Publishers</SelectItem>
                  {publishers.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-black pt-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Select value={sortDescending ? "desc" : "asc"} onValueChange={(v) => setSortDescending(v === "desc")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-destructive py-8">Error loading books</div>
      ) : (
        <div className="min-h-150 flex flex-col justify-between">
          <BookCatalogTable books={books} onSuccess={fetchBooksAndPages} />
          <PaginationControls pageNumber={pageNumber} totalPages={totalPages} onPageChange={setPageNumber} />
        </div>
      )}
    </div>
  );
}
