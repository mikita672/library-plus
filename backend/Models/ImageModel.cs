namespace LibraryPlus.Models;

public class ImageModel
{
    public string Id { get; set; } = null!;
    public string StorageKey { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
