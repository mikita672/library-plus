namespace LibraryPlus.Models.Reservation;

public class ReservationModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BookUnitId { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? ReturnedDate { get; set; }
    public string? BookConditionUponReturn { get; set; }
    public string Status { get; set; } = null!;
    public decimal RepurchasePrice { get; set; }
    public string? AdditionalNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}