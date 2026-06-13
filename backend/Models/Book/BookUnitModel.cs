namespace LibraryPlus.Models.Book;

public class BookUnitModel
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public BookModel Book { get; set; } = null!;
    public bool IsArchived { get; set; } = false;
    public ICollection<LibraryPlus.Models.Reservation.ReservationModel> Reservations { get; set; } = new List<LibraryPlus.Models.Reservation.ReservationModel>();
}