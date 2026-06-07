namespace LibraryPlus.Models.Book;

public class AuthorModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = null!;
}