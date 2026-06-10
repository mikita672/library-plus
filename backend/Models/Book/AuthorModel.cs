namespace LibraryPlus.Models.Book;

public class AuthorModel
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}