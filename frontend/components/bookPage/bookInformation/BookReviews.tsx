"use client";

import { useEffect, useState, useCallback } from "react";
import { getBookReviews } from "@/lib/api/reviews";
import { ReviewResponse } from "@/types/book/Review";
import { StarRating } from "@/components/ui/star-rating";
import { PaginationControls } from "@/components/ui/pagination-controls";
import Image from "next/image";

interface Props {
  bookId: number;
}

function getDisplayName(review: ReviewResponse): string {
  if (review.userName) return review.userName;
  if (review.userEmail) return review.userEmail.split("@")[0];
  return "Anonymous";
}

function getInitial(review: ReviewResponse): string {
  if (review.userName) return review.userName.charAt(0).toUpperCase();
  if (review.userEmail) return review.userEmail.charAt(0).toUpperCase();
  return "?";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BookReviews({ bookId }: Props) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBookReviews(bookId, page);
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [bookId, page]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  if (loading) {
    return <div className="text-muted-foreground py-4">Loading reviews...</div>;
  }

  if (totalCount === 0) {
    return (
      <div className="text-muted-foreground py-4">
        No reviews yet. Be the first to review this book!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? "review" : "reviews"}
      </p>

      <div className="flex flex-col gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="flex gap-4 p-4 border border-border bg-background">
            <div className="shrink-0">
              {review.userAvatarUrl ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-full border">
                  <Image
                    src={review.userAvatarUrl}
                    alt={getDisplayName(review)}
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border">
                  <span className="text-muted-foreground text-sm font-semibold">
                    {getInitial(review)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{getDisplayName(review)}</span>
                <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
              </div>
              <StarRating rating={review.rating} size={14} />
              {review.reviewText && (
                <p className="text-sm mt-1">{review.reviewText}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <PaginationControls
        pageNumber={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
