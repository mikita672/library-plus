using LibraryPlus.Models.User;

namespace LibraryPlus.Responses.User;

public record MeResponse(
    string Email,
    string? Name,
    string? PhoneNumber,
    string? AvatarUrl,
    DateTime JoinedAt,
    bool IsAdmin
)
{
    public static MeResponse FromModel(UserModel user)
    {
        return new MeResponse(
            user.Email,
            user.Name,
            user.PhoneNumber,
            null,
            user.JoinedAt,
            user.IsAdmin
        );
    }
};

public record MeShortResponse(string Email, string? Name, string? AvatarUrl, string? PhoneNumber);

public record AdminUserResponse(
    int Id,
    string Email,
    string? Name,
    string? AvatarUrl,
    string? PhoneNumber,
    DateTime JoinedAt,
    bool IsDeleted,
    bool IsAdmin
)
{
    public static AdminUserResponse FromModel(UserModel user, string? avatarUrl)
    {
        return new AdminUserResponse(
            user.Id,
            user.Email,
            user.Name,
            avatarUrl,
            user.PhoneNumber,
            user.JoinedAt,
            user.IsDeleted,
            user.IsAdmin
        );
    }
}