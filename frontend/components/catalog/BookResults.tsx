import { BookCard } from '@/types/book/Book';
import { Button } from '../ui/button';
import Link from 'next/link';

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
            {books.map((b) => (
                <div key={b.id} className="col-span-1 bg-background flex flex-col items-center p-2 gap-2">
                    <img
                        src={b.coverURI ?? "/images/book-placeholder.png"}
                        className="h-[235px] shadow-sm"
                        alt="Book cover"
                    />

                    <div className="w-full">
                        <p>{b.title}</p>
                        <p className="opacity-50">Language: {b.language}</p>
                        {b.authorName === null ? <></> : <p className="opacity-50">Author: {b.authorName}</p>}
                        <p className="opacity-50">Publication year: {b.originalPublicationYear ?? b.publicationYear}</p>
                        {b.isAvailable ?
                            <p>Available now</p> : <p className="text-destructive">Not Available</p>}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2">
                        <Button className="cols-span-1 cursor-pointer">Rent now</Button>
                        <Button className="cols-span-1 bg-accent text-foreground cursor-pointer">
                            <Link href={`/book/${b.id}`}>Learn more</Link>
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default BookResults