namespace LibraryPlus.Requests.Book;

public record CreateBookRequest(
    string Title,
    string Description,
    string Language,
    uint PublicationYear,
    uint PagesCount,
    decimal RepurchasePrice,
    IList<string> CategoryIds,
    string? AuthorId,
    string? PublisherId,
    string? OriginalTitle,
    string? OriginalLanguage,
    uint? OriginalPublicationYear,
    string? OriginalPublisherId
);

public record UpdateBookRequest(
    string Title,
    string Description,
    string Language,
    uint PublicationYear,
    uint PagesCount,
    decimal RepurchasePrice,
    IList<string> CategoryIds,
    string? AuthorId,
    string? PublisherId,
    string? OriginalTitle,
    string? OriginalLanguage,
    uint? OriginalPublicationYear,
    string? OriginalPublisherId
);

public record AddBookUnitRequest(
    string BookId
);