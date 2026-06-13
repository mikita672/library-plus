using LibraryPlus.Models;
using LibraryPlus.Models.User;
using LibraryPlus.Requests.User;
using LibraryPlus.Responses.User;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.User;

public class NotificationService(LibraryPlusContext context)
{
    private readonly LibraryPlusContext _context = context;

    public async Task<NotificationModel> CreateNotification(string subject, string text)
    {
        var notification = new NotificationModel
        {
            Subject = subject,
            Text = text,
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task SendAdminNotification(int userId, string message)
    {
        var admin = await _context.Users
            .Where(u => u.IsAdmin)
            .FirstOrDefaultAsync();
        if (admin == null) { return; }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) { return; }

        var notification = await CreateNotification($"Contact request (from: {user.Email})", message);
        _context.UserNotifications.Add(new UserNotificationModel
        {
            UserId = admin.Id,
            NotificationId = notification.Id,
            CreatedAt = DateTime.UtcNow,
        });
        await _context.SaveChangesAsync();
    }

    public async Task SendOneUserNotification(int userId, NotificationRequest notificationBody)
    {
        var notification = await CreateNotification(notificationBody.Subject, notificationBody.Text);
        _context.UserNotifications.Add(new UserNotificationModel
        {
            UserId = userId,
            NotificationId = notification.Id,
            CreatedAt = DateTime.UtcNow,
        });
        await _context.SaveChangesAsync();
    }

    public async Task SendAllUsersNotification(IEnumerable<int> userIds, NotificationRequest notificationBody)
    {
        var notification = await CreateNotification(notificationBody.Subject, notificationBody.Text);
        var userNotifications = userIds.Select(id => new UserNotificationModel
        {
            UserId = id,
            NotificationId = notification.Id,
            CreatedAt = DateTime.UtcNow,
        });
        _context.UserNotifications.AddRange(userNotifications);
        await _context.SaveChangesAsync();
    }

    public async Task<IList<UserNotificationResponse>> GetUserNotifications(int userId, int page)
    {
        return await (from un in _context.UserNotifications
                      where un.UserId == userId
                      join n in _context.Notifications on un.NotificationId equals n.Id
                      orderby un.CreatedAt descending
                      select new UserNotificationResponse(
                          un.Id,
                          n.Subject,
                          n.Text,
                          un.IsRead,
                          un.CreatedAt
                      ))
            .Skip(5 * (page - 1))
            .Take(5)
            .ToListAsync();
    }

    public async Task<UserNotificationCountResponse> GetUserNotificationsCount(int userId)
    {
        var totalCount = await _context.UserNotifications
            .Where(un => un.UserId == userId)
            .CountAsync();
        var notReadCount = await _context.UserNotifications
            .Where(un => un.UserId == userId && !un.IsRead)
            .CountAsync();
        return new UserNotificationCountResponse(
            (int)Math.Ceiling(totalCount / 5.0),
            notReadCount
        );
    }

    public async Task<bool> MarkNotificationAsRead(int userId, int id)
    {
        var un = await _context.UserNotifications.FirstOrDefaultAsync(u => u.Id == id && u.UserId == userId);
        if (un != null)
        {
            un.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }
}