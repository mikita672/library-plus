"use client"

import BookEntriesSkeleton from "@/components/checkout/BookEntriesSkeleton";
import BookEntry from "@/components/checkout/BookEntry";
import { Button } from "@/components/ui/button";
import { cartContext } from "@/context/cartContext"
import { BookCard } from "@/types/book/Book";
import { addDays, setDate } from "date-fns";
import Link from "next/link";
import { useContext, useEffect, useState } from "react"
import { DateRange } from "react-day-picker";

function CheckoutPage() {
    const { bookIds } = useContext(cartContext);
    const [isLoading, setIsLoading] = useState(true);
    const [books, setBooks] = useState<BookCard[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [dateRanges, setDateRanges] = useState<Record<string, DateRange | undefined>>({});

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

            const newDateRanges: Record<string, DateRange | undefined> = {};
            for (const book of booksData) {
                if (book.id in dateRanges) {
                    newDateRanges[book.id] = dateRanges[book.id];
                } else {
                    newDateRanges[book.id] = {
                        from: new Date(),
                        to: addDays(new Date(), 21),
                    };
                }
            }

            setBooks(booksData);
            setDateRanges(newDateRanges);
        })().then(() => {
            setIsLoading(false);
        });
    }, [bookIds]);

    if (bookIds === null) {
        return <></>;
    }

    if (error !== null) {
        return (
            <p className="flex w-full h-full items-center justify-center">Error occured: {error}</p>
        );
    }

    const changeDateRange = (id: string, newRange: DateRange | undefined) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (newRange?.from !== undefined && newRange.from < today) {
            newRange.from = today;
        }
        const newDateRanges = { ...dateRanges };
        newDateRanges[id] = newRange;
        setDateRanges(newDateRanges);
    }

    return (
        <div className="w-full min-h-[70vh] bg-card px-6 py-4 grid grid-cols-3">
            <div className="col-span-2 h-full flex flex-col gap-4">
                <p className="text-xl font-bold text-center">Your cart</p>

                {isLoading ? <BookEntriesSkeleton /> :
                    (
                        books.length === 0 ?
                            <div className="w-full h-full flex flex-col justify-center items-center gap-4">
                                <p className="text-xl">Your cart is empty...</p>
                                <Link href="/catalog">
                                    <Button className="bg-primary text-light cursor-pointer hover:opacity-80 text-lg px-8 py-6">
                                        Browse catalog
                                    </Button>
                                </Link>
                            </div> :
                            <></>
                    )
                }

                {books.map((book) => (
                    <BookEntry
                        key={book.id}
                        book={book}
                        dateRange={dateRanges[book.id]}
                        changeDateRange={(newRange: DateRange | undefined) => {
                            changeDateRange(book.id, newRange);
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default CheckoutPage