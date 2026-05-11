using LibraryPlus.Models.User;

namespace LibraryPlus.DTO;

public record MeDTO(
    string Email,
    string? PhoneNumber,
    string? AvatarUrl,
    DateTime JoinedAt
)
{
    public static MeDTO FromModel(UserModel user)
    {
        return new MeDTO(
            user.Email,
            user.PhoneNumber,
            user.AvatarUrl,
            user.JoinedAt
        );
    }
};