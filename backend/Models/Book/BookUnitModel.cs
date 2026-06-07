namespace LibraryPlus.Models.Book;

public class BookUnitModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BookId { get; set; } = null!;
    public bool IsArchived { get; set; } = false;
}