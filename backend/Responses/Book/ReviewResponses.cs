namespace LibraryPlus.Responses.Book;

public record ReviewResponse(
    int Id,
    int BookId,
    int Rating,
    string? ReviewText,
    string? UserName,
    string? UserEmail,
    string? UserAvatarUrl,
    DateTime CreatedAt
);

public record BookReviewsResponse(
    IList<ReviewResponse> Reviews,
    int TotalCount,
    int TotalPages
);

public record BookRatingSummary(
    double AverageRating,
    int ReviewCount
);
