using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using LibraryPlus.Models;
using Microsoft.Extensions.Options;

namespace LibraryPlus.Services.Storage;

public class MinioObjectStorageService : IObjectStorageService
{
    private readonly StorageOptions _options;
    private readonly IAmazonS3 _s3Client;

    public MinioObjectStorageService(IOptions<StorageOptions> options)
    {
        _options = options.Value;
        
        var config = new AmazonS3Config
        {
            ServiceURL = _options.Endpoint,
            ForcePathStyle = _options.ForcePathStyle
        };

        _s3Client = new AmazonS3Client(_options.AccessKey, _options.SecretKey, config);
    }

    public async Task<string> UploadAsync(string key, Stream content, string contentType, CancellationToken ct = default)
    {
        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = content,
            Key = key,
            BucketName = _options.Bucket,
            ContentType = contentType
        };

        var fileTransferUtility = new TransferUtility(_s3Client);
        await fileTransferUtility.UploadAsync(uploadRequest, ct);

        return key;
    }

    public async Task DeleteAsync(string key, CancellationToken ct = default)
    {
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _options.Bucket,
            Key = key
        };

        await _s3Client.DeleteObjectAsync(deleteRequest, ct);
    }

    public string? GetPublicUrl(string? key)
    {
        if (string.IsNullOrEmpty(key)) return null;

        if (key.StartsWith("http://") || key.StartsWith("https://"))
        {
            return key;
        }

        return $"{_options.PublicBaseUrl.TrimEnd('/')}/{key.TrimStart('/')}";
    }
}
