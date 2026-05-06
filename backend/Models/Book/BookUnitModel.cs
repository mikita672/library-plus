using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LibraryPlus.Models.Book;

[BsonIgnoreExtraElements]
public class BookUnitModel
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    [BsonRepresentation(BsonType.ObjectId)]
    public string BookId { get; set; } = null!;
}