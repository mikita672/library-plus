import { BookCard } from '@/types/book/Book';
import BookResult from './BookResult';

interface Props {
    params: URLSearchParams;
}

async function BookResults({ params }: Props) {
    const response = await fetch(`${process.env.API_URL}/books?${params.toString()}`, {
        method: "GET",
    });

    if (!response.ok) {
        return <div className="text-destructive">Failed to fetch books</div>
    }

    const books: BookCard[] = await response.json();

    if (books.length === 0) {
        return <div>No books found</div>
    }

    return (
        <div className="w-full grid grid-cols-4 gap-x-12 gap-y-4">
            {books.map((b, index) => (
                <BookResult key={b.id} book={b} priority={index < 8} />
            ))}
        </div>
    )
}

export default BookResults