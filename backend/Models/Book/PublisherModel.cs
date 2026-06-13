namespace LibraryPlus.Models.Book;

public class PublisherModel
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;

    [System.Text.Json.Serialization.JsonIgnore]
    public ICollection<BookModel> Books { get; set; } = new List<BookModel>();
    
    [System.Text.Json.Serialization.JsonIgnore]
    public ICollection<BookModel> OriginalBooks { get; set; } = new List<BookModel>();
}