import BookCatalogTable from "@/components/profile/dashboard/book-catalog/BookCatalogTable";
import BookCatalogToolbar from "@/components/profile/dashboard/book-catalog/BookCatalogToolbar";
import { BookCard } from "@/types/book/Book";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookCatalogPage({ searchParams }: Props) {
  const params = new URLSearchParams();
  Object.entries(await searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.append(key, value);
    }
  });

  if (!params.has("pageNumber")) {
    params.set("pageNumber", "1");
  }

  const response = await fetch(
    `${process.env.API_URL}/books?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const books: BookCard[] = response.ok ? await response.json() : [];

  return (
    <section className="space-y-4">
      <BookCatalogToolbar />
      {!response.ok ? (
        <div className="text-destructive">Failed to fetch books</div>
      ) : null}
      <BookCatalogTable books={books} />
    </section>
  );
}
