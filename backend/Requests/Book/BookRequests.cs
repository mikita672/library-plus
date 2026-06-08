namespace LibraryPlus.Requests.Book;

public record CreateBookRequest(
    string Title,
    string Description,
    string Language,
    int PublicationYear,
    int PagesCount,
    decimal RepurchasePrice,
    IList<string> CategoryIds,
    string? AuthorId,
    string? PublisherId,
    string? OriginalTitle,
    string? OriginalLanguage,
    int? OriginalPublicationYear,
    string? OriginalPublisherId
);

public record UpdateBookRequest(
    string Title,
    string Description,
    string Language,
    int PublicationYear,
    int PagesCount,
    decimal RepurchasePrice,
    IList<string> CategoryIds,
    string? AuthorId,
    string? PublisherId,
    string? OriginalTitle,
    string? OriginalLanguage,
    int? OriginalPublicationYear,
    string? OriginalPublisherId
);

public record AddBookUnitRequest(
    string BookId
);