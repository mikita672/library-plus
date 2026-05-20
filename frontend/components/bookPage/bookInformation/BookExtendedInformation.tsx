import { BookPreview } from '@/types/book/Book'
import React from 'react'

interface Props {
    book: BookPreview;
}

function BookExtendedInformation({ book }: Props) {
    return (
        <div id="book-extended-information" className="w-full grid grid-cols-2 px-12 gap-24">
            <div className="col-span-1">
                <p className="text-lg font-bold">Book description</p>
                <p>{book.description}</p>
            </div>

            <div className="col-span-1">
                <p className="text-lg font-bold">Detailed information</p>

                <div className="w-full grid grid-cols-2">
                    <div className="col-span-1">
                        <p>Title: {book.title}</p>
                        <p>Language: {book.language}</p>
                        <p>Author: {book.author?.name ?? "Unknown"}</p>
                        <p>Publisher: {book.publisher?.name ?? "Unknown"}</p>
                        <p>Year of publication: {book.publicationYear}</p>
                    </div>

                    <div className="col-span-1">
                        <p>Number of pages: {book.pagesCount}</p>
                        <p>Original title: {book.originalTitle ?? "Unknown"}</p>
                        <p>Language of the original: {book.originalLanguage ?? "Unknown"}</p>
                        <p>Original publisher: {book.originalPublisher?.name ?? "Unknown"}</p>
                        <p>Original publication year: {book.originalPublicationYear ?? "Unknown"}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookExtendedInformation