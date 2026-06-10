export interface ReviewResponse {
  id: number;
  bookId: number;
  rating: number;
  reviewText?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userAvatarUrl?: string | null;
  createdAt: string;
}

export interface BookReviewsResponse {
  reviews: ReviewResponse[];
  totalCount: number;
  totalPages: number;
}

export interface BookRatingSummary {
  averageRating: number;
  reviewCount: number;
}

export interface CreateReviewRequest {
  bookId: number;
  rating: number;
  reviewText?: string | null;
}
