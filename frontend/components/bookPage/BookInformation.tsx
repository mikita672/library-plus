import { BookPreview } from '@/types/book/Book'
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface Props {
    book: BookPreview;
}

function BookInformation({ book }: Props) {
    return (
        <div className="w-full bg-background p-6 grid grid-cols-2">
            <div className="col-span-1 flex justify-center">
                <img
                    src={book.coverURI ?? "/images/book-placeholder.png"}
                    className="h-[500px] shadow-md object-contain"
                    alt="Book cover"
                />
            </div>

            <div className="col-span-1 flex flex-col pl-24 gap-24">
                <div className="w-full flex flex-col gap-2">
                    <p className="font-bold text-2xl">{book.title}</p>
                    {book.author === null ? <></> :
                        <p>Author: <Link
                            className="underline text-primary"
                            href={`/catalog?authorId=${book.author?.id}`}
                        >{book.author?.name}</Link></p>
                    }
                    {book.publisher === null ? <></> :
                        <p>Publisher: <Link
                            className="underline text-primary"
                            href={`/catalog?publisherId=${book.publisher?.id}`}
                        >{book.publisher?.name}</Link></p>
                    }
                    <p>Language: {book.language}</p>
                    <p>Publication year: {book.publicationYear}</p>

                    {book.categories.length === 0 ? <></> :
                        <div className="w-full flex items-center gap-1">
                            Categories: {book.categories.map((category, i) => (
                                <Link key={category.id} href={`/catalog?categoryIds=${category.id}`}>
                                    <Badge>{category.name}</Badge>
                                </Link>
                            ))}
                        </div>
                    }

                    <p className="text-primary underline cursor-pointer">More information</p>
                </div>

                <div className="w-full">
                    {book.isAvailable ? <></> : <p className="text-destructive">Not available</p>}
                    <Button className={`py-6 px-12 font-bold text-2xl ${book.isAvailable ? "bg-primary cursor-pointer" : "bg-accent cursor-not-allowed text-foreground opacity-50"}`}>Add to your cart!</Button>


                </div>
            </div>
        </div>
    )
}

export default BookInformation