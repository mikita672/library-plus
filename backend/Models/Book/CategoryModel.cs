namespace LibraryPlus.Models.Book;

public class CategoryModel
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public ICollection<BookModel> Books { get; set; } = new List<BookModel>();
}