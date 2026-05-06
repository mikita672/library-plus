namespace LibraryPlus.Requests;

public record UpdatePasswordRequest(string OldPassword, string NewPassword);