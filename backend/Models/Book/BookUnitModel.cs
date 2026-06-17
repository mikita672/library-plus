using LibraryPlus.Models.Reservation;
using System.Text.Json.Serialization;

namespace LibraryPlus.Models.Book;

public class BookUnitModel
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public BookModel Book { get; set; } = null!;
    public bool IsArchived { get; set; } = false;
    [JsonIgnore]
    public ICollection<ReservationModel> Reservations { get; set; } = new List<ReservationModel>();
}