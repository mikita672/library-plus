namespace LibraryPlus.Models.Book;

public class BookUnitModel
{
    public string Id { get; set; } = null!;
    public string BookId { get; set; } = null!;
    public bool IsArchived { get; set; } = false;
}