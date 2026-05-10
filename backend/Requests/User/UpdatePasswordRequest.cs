namespace LibraryPlus.Requests.User;

public record UpdatePasswordRequest(string OldPassword, string NewPassword);