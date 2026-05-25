import { BookCard, BookPreview } from "@/types/book/Book";
import BooksCarousel from "../BooksCarousel";

interface Props {
    book: BookPreview,
}

async function OtherBooksByAuthor({ book }: Props) {
    if (book.author === null) {
        return <></>;
    }

    const response = await fetch(
        `${process.env.API_URL}/books/booksByAuthor/${book.author?.id}?excludedBookId=${book.id}`,
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
            <span className="text-xl font-bold">Other books by {book.author?.name}</span>

            <BooksCarousel books={books} />
        </div>
    );
}

export default OtherBooksByAuthor
