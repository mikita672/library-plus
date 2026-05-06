namespace LibraryPlus.Requests;

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

public record TokenResponse(string AccessToken, string RefreshToken);
public record AccessTokenResponse(string AccessToken);