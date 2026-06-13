namespace LibraryPlus.Models.Book;

public class ReviewModel
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public int UserId { get; set; }
    public int Rating { get; set; }
    public string? ReviewText { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public LibraryPlus.Models.Book.BookModel Book { get; set; } = null!;
    public LibraryPlus.Models.User.UserModel User { get; set; } = null!;
}
