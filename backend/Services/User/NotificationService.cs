using LibraryPlus.DTO;
using LibraryPlus.Models.User;
using LibraryPlus.Requests.User;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.User;

public class NotificationService(IMongoDatabase db)
{
    private readonly IMongoCollection<NotificationModel> _notifications = db.GetCollection<NotificationModel>("notifications");
    private readonly IMongoCollection<UserNotificationModel> _userNotifications = db.GetCollection<UserNotificationModel>("userNotifications");

    public async Task<NotificationModel> CreateNotification(NotificationBody notificationBody)
    {
        var notification = new NotificationModel
        {
            Subject = notificationBody.Subject,
            Text = notificationBody.Text,
        };
        await _notifications.InsertOneAsync(notification);
        return notification;
    }

    public async Task SendOneUserNotification(string userId, NotificationBody notificationBody)
    {
        var notification = await CreateNotification(notificationBody);
        await _userNotifications.InsertOneAsync(new UserNotificationModel
        {
            UserId = userId,
            NotificationId = notification.Id,
            CreatedAt = DateTime.UtcNow,
        });
    }

    public async Task SendAllUsersNotification(IEnumerable<string> userIds, NotificationBody notificationBody)
    {
        var notification = await CreateNotification(notificationBody);
        var userNotifications = userIds.Select(id => new UserNotificationModel
        {
            UserId = id,
            NotificationId = notification.Id,
            CreatedAt = DateTime.UtcNow,
        });
        await _userNotifications.InsertManyAsync(userNotifications);
    }

    public async Task<IList<UserNotificationDTO>> GetUserNotifications(string userId, int page)
    {
        return await _userNotifications.AsQueryable()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip(4 * (page - 1))
            .Take(4)
            .Join(
                _notifications.AsQueryable(),
                un => un.NotificationId,
                n => n.Id,
                (un, n) => new UserNotificationDTO(un.Id, n.Subject, n.Text, un.IsRead)
            )
            .ToListAsync();
    }

    public async Task<UserNotificationCountDTO> GetUserNotificationsCount(string userId)
    {
        var totalCount = await _userNotifications.AsQueryable()
            .Where(un => un.UserId == userId)
            .CountAsync();
        var notReadCount = await _userNotifications.AsQueryable()
            .Where(un => un.UserId == userId)
            .Where(un => !un.IsRead)
            .CountAsync();
        return new UserNotificationCountDTO(
            (int)Math.Ceiling(totalCount / 4.0),
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