"use client"

import BookEntriesSkeleton from "@/components/checkout/BookEntriesSkeleton";
import BookEntry from "@/components/checkout/BookEntry";
import { Button } from "@/components/ui/button";
import { cartContext } from "@/context/cartContext"
import { BookCard } from "@/types/book/Book";
import { addDays, endOfDay, format, setDate } from "date-fns";
import Link from "next/link";
import { useContext, useEffect, useState } from "react"
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

function CheckoutPage() {
    const { bookIds, removeBook } = useContext(cartContext);
    const [isLoading, setIsLoading] = useState(true);
    const [books, setBooks] = useState<BookCard[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [dateRanges, setDateRanges] = useState<Record<string, DateRange | undefined>>({});
    const booksThatCanBeReserved = books.filter(book =>
        book.isAvailable &&
        dateRanges[book.id]?.from !== undefined &&
        dateRanges[book.id]?.to !== undefined
    );

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
        if (newRange?.to !== undefined && newRange?.from !== undefined && newRange.to < newRange.from) {
            newRange.to = new Date(newRange.from);
        }
        const newDateRanges = { ...dateRanges };
        newDateRanges[id] = newRange;
        setDateRanges(newDateRanges);
    }

    const handleReservation = async () => {
        const requests: Promise<Response>[] = [];
        for (const book of booksThatCanBeReserved) {
            const dateRange = dateRanges[book.id];
            if (dateRange?.from === undefined || dateRange?.to === undefined) {
                return;
            }
            requests.push(fetch('/api/reservations', {
                method: "POST",
                body: JSON.stringify({
                    bookId: book.id,
                    startDate: dateRange.from,
                    endDate: dateRange.to,
                }),
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                }
            }));
        }
        const responses = await Promise.allSettled(requests);
        const reservedBooksIds = [];
        let i = 0;
        for (const response of responses) {
            const bookId = booksThatCanBeReserved[i].id;
            i++;
            if (response.status === 'rejected' || !response.value.ok) {
                continue;
            }
            reservedBooksIds.push(bookId);
        }
        if (reservedBooksIds.length === 0) {
            toast.error("Failed to reserve books");
        } else {
            toast.success(`Reserved ${reservedBooksIds.length} books`);
        }
        for (const bookId of reservedBooksIds) {
            removeBook(bookId);
        }
    }

    return (
        <div className="w-full min-h-[70vh] bg-card px-6 py-4 grid grid-cols-3 gap-6">
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

            <div className="col-span-1 flex flex-col gap-4">
                <p className="text-xl font-bold text-center invisible">Hello</p>

                <div className="p-4 bg-background flex flex-col gap-4">
                    <p className="text-lg">Checkout</p>

                    {booksThatCanBeReserved.length === 0 ?
                        <div className="flex flex-col gap-2">
                            <p>You do not have books that can be reserved right now</p>
                            <p>See our catalog for books that are available</p>
                            <Link href="/catalog">
                                <Button className="bg-primary text-light cursor-pointer hover:opacity-80 text-lg w-full">
                                    Browse catalog
                                </Button>
                            </Link>
                        </div> :
                        <div className="w-full flex flex-col gap-4">
                            <div className="w-full flex flex-col gap-1">
                                <p>Books that can be reserved:</p>
                                {booksThatCanBeReserved.map(book => (
                                    <li key={book.id} className="ml-8"><b>{book.title}</b>: {
                                        dateRanges[book.id]?.from ? (
                                            dateRanges[book.id]?.to ? (
                                                <>
                                                    {format(dateRanges[book.id]!.from!, "LLL dd, y")} -{" "}
                                                    {format(dateRanges[book.id]!.to!, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRanges[book.id]!.from!, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )
                                    }
                                    </li>
                                ))}
                            </div>

                            <Button
                                className="bg-primary text-lg font-bold cursor-pointer py-4"
                                onClick={handleReservation}
                            >
                                Reserve
                            </Button>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default CheckoutPage