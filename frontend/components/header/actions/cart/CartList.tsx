"use client"

import { cartContext } from "@/context/cartContext";
import { BookCard } from "@/types/book/Book";
import { TrashIcon } from "@phosphor-icons/react";
import { useContext, useEffect, useState } from "react";

interface Props {
    ids: string[],
}

function CartList({ ids }: Props) {
    const { removeBook } = useContext(cartContext);
    const [isLoading, setIsLoading] = useState(false);
    const [books, setBooks] = useState<BookCard[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const response = await fetch('/api/books/multiple', {
                method: "POST",
                body: JSON.stringify(ids),
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
    }, [ids]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error !== null) {
        return <p>Error occured: {error}</p>
    }

    return books.map((book, index) => (
        <div
            key={index}
            className="w-full bg-background grid grid-cols-6 gap-2 p-2"
        >
            <div className="h-full col-span-5 flex items-center gap-2">
                <img
                    src={book.coverURI ?? "/images/book-placeholder.png"}
                    className="w-full max-w-[64px] h-[64px] object-contain"
                    alt="Book cover"
                />

                <div className="h-full flex flex-col justify-around">
                    <p className="font-bold">{book.title}</p>

                    <p className="opacity-70">Author: {book.authorName ?? "Unknown"}</p>

                    {book.isAvailable ?
                        <p>Available now</p> : <p className="text-destructive">Not Available</p>}
                </div>
            </div>

            <div className="col-span-1 flex justify-center items-center">
                <TrashIcon
                    className="text-destructive w-6 h-6 cursor-pointer"
                    onClick={() => {
                        removeBook(book.id);
                    }}
                />
            </div>
        </div>
    ));
}

export default CartList