import { Book } from '@/types/book/Book';
import Image from 'next/image';
import React from 'react'
import { Button } from '../ui/button';

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function BookResults({ searchParams }: Props) {
    const params = new URLSearchParams();
    Object.entries(await searchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else if (value) {
            params.append(key, value);
        }
    });

    const response = await fetch(`${process.env.API_URL}/book?${params.toString()}`, {
        method: "GET",
    });

    if (!response.ok) {
        return <div className="text-destructive">Failed to fetch books</div>
    }

    const books: Book[] = await response.json();

    console.dir({ books });

    if (books.length === 0) {
        return <div>No books found</div>
    }

    return (
        <div className="col-span-10 grid grid-cols-4 gap-x-12 gap-y-4">
            {books.map((b) => (
                <div key={b.id} className="col-span-1 bg-background flex flex-col items-center p-2 gap-2">
                    <img
                        src={b.coverURI ?? "/images/book-placeholder.png"}
                        className="w-[235px] h-[235px]"
                        alt="Book cover"
                    />

                    <div className="w-full">
                        <p>{b.title}</p>
                        <p className="opacity-50">{b.language}</p>
                        <p className="opacity-50">{b.publicationYear}</p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2">
                        <Button className="cols-span-1 cursor-pointer">Rent now</Button>
                        <Button className="cols-span-1 bg-accent text-foreground cursor-pointer">Learn more</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default BookResults