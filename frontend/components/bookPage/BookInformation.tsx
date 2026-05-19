import { BookPreview } from '@/types/book/Book'
import Link from 'next/link';

interface Props {
    book: BookPreview;
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

            <div className="col-span-1 flex flex-col pl-24">
                <p className="font-bold text-2xl">{book.title}</p>
                {book.author === null ? <></> :
                    <p>Author: <Link href={`/catalog?authorId=${book.author?.id}`}>{book.author?.name}</Link></p>
                }
            </div>
        </div>
    )
}

export default BookInformation