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
    private const int PAGE_SIZE = 6;

    public string? GetAvatarUrl(string? key) => _storageService.GetPublicUrl(key);
    public async Task<UserModel?> GetUserById(string id) => await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
    public async Task<UserModel?> GetUserByEmail(string email) => await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
    public async Task<bool> IsEmailTaken(string email) => await _users.Find(u => u.Email == email).AnyAsync();

    public async Task CreateUser(SignupRequest request)
    {
        var user = new UserModel
        {
            Email = request.Email,
            Name = request.Name,
            PhoneNumber = request.PhoneNumber,
            AvatarUrl = request.AvatarUrl,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            JoinedAt = DateTime.UtcNow,
            IsDeleted = false,
        };
        await _users.InsertOneAsync(user);
    }

    public async Task<UserModel?> VerifyUserLogin(string email, string password)
    {
        var user = await GetUserByEmail(email);
        if (user == null || user.IsDeleted || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)) return null;
        return user;
    }

    public async Task UpdatePhoneNumber(string id, string phone) => await _users.UpdateOneAsync(u => u.Id == id, Builders<UserModel>.Update.Set(u => u.PhoneNumber, phone));

    public async Task UpdateName(string id, string name) => await _users.UpdateOneAsync(u => u.Id == id, Builders<UserModel>.Update.Set(u => u.Name, name));

    public async Task UpdateProfile(string id, string? name, string? phone)
    {
        var update = Builders<UserModel>.Update;
        var updates = new List<UpdateDefinition<UserModel>>();
        
        updates.Add(update.Set(u => u.Name, string.IsNullOrWhiteSpace(name) ? null : name));
        updates.Add(update.Set(u => u.PhoneNumber, string.IsNullOrWhiteSpace(phone) ? null : phone));
        
        await _users.UpdateOneAsync(u => u.Id == id, update.Combine(updates));
    }

    public async Task<bool> SetAvatarUrl(string id, string? url)
    {
        var result = await _users.UpdateOneAsync(u => u.Id == id, Builders<UserModel>.Update.Set(u => u.AvatarUrl, url));
        return result.ModifiedCount == 1;
    }

    public async Task<bool> VerifyUserPassword(UserModel user, string password) => BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

    public async Task ChangePassword(string id, string password) => await _users.UpdateOneAsync(u => u.Id == id, Builders<UserModel>.Update.Set(u => u.PasswordHash, BCrypt.Net.BCrypt.HashPassword(password)));

    public async Task SendAllUsersNotification(NotificationRequest request)
    {
        var ids = await _users.Find(_ => true).Project(u => u.Id).ToListAsync();
        await _notificationService.SendAllUsersNotification(ids, request);
    }

    public async Task<bool> IsAdmin(string id)
    {
        var user = await GetUserById(id);
        return user?.IsAdmin ?? false;
    }

    public async Task<bool> SoftDeleteUser(string id) => (await _users.UpdateOneAsync(u => u.Id == id && !u.IsDeleted, Builders<UserModel>.Update.Set(u => u.IsDeleted, true))).ModifiedCount == 1;
    public async Task<bool> RestoreUser(string id) => (await _users.UpdateOneAsync(u => u.Id == id && u.IsDeleted, Builders<UserModel>.Update.Set(u => u.IsDeleted, false))).ModifiedCount == 1;

    public async Task<List<UserModel>> GetUsers(int page, string? token)
    {
        var filter = BuildUserFilter(token);
        return await _users.Find(filter).SortByDescending(u => u.JoinedAt).Skip((page - 1) * PAGE_SIZE).Limit(PAGE_SIZE).ToListAsync();
    }

    public async Task<int> GetUsersPages(string? token)
    {
        var count = await _users.CountDocumentsAsync(BuildUserFilter(token));
        return (int)Math.Ceiling(count / (double)PAGE_SIZE);
    }

    private FilterDefinition<UserModel> BuildUserFilter(string? token)
    {
        if (string.IsNullOrEmpty(token)) return Builders<UserModel>.Filter.Empty;
        var regex = new MongoDB.Bson.BsonRegularExpression(token, "i");
        return Builders<UserModel>.Filter.Or(
            Builders<UserModel>.Filter.Regex(u => u.Email, regex),
            Builders<UserModel>.Filter.Regex(u => u.Name, regex)
        );
    }
}
