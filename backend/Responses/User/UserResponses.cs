using LibraryPlus.Models.User;

namespace LibraryPlus.Responses.User;

public record MeResponse(
    string Email,
    string? PhoneNumber,
    string? AvatarUrl,
    DateTime JoinedAt
)
{
    public static MeResponse FromModel(UserModel user)
    {
        return new MeResponse(
            user.Email,
            user.PhoneNumber,
            user.AvatarUrl,
            user.JoinedAt
        );
    }
};

public record MeShortResponse(string Email, string? Name, string? AvatarUrl);