"use client";
import { BookPreview } from "@/types/book/Book";
import Link from "next/link";
import { Badge } from "../../ui/badge";
import ScrollToExtendedInformation from "./ScrollToExtendedInformation";
import AddToCardButton from "./AddToCardButton";
import React from "react";
import Image from "next/image";

interface Props {
  book: BookPreview;
}

function BookMainInformation({ book }: Props) {
  return (
    <div className="w-full grid grid-cols-2">
      <div className="col-span-1 flex justify-center">
        <div className="relative h-125 w-full max-w-100">
          <Image
            src={book.coverURI || "/images/book-placeholder.png"}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized={!!book.coverURI}
            className="shadow-md object-contain"
            alt="Book cover"
            priority
            onError={(e) => {
              e.currentTarget.src = "/images/book-placeholder.png";
              e.currentTarget.srcset = "";
            }}
          />
        </div>
      </div>

      <div className="col-span-1 flex flex-col pl-24 gap-24">
        <div className="w-full flex flex-col gap-2">
          <p className="font-bold text-2xl">{book.title}</p>
          {book.author === null ? (
            <></>
          ) : (
            <p>
              Author:{" "}
              <Link
                className="underline text-primary"
                href={`/catalog?authorId=${book.author?.id}`}
              >
                {book.author?.name}
              </Link>
            </p>
          )}
          {book.publisher === null ? (
            <></>
          ) : (
            <p>
              Publisher:{" "}
              <Link
                className="underline text-primary"
                href={`/catalog?publisherId=${book.publisher?.id}`}
              >
                {book.publisher?.name}
              </Link>
            </p>
          )}
          <p>Language: {book.language}</p>
          <p>Publication year: {book.publicationYear}</p>

          {book.categories.length === 0 ? (
            <></>
          ) : (
            <div className="w-full flex items-center gap-1">
              Categories:{" "}
              {book.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/catalog?categoryIds=${category.id}`}
                >
                  <Badge>{category.name}</Badge>
                </Link>
              ))}
            </div>
          )}

          <div className="w-full flex items-center gap-2 mt-2">
            <div className="flex items-center text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 font-medium">{book.averageRating > 0 ? book.averageRating.toFixed(1) : "0"}</span>
            </div>
            <span className="text-muted-foreground text-sm">
              ({book.reviewCount} {book.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>

          <ScrollToExtendedInformation />
        </div>

        <AddToCardButton id={book.id} isAvailable={book.isAvailable} />
      </div>
    </div>
  );
}

export default BookMainInformation;
