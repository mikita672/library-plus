namespace LibraryPlus.Requests.User;

public record UpdatePhoneNumberRequest(string NewPhoneNumber);

public record UpdateNameRequest(string NewName);

public record UpdateProfileRequest(string? Name, string? PhoneNumber);

public record UpdatePasswordRequest(string OldPassword, string NewPassword);