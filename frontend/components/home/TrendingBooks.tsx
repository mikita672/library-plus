import { BookCard, BookPreview } from "@/types/book/Book";
import BooksCarousel from "../BooksCarousel";

async function TrendingBooks() {
  const response = await fetch(
    `${process.env.API_URL}/books/popular`,
    { method: "GET" },
  );

  if (!response.ok) {
    return <></>;
  }

  const books: BookCard[] = await response.json();
  if (books.length === 0) {
    return <></>;
  }

  return (
    <div className="w-full flex flex-col items-center gap-4 py-6">
      <span className="text-xl font-bold">Popular books</span>

      <BooksCarousel books={books} includeAuthor={true} />
    </div>
  );
}

export default TrendingBooks