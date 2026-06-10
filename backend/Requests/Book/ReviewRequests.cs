namespace LibraryPlus.Requests.Book;

public record CreateReviewRequest(
    int BookId,
    int Rating,
    string? ReviewText
);
