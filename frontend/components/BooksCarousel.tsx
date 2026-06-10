"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { StarRating } from "@/components/ui/star-rating";
import { useWindowSize } from "@/hooks/useWindowSize";
import { BookCard } from "@/types/book/Book";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

interface Props {
  books: BookCard[];
  includeAuthor?: boolean;
}

function BooksCarousel({ books, includeAuthor }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { width } = useWindowSize();

  const booksPerSlide = useMemo(() => {
    return (width ?? 0) >= 768 ? 3 : 1;
  }, [width]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const initialSnap = api.selectedScrollSnap();
    const frame = requestAnimationFrame(() => {
      setCurrentSlide(initialSnap);
    });

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      cancelAnimationFrame(frame);
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (api) {
      api.scrollTo(0);
    }
  }, [api, booksPerSlide]);

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
                <div className="relative w-full max-w-58.75 h-58.75">
                  <Image
                    src={book.coverURI || "/images/book-placeholder.png"}
                    fill
                    sizes="(max-width: 768px) 100vw, 235px"
                    unoptimized={!!book.coverURI}
                    className="object-contain"
                    alt="Book cover"
                    priority={index < 6}
                  />
                </div>

                <div className="w-full">
                  <p className="text-lg font-bold">{book.title}</p>
                  <p className="opacity-70">Language: {book.language}</p>
                  {includeAuthor === true ? (
                    <p className="opacity-70">
                      Author: {book.authorName ?? "Unknown"}
                    </p>
                  ) : (
                    <></>
                  )}
                  <p className="opacity-70">
                    Publication year: {book.publicationYear}
                  </p>
                  {book.isAvailable ? (
                    <p>Available now</p>
                  ) : (
                    <p className="text-destructive">Not Available</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <StarRating rating={book.averageRating} size={14} />
                    <span className="text-xs text-muted-foreground">
                      {book.reviewCount === 0
                        ? "0 stars 0 reviews"
                        : `${book.averageRating.toFixed(1)} stars ${book.reviewCount} ${book.reviewCount === 1 ? "review" : "reviews"}`}
                    </span>
                  </div>
                </div>

                <Link className="w-full" href={`/book/${book.id}`}>
                  <Button className="w-full bg-primary text-light cursor-pointer hover:opacity-80 text-base py-3">
                    Learn more
                  </Button>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {booksPerSlide === 3 ? (
          <>
            <CarouselPrevious size="lg" className="cursor-pointer" />
            <CarouselNext size="lg" className="cursor-pointer" />
          </>
        ) : (
          <></>
        )}
      </Carousel>

      <div className="flex justify-center items-center gap-2">
        {Array.from({ length: Math.ceil(books.length / booksPerSlide) }).map(
          (_, index) => (
            <div
              key={index}
              className="w-5 h-5 rounded-full bg-background flex justify-center items-center"
            >
              {currentSlide === index ? (
                <div className="w-3 h-3 rounded-full bg-primary" />
              ) : (
                <></>
              )}
            </div>
          ),
        )}
      </div>
    </>
  );
}

export default BooksCarousel;
