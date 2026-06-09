namespace LibraryPlus.Models.User;

public class UserModel
{
    public string Id { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? Name { get; set; }
    public string? AvatarImageId { get; set; }
    public DateTime JoinedAt { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsAdmin { get; set; } = false;
}
