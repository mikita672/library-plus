using LibraryPlus.Models.User;
using LibraryPlus.Requests.User;
using LibraryPlus.Requests.Auth;
using LibraryPlus.Services.Storage;
using LibraryPlus.Data;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.User;

public class UserService(ApplicationDbContext db, NotificationService notificationService, IObjectStorageService storageService)
{
    private readonly ApplicationDbContext _db = db;
    private readonly NotificationService _notificationService = notificationService;
    private readonly IObjectStorageService _storageService = storageService;
    private const int PAGE_SIZE = 6;

    public string? GetAvatarUrl(string? key) => _storageService.GetPublicUrl(key);
    public async Task<UserModel?> GetUserById(string id) => await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
    public async Task<UserModel?> GetUserByEmail(string email) => await _db.Users.FirstOrDefaultAsync(u => EF.Functions.ILike(u.Email, email));
    public async Task<bool> IsEmailTaken(string email) => await _db.Users.AnyAsync(u => EF.Functions.ILike(u.Email, email));

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
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public async Task<UserModel?> VerifyUserLogin(string email, string password)
    {
        var user = await GetUserByEmail(email);
        if (user == null || user.IsDeleted || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)) return null;
        return user;
    }

    public async Task UpdatePhoneNumber(string id, string phone)
    {
        var user = await GetUserById(id);
        if (user == null) return;
        user.PhoneNumber = phone;
        await _db.SaveChangesAsync();
    }

    public async Task UpdateName(string id, string name)
    {
        var user = await GetUserById(id);
        if (user == null) return;
        user.Name = name;
        await _db.SaveChangesAsync();
    }

    public async Task UpdateProfile(string id, string? name, string? phone)
    {
        var user = await GetUserById(id);
        if (user == null) return;
        user.Name = string.IsNullOrWhiteSpace(name) ? null : name;
        user.PhoneNumber = string.IsNullOrWhiteSpace(phone) ? null : phone;
        await _db.SaveChangesAsync();
    }

    public async Task<bool> SetAvatarUrl(string id, string? url)
    {
        var user = await GetUserById(id);
        if (user == null) return false;
        user.AvatarUrl = url;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> VerifyUserPassword(UserModel user, string password) => BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

    public async Task ChangePassword(string id, string password)
    {
        var user = await GetUserById(id);
        if (user == null) return;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        await _db.SaveChangesAsync();
    }

    public async Task SendAllUsersNotification(NotificationRequest request)
    {
        await _notificationService.SendAllUsersNotification(new List<string>(), request);
    }

    public async Task<bool> IsAdmin(string id)
    {
        var user = await GetUserById(id);
        return user?.IsAdmin ?? false;
    }

    public async Task<bool> SoftDeleteUser(string id)
    {
        var user = await GetUserById(id);
        if (user == null || user.IsDeleted) return false;
        user.IsDeleted = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreUser(string id)
    {
        var user = await GetUserById(id);
        if (user == null || !user.IsDeleted) return false;
        user.IsDeleted = false;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<UserModel>> GetUsers(int page, string? token)
    {
        var query = BuildUserQuery(token);
        return await query.OrderByDescending(u => u.JoinedAt).Skip((page - 1) * PAGE_SIZE).Take(PAGE_SIZE).ToListAsync();
    }

    public async Task<int> GetUsersPages(string? token)
    {
        var query = BuildUserQuery(token);
        var count = await query.CountAsync();
        return (int)Math.Ceiling(count / (double)PAGE_SIZE);
    }

    public async Task<List<string>> GetAllUserEmails()
    {
        return await _db.Users.Select(u => u.Email).ToListAsync();
    }

    public async Task<List<object>> SuggestUsersByEmail(string query)
    {
        var users = await _db.Users
            .Where(u => EF.Functions.ILike(u.Email, $"%{query}%"))
            .Take(10)
            .ToListAsync();
        return users.Select(u => (object)new { email = u.Email, name = u.Name }).ToList();
    }

    private IQueryable<UserModel> BuildUserQuery(string? token)
    {
        var query = _db.Users.AsQueryable();
        if (string.IsNullOrEmpty(token)) return query;
        
        return query.Where(u => EF.Functions.ILike(u.Email, $"%{token}%") || EF.Functions.ILike(u.Name ?? "", $"%{token}%"));
    }
}