namespace LibraryPlus.Models.Reservation;

public class ReservationModel
{
    public int Id { get; set; }
    public int BookUnitId { get; set; }
    public LibraryPlus.Models.Book.BookUnitModel BookUnit { get; set; } = null!;
    public int UserId { get; set; }
    public LibraryPlus.Models.User.UserModel User { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? ReturnedDate { get; set; }
    public string? BookConditionUponReturn { get; set; }
    public string Status { get; set; } = null!;
    public decimal RepurchasePrice { get; set; }
    public string? AdditionalNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}