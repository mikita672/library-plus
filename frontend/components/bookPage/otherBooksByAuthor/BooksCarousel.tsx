"use client"

import { Button } from "@/components/ui/button";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useWindowSize } from "@/hooks/useWindowSize";
import { BookCard } from "@/types/book/Book"
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
    books: BookCard[];
}

function BooksCarousel({ books }: Props) {
    const [api, setApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [booksPerSlide, setBooksPerSlide] = useState(3);
    const { width } = useWindowSize();

    useEffect(() => {
        if (!api) {
            return
        }

        setCurrentSlide(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrentSlide(api.selectedScrollSnap())
        })
    }, [api]);

    useEffect(() => {
        if ((width ?? 0) >= 768) {
            if (booksPerSlide === 1) {
                api?.scrollTo(0);
            }
            setBooksPerSlide(3);
        } else {
            if (booksPerSlide === 3) {
                api?.scrollTo(0);
            }
            setBooksPerSlide(1);
        }
    }, [width])

    return (
        <>
            <Carousel
                className="w-full lg:w-8/10"
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                    slidesToScroll: booksPerSlide,
                    containScroll: false,
                }}
            >
                <CarouselContent className="-ml-8">
                    {books.map((book, index) => (
                        <CarouselItem key={index} className="md:basis-1/3 pl-8">
                            <div className="w-full bg-background p-6 flex flex-col items-center gap-4">
                                <img
                                    src={book.coverURI ?? "/images/book-placeholder.png"}
                                    className="w-full max-w-[235px] h-[235px] object-contain"
                                    alt="Book cover"
                                />

                                <div className="w-full">
                                    <p className="text-lg font-bold">{book.title}</p>
                                    <p className="opacity-70">Language: {book.language}</p>
                                    <p className="opacity-70">Publication year: {book.publicationYear}</p>
                                    <p>{book.isAvailable}</p>
                                </div>

                                <Button className="w-full bg-primary text-light cursor-pointer hover:opacity-80 text-base py-3">
                                    <Link href={`/book/someid`}>Learn more</Link>
                                </Button>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {booksPerSlide === 3 ? <>
                    <CarouselPrevious size="lg" className="cursor-pointer" />
                    <CarouselNext size="lg" className="cursor-pointer" />
                </> : <></>}
            </Carousel>

            <div className="flex justify-center items-center gap-2">
                {Array.from({ length: Math.ceil(books.length / booksPerSlide) }).map((_, index) => (
                    <div key={index} className="w-5 h-5 rounded-full bg-background flex justify-center items-center">
                        {currentSlide === index ? <div className="w-3 h-3 rounded-full bg-primary" /> : <></>}
                    </div>
                ))}
            </div>
        </>
    )
}

export default BooksCarousel