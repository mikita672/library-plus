using LibraryPlus.Models.User;

namespace LibraryPlus.Responses.User;

public record MeResponse(
    string Email,
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
            user.PhoneNumber,
            user.AvatarUrl,
            user.JoinedAt,
            user.IsAdmin
        );
    }
};

public record MeShortResponse(string Email, string? Name, string? AvatarUrl, string? PhoneNumber);