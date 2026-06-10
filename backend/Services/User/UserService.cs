using LibraryPlus.Models;
using LibraryPlus.Models.User;
using LibraryPlus.Requests.User;
using LibraryPlus.Requests.Auth;

using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.User;

public class UserService(LibraryPlusContext context, NotificationService notificationService)
{
    private readonly LibraryPlusContext _context = context;
    private readonly NotificationService _notificationService = notificationService;
    private const int PAGE_SIZE = 6;

    private string? GetImageUrl(int userId, byte[]? avatarImage)
    {
        if (avatarImage == null) return null;
        return $"/api/media/users/{userId}/avatar";
    }

    public string? GetAvatarUrlById(UserModel user) => GetImageUrl(user.Id, user.AvatarImage);

    public async Task<UserModel?> GetUserById(int id) => await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
    public async Task<UserModel?> GetUserByEmail(string email) => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    public async Task<bool> IsEmailTaken(string email) => await _context.Users.AnyAsync(u => u.Email == email);

    public async Task CreateUser(SignupRequest request)
    {
        var user = new UserModel
        {

            Email = request.Email,
            Name = request.Name,
            PhoneNumber = request.PhoneNumber,
            AvatarImage = null,
            AvatarImageContentType = null,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            JoinedAt = DateTime.UtcNow,
            IsDeleted = false,
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    public async Task<UserModel?> VerifyUserLogin(string email, string password)
    {
        var user = await GetUserByEmail(email);
        if (user == null || user.IsDeleted || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)) return null;
        return user;
    }

    public async Task UpdatePhoneNumber(int id, string phone)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            user.PhoneNumber = phone;
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateName(int id, string name)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            user.Name = name;
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateProfile(int id, string? name, string? phone)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            user.Name = string.IsNullOrWhiteSpace(name) ? null : name;
            user.PhoneNumber = string.IsNullOrWhiteSpace(phone) ? null : phone;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> SetAvatarImageId(int id, byte[]? avatarImage, string? contentType)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            user.AvatarImage = avatarImage;
            user.AvatarImageContentType = contentType;
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<bool> VerifyUserPassword(UserModel user, string password) => BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

    public async Task ChangePassword(int id, string password)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            await _context.SaveChangesAsync();
        }
    }

    public async Task SendAllUsersNotification(NotificationRequest request)
    {
        var ids = await _context.Users.Select(u => u.Id).ToListAsync();
        await _notificationService.SendAllUsersNotification(ids, request);
    }

    public async Task<bool> IsAdmin(int id)
    {
        var user = await GetUserById(id);
        return user?.IsAdmin ?? false;
    }

    public async Task<bool> SoftDeleteUser(int id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        if (user != null)
        {
            user.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<bool> RestoreUser(int id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.IsDeleted);
        if (user != null)
        {
            user.IsDeleted = false;
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<List<UserModel>> GetUsers(int page, string? token)
    {
        var query = _context.Users.AsQueryable();
        if (!string.IsNullOrEmpty(token))
        {
            query = query.Where(u => EF.Functions.ILike(u.Email, $"%{token}%") || (u.Name != null && EF.Functions.ILike(u.Name, $"%{token}%")));
        }
        return await query.OrderByDescending(u => u.JoinedAt).Skip((page - 1) * PAGE_SIZE).Take(PAGE_SIZE).ToListAsync();
    }

    public async Task<int> GetUsersPages(string? token)
    {
        var query = _context.Users.AsQueryable();
        if (!string.IsNullOrEmpty(token))
        {
            query = query.Where(u => EF.Functions.ILike(u.Email, $"%{token}%") || (u.Name != null && EF.Functions.ILike(u.Name, $"%{token}%")));
        }
        var count = await query.CountAsync();
        return (int)Math.Ceiling(count / (double)PAGE_SIZE);
    }

    public async Task<List<string>> GetAllUserEmails()
    {
        return await _context.Users.Select(u => u.Email).ToListAsync();
    }

    public async Task<List<object>> SuggestUsersByEmail(string query)
    {
        var users = await _context.Users
            .Where(u => EF.Functions.ILike(u.Email, $"%{query}%"))
            .Take(10)
            .ToListAsync();
        return users.Select(u => (object)new { email = u.Email, name = u.Name }).ToList();
    }
}
