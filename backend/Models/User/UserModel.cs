namespace LibraryPlus.Models.User;

public class UserModel
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? Name { get; set; }
    public byte[]? AvatarImage { get; set; }
    public string? AvatarImageContentType { get; set; }
    public DateTime JoinedAt { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsAdmin { get; set; } = false;
}
