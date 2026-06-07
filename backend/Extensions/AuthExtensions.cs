using System.Text;
using LibraryPlus.Services.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace LibraryPlus.Extensions;

public static class AuthExtensions
{
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration config)
    {
        var jwtKey = config["Jwt:Key"];
        var jwtIssuer = config["Jwt:Issuer"];
        var jwtAudience = config["Jwt:Audience"];

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
        {
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = async context =>
                {
                    var jwtService = context.HttpContext.RequestServices
                        .GetRequiredService<JwtService>();
                    var accessToken = context.Request.Cookies["accessToken"];
                    var refreshTokenPlain = context.Request.Cookies["refreshToken"];

                    if (jwtService.IsValid(accessToken) || string.IsNullOrEmpty(refreshTokenPlain))
                    {
                        context.Token = accessToken;
                        return;
                    }

                    var authService = context.HttpContext.RequestServices
                        .GetRequiredService<AuthService>();
                    var tokenResponse = await authService.RefreshTokenAsync(refreshTokenPlain);
                    if (tokenResponse == null)
                    {
                        context.Response.Cookies.Delete("accessToken");
                        context.Response.Cookies.Delete("refreshToken");
                        return;
                    }

                    context.Response.Cookies.Append("accessToken", tokenResponse.AccessToken, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = false,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTime.UtcNow.AddMinutes(15)
                    });
                    context.Response.Cookies.Append("refreshToken", tokenResponse.RefreshToken, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = false,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTime.UtcNow.AddDays(7)
                    });
                    context.Token = tokenResponse.AccessToken;
                }
            };
        });

        services.AddAuthorization();
        return services;
    }
}