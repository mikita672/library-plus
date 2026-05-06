using LibraryPlus.Requests;
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

    public async Task<bool> LogoutAsync(string refreshTokenPlain)
    {
        return await _refreshTokenService.RemoveRefreshToken(refreshTokenPlain);
    }

}
