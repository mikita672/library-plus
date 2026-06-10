namespace LibraryPlus.Requests.Book;

public record CreateBookRequest(
    string Title,
    string Description,
    string Language,
    int PublicationYear,
    int PagesCount,
    decimal RepurchasePrice,
    IList<int> CategoryIds,
    int? AuthorId,
    int? PublisherId,
    string? OriginalTitle,
    string? OriginalLanguage,
    int? OriginalPublicationYear,
    int? OriginalPublisherId
);

public record UpdateBookRequest(
    string Title,
    string Description,
    string Language,
    int PublicationYear,
    int PagesCount,
    decimal RepurchasePrice,
    IList<int> CategoryIds,
    int? AuthorId,
    int? PublisherId,
    string? OriginalTitle,
    string? OriginalLanguage,
    int? OriginalPublicationYear,
    int? OriginalPublisherId
);

public record AddBookUnitRequest(
    int BookId
);