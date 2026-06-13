namespace LibraryPlus.Models.Book;

public class BookModel
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = "";
    public int? AuthorId { get; set; }
    public AuthorModel? Author { get; set; }
    public int? PublisherId { get; set; }
    public PublisherModel? Publisher { get; set; }
    public string Language { get; set; } = null!;
    public int PublicationYear { get; set; }
    public int PagesCount { get; set; }
    public ICollection<CategoryModel> Categories { get; set; } = new List<CategoryModel>();
    public decimal RepurchasePrice { get; set; }
    public string? OriginalTitle { get; set; }
    public string? OriginalLanguage { get; set; }
    public int? OriginalPublicationYear { get; set; }
    public int? OriginalPublisherId { get; set; }
    public PublisherModel? OriginalPublisher { get; set; }
    public int Popularity { get; set; }
    public byte[]? CoverImage { get; set; }
    public string? CoverImageContentType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public ICollection<BookUnitModel> BookUnits { get; set; } = new List<BookUnitModel>();
}