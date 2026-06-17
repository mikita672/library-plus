using LibraryPlus.Models.User;

namespace LibraryPlus.Models.Book;

public class ReviewModel
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public int UserId { get; set; }
    public int Rating { get; set; }
    public string? ReviewText { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public BookModel Book { get; set; } = null!;
    public UserModel User { get; set; } = null!;
}
