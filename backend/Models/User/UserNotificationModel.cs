namespace LibraryPlus.Models.User;

public class UserNotificationModel
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int NotificationId { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; }
}