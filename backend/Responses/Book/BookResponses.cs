using LibraryPlus.Models.Book;

namespace LibraryPlus.Responses.Book;

public record BookPreviewResponse(
    string Id,
    string Title,
    string Description,
    AuthorModel? Author,
    PublisherModel? Publisher,
    string Language,
    int PublicationYear,
    int PagesCount,
    IList<CategoryModel> Categories,
    string? OriginalTitle,
    string? OriginalLanguage,
    int? OriginalPublicationYear,
    PublisherModel? OriginalPublisherId,
    string? CoverURI,
    bool IsAvailable
);

public record BookCardResponse(
    string Id,
    string Title,
    string Language,
    string? AuthorName,
    string? CategoryName,
    string? PublisherName,
    int PublicationYear,
    int? OriginalPublicationYear,
    string? CoverURI,
    bool IsAvailable
);