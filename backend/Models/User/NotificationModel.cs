namespace LibraryPlus.Models.User;

public class NotificationModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? ReceiverId { get; set; }
    public string Text { get; set; } = null!;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}