namespace LibraryPlus.Requests.User;

public record UpdatePhoneNumberRequest(string NewPhoneNumber);

public record UpdatePasswordRequest(string OldPassword, string NewPassword);