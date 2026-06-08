namespace LibraryPlus.Models.User;

public class UserNotificationModel
{
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string NotificationId { get; set; } = null!;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; }
}