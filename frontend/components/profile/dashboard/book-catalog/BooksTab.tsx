"use client";

import { FadersIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState, type SubmitEvent } from "react";

import { getAuthors } from "@/lib/api/authors";
import { getBookPages, getBooks, type GetBooksParams } from "@/lib/api/books";
import { getPublishers } from "@/lib/api/publishers";

import { Author } from "@/types/book/Author";
import { BookCard } from "@/types/book/Book";
import { Publisher } from "@/types/book/Publisher";

import AddBookDialog from "./AddBookDialog";
import BookCatalogTable from "./BookCatalogTable";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BooksTab() {
  const [books, setBooks] = useState<BookCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);

  const [inputValue, setInputValue] = useState("");
  const [searchToken, setSearchToken] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [authorId, setAuthorId] = useState<string>("all");
  const [publisherId, setPublisherId] = useState<string>("all");
  const [isAvailable, setIsAvailable] = useState<string>("all");
  const [minYear, setMinYear] = useState<string>("");
  const [maxYear, setMaxYear] = useState<string>("");

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [a, p] = await Promise.all([getAuthors(), getPublishers()]);
        setAuthors(a);
        setPublishers(p);
      } catch (err) {
        console.error("Failed to load lookups", err);
      }
    };
    void loadLookups();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchToken !== inputValue) {
        setSearchToken(inputValue);
        setPageNumber(1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [inputValue, searchToken]);

  const fetchBooksAndPages = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params: GetBooksParams = {
        pageNumber,
        ...(searchToken ? { searchToken } : {}),
        ...(authorId !== "all" ? { authorId } : {}),
        ...(publisherId !== "all" ? { publisherId } : {}),
        ...(isAvailable !== "all"
          ? { isAvailable: isAvailable === "true" }
          : {}),
        ...(minYear ? { minPublicationYear: parseInt(minYear) } : {}),
        ...(maxYear ? { maxPublicationYear: parseInt(maxYear) } : {}),
      };

      const [booksData, pagesData] = await Promise.all([
        getBooks(params),
        getBookPages(params),
      ]);
      setBooks(booksData);
      setTotalPages(Math.max(1, pagesData));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [
    pageNumber,
    searchToken,
    authorId,
    publisherId,
    isAvailable,
    minYear,
    maxYear,
  ]);

  useEffect(() => {
    void fetchBooksAndPages();
  }, [fetchBooksAndPages]);

  const handleSearch = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchToken(inputValue);
    setPageNumber(1);
  };

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    val: string,
  ) => {
    setter(val);
    setPageNumber(1);
  };

  const handleClearFilters = () => {
    setInputValue("");
    setSearchToken("");
    setAuthorId("all");
    setPublisherId("all");
    setIsAvailable("all");
    setMinYear("");
    setMaxYear("");
    setPageNumber(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 max-w mr-4 gap-2">
          <Input
            className="h-10 text-base"
            placeholder="Search books..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button type="submit" variant="outline" className="h-10 w-10 p-0">
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <AddBookDialog />
      </div>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FadersIcon className="h-4 w-4" />
            Advanced Filters
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 p-4 border bg-muted/30">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Author</Label>
              <Select
                value={authorId}
                onValueChange={(v) => handleFilterChange(setAuthorId, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All authors</SelectItem>
                  {authors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Publisher</Label>
              <Select
                value={publisherId}
                onValueChange={(v) => handleFilterChange(setPublisherId, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All publishers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All publishers</SelectItem>
                  {publishers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
              <Select
                value={isAvailable}
                onValueChange={(v) => handleFilterChange(setIsAvailable, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any status</SelectItem>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Year</Label>
              <Input
                type="number"
                placeholder="e.g. 1990"
                value={minYear}
                onChange={(e) => handleFilterChange(setMinYear, e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Year</Label>
              <Input
                type="number"
                placeholder="e.g. 2024"
                value={maxYear}
                onChange={(e) => handleFilterChange(setMaxYear, e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : error ? (
        <div className="text-destructive py-8">Failed to fetch books</div>
      ) : (
        <>
          <BookCatalogTable books={books} />
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pageNumber > 1) setPageNumber((p) => p - 1);
                    }}
                    className={
                      pageNumber <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                <span className="text-sm text-muted-foreground px-4">
                  Page {pageNumber} of {totalPages}
                </span>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pageNumber < totalPages) setPageNumber((p) => p + 1);
                    }}
                    className={
                      pageNumber >= totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
