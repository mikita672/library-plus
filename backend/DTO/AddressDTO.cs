using LibraryPlus.Models.User;

namespace LibraryPlus.DTO;

public record AddressDTO(
    string? Country,
    string? State,
    string? City,
    string? Street,
    string? PostalCode,
    string? BuildingNumber
)
{
    public static AddressDTO FromModel(AddressModel address)
    {
        return new AddressDTO(
            address.Country,
            address.State,
            address.City,
            address.Street,
            address.PostalCode,
            address.BuildingNumber
        );
    }
};