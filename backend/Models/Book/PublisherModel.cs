namespace LibraryPlus.Models.Book;

public class PublisherModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = null!;
}