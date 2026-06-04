namespace LibraryPlus.Models;

public class StorageOptions
{
    public const string Storage = "Storage";

    public string Endpoint { get; set; } = string.Empty;
    public string Bucket { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public bool ForcePathStyle { get; set; } = true;
    public string PublicBaseUrl { get; set; } = string.Empty;
}
