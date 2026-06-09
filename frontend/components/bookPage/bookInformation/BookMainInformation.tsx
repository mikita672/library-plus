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

          <ScrollToExtendedInformation />
        </div>

        <AddToCardButton id={book.id} isAvailable={book.isAvailable} />
      </div>
    </div>
  );
}

export default BookMainInformation;
