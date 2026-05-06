using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LibraryPlus.Models.User;

[BsonIgnoreExtraElements]
public class NotificationModel
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    public string Text { get; set; } = null!;
}