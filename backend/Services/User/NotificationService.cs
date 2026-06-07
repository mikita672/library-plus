using LibraryPlus.Models.User;
using LibraryPlus.Requests.User;
using LibraryPlus.Responses.User;
using MailKit;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.User;

public class NotificationService(IMongoDatabase db)
{
    private readonly IMongoCollection<NotificationModel> _notifications = db.GetCollection<NotificationModel>("notifications");
    private readonly IMongoCollection<UserModel> _users = db.GetCollection<UserModel>("users");
    private readonly IMongoCollection<UserNotificationModel> _userNotifications = db.GetCollection<UserNotificationModel>("userNotifications");

    public async Task<NotificationModel> CreateNotification(string subject, string text)
    {
        var notification = new NotificationModel
        {
            Subject = subject,
            Text = text,
        };
        await _notifications.InsertOneAsync(notification);
        return notification;
    }

    public async Task SendAdminNotification(string userId, string message)
    {
        var admin = await _users.AsQueryable()
            .Where(u => u.IsAdmin)
            .Take(1)
            .FirstOrDefaultAsync();
        if (admin == null)
        {
            return;
        }
        var user = await _users.AsQueryable()
            .Where(u => u.Id == userId)
            .FirstOrDefaultAsync();
        if (user == null)
        {
            return;
        }
        var notification = await CreateNotification($"Contact request (from: {user.Email})", message);
        await _userNotifications.InsertOneAsync(new UserNotificationModel
        {
            UserId = admin.Id,
            NotificationId = notification.Id,
            CreatedAt = DateTime.UtcNow,
        });
    }

    public async Task SendOneUserNotification(string userId, NotificationRequest notificationBody)
    {
        var notification = await CreateNotification(notificationBody.Subject, notificationBody.Text);
        await _userNotifications.InsertOneAsync(new UserNotificationModel
        {
            UserId = userId,
            NotificationId = notification.Id,
            CreatedAt = DateTime.UtcNow,
        });
    }

    public async Task SendAllUsersNotification(IEnumerable<string> userIds, NotificationRequest notificationBody)
    {
        var notification = await CreateNotification(notificationBody.Subject, notificationBody.Text);
        var userNotifications = userIds.Select(id => new UserNotificationModel
        {
            UserId = id,
            NotificationId = notification.Id,
            CreatedAt = DateTime.UtcNow,
        });
        await _userNotifications.InsertManyAsync(userNotifications);
    }

    public async Task<IList<UserNotificationResponse>> GetUserNotifications(string userId, int page)
    {
        return await _userNotifications.AsQueryable()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip(5 * (page - 1))
            .Take(5)
            .Join(
                _notifications.AsQueryable(),
                un => un.NotificationId,
                n => n.Id,
                (un, n) => new UserNotificationResponse(
                    un.Id,
                    n.Subject,
                    n.Text,
                    un.IsRead,
                    un.CreatedAt
                )
            )
            .ToListAsync();
    }

    public async Task<UserNotificationCountResponse> GetUserNotificationsCount(string userId)
    {
        var totalCount = await _userNotifications.AsQueryable()
            .Where(un => un.UserId == userId)
            .CountAsync();
        var notReadCount = await _userNotifications.AsQueryable()
            .Where(un => un.UserId == userId)
            .Where(un => !un.IsRead)
            .CountAsync();
        return new UserNotificationCountResponse(
            (int)Math.Ceiling(totalCount / 5.0),
            notReadCount
        );
    }

    public async Task<bool> MarkNotificationAsRead(string userId, string id)
    {
        var res = await _userNotifications.UpdateOneAsync(
            Builders<UserNotificationModel>.Filter.And(
                Builders<UserNotificationModel>.Filter.Eq(un => un.Id, id),
                Builders<UserNotificationModel>.Filter.Eq(un => un.UserId, userId)
            ),
            Builders<UserNotificationModel>.Update.Set(un => un.IsRead, true)
        );
        return res.MatchedCount == 1;
    }

}