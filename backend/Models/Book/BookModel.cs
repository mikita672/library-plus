namespace LibraryPlus.Models.Book;

public class BookModel
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = "";
    public int? AuthorId { get; set; }
    public int? PublisherId { get; set; }
    public string Language { get; set; } = null!;
    public int PublicationYear { get; set; }
    public int PagesCount { get; set; }
    public IList<int> CategoryIds { get; set; } = null!;
    public decimal RepurchasePrice { get; set; }
    public string? OriginalTitle { get; set; }
    public string? OriginalLanguage { get; set; }
    public int? OriginalPublicationYear { get; set; }
    public int? OriginalPublisherId { get; set; }
    public int Popularity { get; set; }
    public byte[]? CoverImage { get; set; }
    public string? CoverImageContentType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}