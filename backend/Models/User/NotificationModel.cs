namespace LibraryPlus.Models.User;

public class NotificationModel
{
    public int Id { get; set; }
    public string Subject { get; set; } = null!;
    public string Text { get; set; } = null!;

    public ICollection<UserNotificationModel> UserNotifications { get; set; } = new List<UserNotificationModel>();
}