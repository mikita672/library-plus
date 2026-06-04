"use client"

import { Button } from "@/components/ui/button";
import { cartContext } from "@/context/cartContext";
import { BookCard } from "@/types/book/Book"
import Link from "next/link";
import { useContext } from "react";
import Image from "next/image";

interface Props {
    book: BookCard
}

function BookResult({ book }: Props) {
    const { bookIds, addBook, removeBook } = useContext(cartContext);

    return (
        <div className="col-span-1 bg-background flex flex-col items-center p-2 gap-2">
            <div className="relative w-full max-w-[235px] h-[235px]">
                <Image
                    src={book.coverURI ?? "/images/book-placeholder.png"}
                    fill
                    unoptimized={!!book.coverURI}
                    className="object-contain"
                    alt="Book cover"
                />
            </div>

            <div className="w-full">
                <p>{book.title.length > 36 ? book.title.substring(0, 33) + '...' : book.title}</p>
                <p className="opacity-50">Language: {book.language}</p>
                <p className="opacity-50">Author: {book.authorName ?? "Unknown"}</p>
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
                        <Button className="w-full bg-primary cursor-pointer" onClick={() => {
                            addBook(book.id);
                        }}>
                            Rent now
                        </Button>
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