using System.Security.Cryptography;
using LibraryPlus.Requests.Auth;
using LibraryPlus.Responses.Auth;
using LibraryPlus.Services.User;

namespace LibraryPlus.Services.Auth;

public class AuthService(
    UserService userService,
    RefreshTokenService refreshTokenService,
    JwtService jwtService)
{
    private readonly UserService _userService = userService;
    private readonly RefreshTokenService _refreshTokenService = refreshTokenService;
    private readonly JwtService _jwtService = jwtService;

    public async Task<bool> RegisterUserAsync(SignupRequest request)
    {
        if (await _userService.IsEmailTaken(request.Email))
        {
            return false;
        }
        await _userService.CreateUser(request);
        return true;
    }

    public async Task<TokenResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userService.VerifyUserLogin(request.Email, request.Password);
        if (user == null || user.IsDeleted)
        {
            return null;
        }

        string accessToken = _jwtService.GenerateJwtToken(user);
        string refreshTokenPlain = await _refreshTokenService.AddRefreshToken(user.Id);
        return new TokenResponse(accessToken, refreshTokenPlain);
    }

    public async Task<TokenResponse?> RefreshTokenAsync(string refreshTokenPlain)
    {
        var user = await _refreshTokenService.GetUserByRefreshToken(refreshTokenPlain);
        if (user == null || user.IsDeleted)
        {
            return null;
        }
        await _refreshTokenService.RemoveRefreshToken(refreshTokenPlain);
        string accessToken = _jwtService.GenerateJwtToken(user);
        string newRefreshTokenPlain = await _refreshTokenService.AddRefreshToken(user.Id);
        return new TokenResponse(accessToken, newRefreshTokenPlain);
    }

    public async Task<string?> ResetPassword(string email)
    {
        var user = await _userService.GetUserByEmail(email);
        if (user == null)
        {
            return null;
        }
        const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*";
        string newPassword = RandomNumberGenerator.GetString(validChars, 12);

        await _userService.ChangePassword(user.Id, newPassword);
        await _refreshTokenService.RemoveRefreshTokensForUser(user.Id);
        return newPassword;
    }

    public async Task<bool> ChangePassword(string userId, string oldPassword, string newPassword)
    {
        var user = await _userService.GetUserById(userId);
        if (user == null)
        {
            return false;
        }

        if (!await _userService.VerifyUserPassword(user, oldPassword))
        {
            return false;
        }

        await _userService.ChangePassword(user.Id, newPassword);
        await _refreshTokenService.RemoveRefreshTokensForUser(user.Id);
        return true;
    }

    public async Task<bool> LogoutAsync(string refreshTokenPlain)
    {
        return await _refreshTokenService.RemoveRefreshToken(refreshTokenPlain);
    }

}
