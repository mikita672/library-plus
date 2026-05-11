using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LibraryPlus.Models.Reservation;

[BsonIgnoreExtraElements]
public class ReservationModel
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    [BsonRepresentation(BsonType.ObjectId)]
    public string BookUnitId { get; set; } = null!;
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? ReturnedDate { get; set; }
    public string? BookConditionUponReturn { get; set; }
    public string Status { get; set; } = null!;
    public decimal RepurchasePrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}