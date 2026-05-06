using LibraryPlus.Models.User;

namespace LibraryPlus.DTO;

public record MeDTO(
    string Email,
    string? PhoneNumber,
    string? AvatarUrl,
    AddressDTO Address,
    DateTime JoinedAt
)
{
    public static MeDTO FromModel(UserModel user)
    {
        return new MeDTO(
            user.Email,
            user.PhoneNumber,
            user.AvatarUrl,
            AddressDTO.FromModel(user.DeliveryAddress),
            user.JoinedAt
        );
    }
};