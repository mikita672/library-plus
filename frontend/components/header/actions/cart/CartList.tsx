"use client"

import { BookCard } from "@/types/book/Book";
import { useEffect, useState } from "react";

interface Props {
    ids: string[],
}

function CartList({ ids }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [books, setBooks] = useState<BookCard[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
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

    return books.map((book, index) => (
        <div key={index}>{book.title}</div>
    ));
}

export default CartList