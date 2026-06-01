using LibraryPlus.Models.Book;

namespace LibraryPlus.Responses.Book;

public record BookPreviewResponse(
    string Id,
    string Title,
    string Description,
    AuthorModel? Author,
    PublisherModel? Publisher,
    string Language,
    uint PublicationYear,
    uint PagesCount,
    IList<CategoryModel> Categories,
    string? OriginalTitle,
    string? OriginalLanguage,
    uint? OriginalPublicationYear,
    PublisherModel? OriginalPublisherId,
    string? CoverURI,
    bool IsAvailable
);

public record BookCardResponse(
    string Id,
    string Title,
    string Language,
    string? AuthorName,
    uint PublicationYear,
    uint? OriginalPublicationYear,
    string? CoverURI,
    bool IsAvailable
);