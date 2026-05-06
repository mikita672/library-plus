using System.Formats.Asn1;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LibraryPlus.Models.Book;

[BsonIgnoreExtraElements]
public class BookModel
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    [BsonRepresentation(BsonType.ObjectId)]
    public string AuthorId { get; set; } = null!;
    public string Language { get; set; } = null!;
    public uint PublicationYear { get; set; }
    public uint PagesCount { get; set; }
    [BsonRepresentation(BsonType.ObjectId)]
    public string PublisherId { get; set; } = null!;
    public decimal RepurchasePrice { get; set; }
    public string? OriginalTitle { get; set; }
    public string? OriginalLanguage { get; set; }
    public uint? OriginalPublicationYear { get; set; }
    [BsonRepresentation(BsonType.ObjectId)]
    public string? OriginalPublisherId { get; set; }
    public string? CoverURI { get; set; }
}