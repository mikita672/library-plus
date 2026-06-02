using MongoDB.Driver;
using LibraryPlus.Models.User;
using LibraryPlus.Requests.User;
using LibraryPlus.Requests.Auth;

using LibraryPlus.Services.Storage;

namespace LibraryPlus.Services.User;

public class UserService(IMongoDatabase db, NotificationService notificationService, IObjectStorageService storageService)
{
    private readonly IMongoCollection<UserModel> _users = db.GetCollection<UserModel>("users");
    private readonly NotificationService _notificationService = notificationService;
    private readonly IObjectStorageService _storageService = storageService;

    public string? GetAvatarUrl(string? avatarKey) => _storageService.GetPublicUrl(avatarKey);

    public async Task<UserModel?> GetUserById(string id)
    {
        return await (await _users.FindAsync(u => u.Id == id)).FirstOrDefaultAsync();
    }

    public async Task<UserModel?> GetUserByEmail(string email)
    {
        return await (await _users.FindAsync(u => u.Email == email)).FirstOrDefaultAsync();
    }

    public async Task<bool> IsEmailTaken(string email)
    {
        var existingUser = await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        return existingUser != null;
    }

    public async Task CreateUser(SignupRequest request)
    {
        var newUser = new UserModel
        {
            Email = request.Email,
            Name = request.Name,
            PhoneNumber = request.PhoneNumber,
            AvatarUrl = request.AvatarUrl,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            JoinedAt = DateTime.UtcNow,
            IsDeleted = false,
        };

        await _users.InsertOneAsync(newUser);
    }

    public async Task<UserModel?> VerifyUserLogin(string email, string password)
    {
        var user = await _users.Find(u => u.Email == email && !u.IsDeleted).FirstOrDefaultAsync();

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return null;
        }

        return user;
    }

    public async Task UpdatePhoneNumber(string userId, string newPhoneNumber)
    {
        await _users.UpdateOneAsync(
            Builders<UserModel>.Filter.Eq(u => u.Id, userId),
            Builders<UserModel>.Update.Set(u => u.PhoneNumber, newPhoneNumber)
        );
    }

    public async Task<bool> SetAvatarUrl(string userId, string? avatarUrl)
    {
        var res = await _users.UpdateOneAsync(
            Builders<UserModel>.Filter.Eq(u => u.Id, userId),
            Builders<UserModel>.Update.Set(u => u.AvatarUrl, avatarUrl)
        );
        return res.MatchedCount == 1;
    }

    public async Task<bool> VerifyUserPassword(UserModel user, string password)
    {
        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
    }

    public async Task ChangePassword(string userId, string newPassword)
    {
        await _users.UpdateOneAsync(
            Builders<UserModel>.Filter.Eq(u => u.Id, userId),
            Builders<UserModel>.Update.Set(u => u.PasswordHash, BCrypt.Net.BCrypt.HashPassword(newPassword))
        );
    }

    public async Task SendAllUsersNotification(NotificationRequest notificationBody)
    {
        var allUsers = _users.Find(Builders<UserModel>.Filter.Empty);
        var allUserIds = allUsers.ToEnumerable().Select(u => u.Id);
        await _notificationService.SendAllUsersNotification(allUserIds, notificationBody);
    }

    public async Task<bool> IsAdmin(string userId)
    {
        var user = await (await _users.FindAsync(u => u.Id == userId)).FirstAsync();
        return user.IsAdmin;
    }

    public async Task<bool> SoftDeleteUser(string userId)
    {
        var result = await _users.UpdateOneAsync(u => u.Id == userId && !u.IsDeleted, Builders<UserModel>.Update.Set(u => u.IsDeleted, true));

        return result.ModifiedCount == 1;
    }

    public async Task<bool> RestoreUser(string userId)
    {
        var result = await _users.UpdateOneAsync(u => u.Id == userId && u.IsDeleted, Builders<UserModel>.Update.Set(u => u.IsDeleted, false));

        return result.ModifiedCount == 1;
    }

    public async Task<List<UserModel>> GetUsers(int pageNumber, string? searchToken)
    {
        var pageSize = 20;
        var filter = Builders<UserModel>.Filter.Empty;
        if (!string.IsNullOrEmpty(searchToken))
        {
            var tokenLower = searchToken.ToLower();
            filter = Builders<UserModel>.Filter.Or(
                Builders<UserModel>.Filter.Regex(u => u.Email, new MongoDB.Bson.BsonRegularExpression(tokenLower, "i")),
                Builders<UserModel>.Filter.Regex(u => u.Name, new MongoDB.Bson.BsonRegularExpression(tokenLower, "i"))
            );
        }

        return await _users.Find(filter)
            .SortByDescending(u => u.JoinedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetUsersPages(string? searchToken)
    {
        var pageSize = 20;
        var filter = Builders<UserModel>.Filter.Empty;
        if (!string.IsNullOrEmpty(searchToken))
        {
            var tokenLower = searchToken.ToLower();
            filter = Builders<UserModel>.Filter.Or(
                Builders<UserModel>.Filter.Regex(u => u.Email, new MongoDB.Bson.BsonRegularExpression(tokenLower, "i")),
                Builders<UserModel>.Filter.Regex(u => u.Name, new MongoDB.Bson.BsonRegularExpression(tokenLower, "i"))
            );
        }

        var count = await _users.CountDocumentsAsync(filter);
        return (int)Math.Ceiling(count / (double)pageSize);
    }
}
