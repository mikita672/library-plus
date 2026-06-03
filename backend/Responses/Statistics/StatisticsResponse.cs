namespace LibraryPlus.Responses.Statistics;

public record StatisticsResponse(
    long TotalBooksAmount,
    long TotalMembers,
    long BooksRented,
    long BooksInStock,
    string MostPopularBook,
    long UserCount,
    long NewMembers,
    long NewBooks,
    string MostPopularCategory,
    long ReturnDelayed
);
