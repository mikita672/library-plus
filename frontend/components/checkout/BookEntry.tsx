"use client"

import { cartContext } from "@/context/cartContext";
import { BookCard } from "@/types/book/Book"
import { TrashIcon } from "@phosphor-icons/react";
import { useContext } from "react";

interface Props {
    book: BookCard,
}

function BookEntry({ book }: Props) {
    const { removeBook } = useContext(cartContext);

    return (
        <div className="w-full grid grid-cols-2 items-center gap-24 bg-background p-4">
            <div className="col-span-1 flex items-center gap-4">
                <img
                    src={book.coverURI ?? "/images/book-placeholder.png"}
                    className="w-full max-w-[100px] h-[100px] object-contain"
                    alt="Book cover"
                />

                <div className="space-y-2">
                    <p className="text-xl font-bold">{book.title}</p>
                    <p className="opacity-50">Language: {book.language}</p>
                    {book.authorName === null ? <></> : <p className="opacity-50">Author: {book.authorName}</p>}
                    <p className="opacity-50">Publication year: {book.originalPublicationYear ?? book.publicationYear}</p>
                    {book.isAvailable ?
                        <p>Available now</p> : <p className="text-destructive">Not Available</p>}
                </div>
            </div>

            <div className="col-span-1 flex items-center justify-center gap-4">
                <TrashIcon
                    className="text-destructive w-6 h-6 cursor-pointer"
                    onClick={() => {
                        removeBook(book.id);
                    }}
                />
            </div>
        </div>
    )
}

export default BookEntry