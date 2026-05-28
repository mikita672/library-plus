"use client"

import BookEntriesSkeleton from "@/components/checkout/BookEntriesSkeleton";
import BookEntry from "@/components/checkout/BookEntry";
import { Skeleton } from "@/components/ui/skeleton";
import { cartContext } from "@/context/cartContext"
import { BookCard } from "@/types/book/Book";
import { useContext, useEffect, useState } from "react"

function CheckoutPage() {
    const { bookIds } = useContext(cartContext);
    const [isLoading, setIsLoading] = useState(true);
    const [books, setBooks] = useState<BookCard[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (bookIds === null) {
            return;
        }

        (async () => {
            const response = await fetch('/api/books/multiple', {
                method: "POST",
                body: JSON.stringify(bookIds),
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });
            if (!response.ok) {
                setError("Failed to get books from cart");
                return;
            }
            const booksData: BookCard[] = await response.json();
            setBooks(booksData);
        })().then(() => {
            setIsLoading(false);
        });

    }, [bookIds]);

    if (bookIds === null) {
        return <></>;
    }

    return (
        <div className="w-full min-h-[60vh] bg-card p-4 grid grid-cols-4">
            {error === null ? <></> : <p className="col-span-4 h-full items-center justify-center">Error occured: {error}</p>}

            <div className="col-span-3 h-full flex flex-col gap-4">
                {isLoading ? <BookEntriesSkeleton /> : <></>}

                {books.map((book) => (
                    <BookEntry book={book} key={book.id} />
                ))}
            </div>
        </div>
    )
}

export default CheckoutPage