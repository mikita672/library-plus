import { Book } from '@/types/book/Book'
import React from 'react'

interface Props {
    book: Book;
}

function BookInformation({ book }: Props) {
    return (
        <div className="w-full bg-background p-6 grid grid-cols-2">
            <div className="col-span-1 flex justify-center">
                <img
                    src={book.coverURI ?? "/images/book-placeholder.png"}
                    className="h-[550px] shadow-md object-contain"
                    alt="Book cover"
                />
            </div>

            <div className="col-span-1 flex flex-col">
                <p className="font-bold text-2xl">{book.title}</p>
            </div>
        </div>
    )
}

export default BookInformation