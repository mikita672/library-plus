import {
  BookReviewsResponse,
  CreateReviewRequest,
} from "@/types/book/Review";

export async function getBookReviews(
  bookId: number,
  page: number,
): Promise<BookReviewsResponse> {
  const sp = new URLSearchParams();
  sp.set("pageNumber", String(page));

  const res = await fetch(`/api/books/book/${bookId}/reviews?${sp.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    return { reviews: [], totalCount: 0, totalPages: 0 };
  }

  return res.json() as Promise<BookReviewsResponse>;
}

export async function createReview(
  bookId: number,
  rating: number,
  reviewText?: string | null,
): Promise<boolean> {
  const body: CreateReviewRequest = { bookId, rating, reviewText };
  const res = await fetch(`/api/books/book/${bookId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  return res.ok;
}
