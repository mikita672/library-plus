namespace LibraryPlus.Models.Book;

public class BookUnitModel
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public bool IsArchived { get; set; } = false;
}