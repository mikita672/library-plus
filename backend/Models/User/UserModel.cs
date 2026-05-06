using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LibraryPlus.Models.User;

[BsonIgnoreExtraElements]
public class UserModel
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? Name { get; set; }
    public string? AvatarUrl { get; set; }
    public AddressModel DeliveryAddress { get; set; } = null!; 
    public DateTime JoinedAt { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsAdmin { get; set; } = false;
}
