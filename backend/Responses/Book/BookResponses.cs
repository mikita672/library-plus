namespace LibraryPlus.Responses.Book;

public record BookCardResponse(
    string Id,
    string Title,
    string Language,
    string? AuthorName,
    uint PublicationYear,
    uint? OriginalPublicationYear,
    string? CoverURI
);