using LibraryPlus.Models.User;

namespace LibraryPlus.Requests;

public record UpdateAddressRequest(
    string? Country,
    string? State,
    string? City,
    string? Street,
    string? PostalCode,
    string? BuildingNumber
)
{
    public AddressModel ToModel()
    {
        return new AddressModel
        {
            Country = Country,
            State = State,
            City = City,
            Street = Street,
            PostalCode = PostalCode,
            BuildingNumber = BuildingNumber
        };
    }
};