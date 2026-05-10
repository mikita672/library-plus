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
    string NewTitle,
    string NewDescription,
    string NewLanguage,
    uint NewPublicationYear,
    uint NewPagesCount,
    decimal NewRepurchasePrice,
    IList<string> NewCategoryIds,
    string? NewAuthorId,
    string? NewPublisherId,
    string? NewOriginalTitle,
    string? NewOriginalLanguage,
    uint? NewOriginalPublicationYear,
    string? NewOriginalPublisherId
);

public record AddBookUnitRequest(
    string BookId
);