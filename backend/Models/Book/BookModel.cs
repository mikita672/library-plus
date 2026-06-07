namespace LibraryPlus.Models.Book;

public class BookModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = null!;
    public string Description { get; set; } = "";
    public string? AuthorId { get; set; }
    public string? PublisherId { get; set; }
    public string Language { get; set; } = null!;
    public int PublicationYear { get; set; }
    public int PagesCount { get; set; }
    public IList<string> CategoryIds { get; set; } = new List<string>();
    public decimal RepurchasePrice { get; set; }
    public string? OriginalTitle { get; set; }
    public string? OriginalLanguage { get; set; }
    public int? OriginalPublicationYear { get; set; }
    public string? OriginalPublisherId { get; set; }
    public int Popularity { get; set; }
    public string? CoverURI { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}