import BookCatalogTable from "@/components/profile/dashboard/book-catalog/BookCatalogTable";
import BookCatalogToolbar from "@/components/profile/dashboard/book-catalog/BookCatalogToolbar";
import { getBooks, GetBooksParams } from "@/lib/api/books";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookCatalogPage({ searchParams }: Props) {
  const rawParams = await searchParams;

  const params: GetBooksParams = {
    searchToken: rawParams.searchToken as string | undefined,
    authorId: rawParams.authorId as string | undefined,
    publisherId: rawParams.publisherId as string | undefined,
    categoryIds: Array.isArray(rawParams.categoryIds)
      ? rawParams.categoryIds
      : rawParams.categoryIds
        ? [rawParams.categoryIds]
        : undefined,
    minPublicationYear: rawParams.minPublicationYear
      ? Number(rawParams.minPublicationYear)
      : undefined,
    maxPublicationYear: rawParams.maxPublicationYear
      ? Number(rawParams.maxPublicationYear)
      : undefined,
    isAvailable: rawParams.isAvailable
      ? rawParams.isAvailable === "true"
      : undefined,
    pageNumber: rawParams.pageNumber ? Number(rawParams.pageNumber) : 1,
    sortBy: rawParams.sortBy as string | undefined,
    sortDescending: rawParams.sortDescending
      ? rawParams.sortDescending === "true"
      : undefined,
  };

  const { books, error } = await getBooks(params, process.env.API_URL).then(
    (books) => ({ books, error: false }),
    () => ({ books: [], error: true }),
  );

  return (
    <section className="space-y-4">
      <BookCatalogToolbar />
      {error ? (
        <div className="text-destructive">Failed to fetch books</div>
      ) : null}
      <BookCatalogTable books={books} />
    </section>
  );
}
