namespace LibraryPlus.Requests.Book;

public record CreateBookRequest(
    string Title,
    string Description,
    string Language,
    uint PublicationYear,
    uint PagesCount,
    decimal RepurchasePrice,
    string AuthorId,
    string PublisherId,
    string? OriginalTitle,
    string? OriginalLanguage,
    uint? OriginalPublicationYear,
    string? OriginalPublisherId
);