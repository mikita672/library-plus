namespace LibraryPlus.Requests.Auth;

public record SignupRequest(
    string Email,
    string Password,
    string? Name,
    string? PhoneNumber,
    string? AvatarUrl
);

public record LoginRequest(
    string Email,
    string Password
);

public record RefreshRequest(string RefreshToken);

public record ResetPasswordRequest(string Email);