using System.Security.Cryptography;
using System.Text;
using LibraryPlus.Models.User;
using MongoDB.Driver;
using LibraryPlus.Services.User;

namespace LibraryPlus.Services.Auth;

public class RefreshTokenService
{
    private readonly IMongoCollection<RefreshTokenModel> _refreshTokens;
    private readonly UserService _userService;

    public RefreshTokenService(IMongoDatabase db, UserService userService)
    {
        _refreshTokens = db.GetCollection<RefreshTokenModel>("refreshTokens");
        _userService = userService;
        
        var indexKeys = Builders<RefreshTokenModel>.IndexKeys.Ascending(t => t.ExpiryDate);
        var indexOptions = new CreateIndexOptions { ExpireAfter = TimeSpan.Zero };
        _refreshTokens.Indexes.CreateOne(new CreateIndexModel<RefreshTokenModel>(indexKeys, indexOptions));
    }


    public async Task<UserModel?> GetUserByRefreshToken(string refreshTokenPlain)
    {
        string refreshTokenHash = HashToken(refreshTokenPlain);
        RefreshTokenModel? refreshToken = await _refreshTokens
            .Find(t => t.RefreshTokenHash == refreshTokenHash)
            .FirstOrDefaultAsync();
        if (refreshToken == null)
        {
            return null;
        }
        return await _userService.GetUserById(refreshToken.UserId);
    }

    public async Task<string> AddRefreshToken(string userId)
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        string refreshTokenPlain = Convert.ToBase64String(randomNumber);
        string refreshTokenHash = HashToken(refreshTokenPlain);

        RefreshTokenModel refreshToken = new()
        {
            RefreshTokenHash = refreshTokenHash,
            UserId = userId,
            ExpiryDate = DateTime.UtcNow.AddDays(7),
        };

        await _refreshTokens.InsertOneAsync(refreshToken);
        return refreshTokenPlain;
    }

    public async Task<bool> RemoveRefreshToken(string refreshTokenPlain)
    {
        string refreshTokenHash = HashToken(refreshTokenPlain);
        var result = await _refreshTokens.DeleteOneAsync(t => t.RefreshTokenHash == refreshTokenHash);
        return result.DeletedCount == 1;
    }

    private static string HashToken(string token)
    {
        var bytes = Encoding.UTF8.GetBytes(token);
        var hashBytes = SHA256.HashData(bytes);
        return Convert.ToBase64String(hashBytes);
    }

}