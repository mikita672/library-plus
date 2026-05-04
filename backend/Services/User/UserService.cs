using MongoDB.Driver;
using LibraryPlus.Models.User;
using LibraryPlus.Requests;

namespace LibraryPlus.Services.User;

public class UserService(IMongoDatabase db, NotificationService notificationService)
{
    private readonly IMongoCollection<UserModel> _users = db.GetCollection<UserModel>("users");
    private readonly NotificationService _notificationService = notificationService;

    public async Task<UserModel?> GetUserById(string id)
    {
        return await (await _users.FindAsync(u => u.Id == id)).FirstOrDefaultAsync();
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
            DeliveryAddress = new(),
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

    public async Task UpdateAddress(string userId, UpdateAddressRequest updateAddressRequest)
    {
        await _users.UpdateOneAsync(
            Builders<UserModel>.Filter.Eq(u => u.Id, userId),
            Builders<UserModel>.Update.Set(u => u.DeliveryAddress, updateAddressRequest.ToModel())
        );
    }

    public async Task UpdatePhoneNumber(string userId, string newPhoneNumber)
    {
        await _users.UpdateOneAsync(
            Builders<UserModel>.Filter.Eq(u => u.Id, userId),
            Builders<UserModel>.Update.Set(u => u.PhoneNumber, newPhoneNumber)
        );
    }

    public async Task<bool> UpdatePassword(string userId, string oldPassword, string newPassword)
    {
        var user = await (await _users.FindAsync(u => u.Id == userId)).FirstAsync();
    
        if (!BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash))
        {
            return false;
        }

        await _users.UpdateOneAsync(
            Builders<UserModel>.Filter.Eq(u => u.Id, userId),
            Builders<UserModel>.Update.Set(u => u.PasswordHash, BCrypt.Net.BCrypt.HashPassword(newPassword))
        );
        return true;
    }

    public async Task SendAllUsersNotification(string text)
    {
        var allUsers = _users.Find(Builders<UserModel>.Filter.Empty);
        var allUserIds = allUsers.ToEnumerable().Select(u => u.Id);
        await _notificationService.SendAllUsersNotification(allUserIds, text);
    }

    public async Task<bool> IsAdmin(string userId)
    {
        var user = await (await _users.FindAsync(u => u.Id == userId)).FirstAsync();
        return user.IsAdmin;
    }

}
