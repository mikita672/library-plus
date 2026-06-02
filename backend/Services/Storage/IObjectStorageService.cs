namespace LibraryPlus.Services.Storage;

public interface IObjectStorageService
{
    Task<string> UploadAsync(string key, Stream content, string contentType, CancellationToken ct = default);
    Task DeleteAsync(string key, CancellationToken ct = default);
    string? GetPublicUrl(string? key);
}
