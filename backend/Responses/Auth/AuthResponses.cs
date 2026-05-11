namespace LibraryPlus.Responses.Auth;

public record TokenResponse(string AccessToken, string RefreshToken);

public record AccessTokenResponse(string AccessToken);