import BookInformation from '@/components/bookPage/BookInformation';
import { Book } from '@/types/book/Book';
import { notFound } from 'next/navigation';

async function BookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: bookId } = await params;

    const response = await fetch(`${process.env.API_URL}/books/book/${bookId}`, {
        method: "GET",
    });

    if (!response.ok) {
        console.error("NOT FOUND");
        notFound();
    }

    const book: Book = await response.json();

    return (
        <div className="w-full bg-card p-6">
            <BookInformation book={book} />
        </div>
    )
}

export default BookPage