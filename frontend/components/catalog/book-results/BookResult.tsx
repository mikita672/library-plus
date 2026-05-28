"use client"

import { Button } from "@/components/ui/button";
import { cartContext } from "@/context/cartContext";
import { BookCard } from "@/types/book/Book"
import Link from "next/link";
import { useContext } from "react";

interface Props {
    book: BookCard
}

function BookResult({ book }: Props) {
    const { bookIds, addBook, removeBook } = useContext(cartContext);

    return (
        <div className="col-span-1 bg-background flex flex-col items-center p-2 gap-2">
            <img
                src={book.coverURI ?? "/images/book-placeholder.png"}
                className="w-full max-w-[235px] h-[235px] object-contain"
                alt="Book cover"
            />

            <div className="w-full">
                <p>{book.title}</p>
                <p className="opacity-50">Language: {book.language}</p>
                {book.authorName === null ? <></> : <p className="opacity-50">Author: {book.authorName}</p>}
                <p className="opacity-50">Publication year: {book.originalPublicationYear ?? book.publicationYear}</p>
                {book.isAvailable ?
                    <p>Available now</p> : <p className="text-destructive">Not Available</p>}
            </div>

            <div className="w-full grid grid-cols-2 gap-2">
                <Link href="#" className="col-span-1">
                    {bookIds?.includes(book.id) ?
                        <Button className="w-full bg-primary cursor-pointer" onClick={() => {
                            removeBook(book.id);
                        }}>
                            Added to cart
                        </Button> :
                        (
                            book.isAvailable ?
                                <Button className="w-full bg-primary cursor-pointer" onClick={() => {
                                    addBook(book.id);
                                }}>
                                    Rent now
                                </Button> :
                                <Button className="w-full bg-accent text-foreground cursor-pointer opacity-80" onClick={() => {
                                    addBook(book.id);
                                }}>
                                    Rent now
                                </Button>
                        )
                    }
                </Link>

                <Link href={`/book/${book.id}`} className="col-span-1">
                    <Button className="w-full bg-accent text-foreground cursor-pointer">
                        Learn more
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default BookResult