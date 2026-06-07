using LibraryPlus.Data;
using LibraryPlus.Models.User;
using LibraryPlus.Requests.User;
using LibraryPlus.Responses.User;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.User;

public class NotificationService(ApplicationDbContext db)
{
    private readonly ApplicationDbContext _db = db;

    public async Task<NotificationModel> CreateNotification(string text, string? receiverId = null)
    {
        var notification = new NotificationModel
        {
            Text = text,
            ReceiverId = receiverId,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();
        return notification;
    }

    public async Task SendAdminNotification(string userId, string message)
    {
        var admin = await _db.Users
            .Where(u => u.IsAdmin)
            .FirstOrDefaultAsync();
        if (admin == null) return;

        var user = await _db.Users
            .Where(u => u.Id == userId)
            .FirstOrDefaultAsync();
        if (user == null) return;

        await CreateNotification($"Contact request (from: {user.Email}): {message}", admin.Id);
    }

    public async Task SendOneUserNotification(string userId, NotificationRequest notificationBody)
    {
        await CreateNotification(notificationBody.Text, userId);
    }

    public async Task SendAllUsersNotification(IEnumerable<string> userIds, NotificationRequest notificationBody)
    {
        await CreateNotification(notificationBody.Text, null);
    }

    public async Task<IList<UserNotificationResponse>> GetUserNotifications(string userId, int page)
    {
        return await _db.Notifications
            .Where(n => n.ReceiverId == userId || n.ReceiverId == null)
            .OrderByDescending(n => n.CreatedAt)
            .Skip(5 * (page - 1))
            .Take(5)
            .Select(n => new UserNotificationResponse(
                n.Id,
                n.Text, 
                n.IsRead,
                n.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<UserNotificationCountResponse> GetUserNotificationsCount(string userId)
    {
        var totalCount = await _db.Notifications
            .Where(n => n.ReceiverId == userId || n.ReceiverId == null)
            .CountAsync();
        var notReadCount = await _db.Notifications
            .Where(n => (n.ReceiverId == userId || n.ReceiverId == null) && !n.IsRead)
            .CountAsync();
        return new UserNotificationCountResponse(
            (int)Math.Ceiling(totalCount / 5.0),
            notReadCount
        );
    }

    public async Task<bool> MarkNotificationAsRead(string userId, string id)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && (n.ReceiverId == userId || n.ReceiverId == null));
        
        if (notification == null) return false;
        
        notification.IsRead = true;
        await _db.SaveChangesAsync();
        return true;
    }

}