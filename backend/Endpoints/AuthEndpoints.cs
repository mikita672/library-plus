using LibraryPlus.Services.Auth;
using Microsoft.AspNetCore.Mvc;
using LibraryPlus.Services.Mail;
using LibraryPlus.Requests.Auth;

namespace LibraryPlus.Endpoints;

public static class UserEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1/auth");

        group.MapPost("/signup", async (SignupRequest request, AuthService authService) =>
        {
            var success = await authService.RegisterUserAsync(request);
            if (!success)
            {
                return Results.BadRequest(new { Message = "Email is already taken" });
            }
            return Results.Ok(new { Message = "User created successfully" });
        });

        group.MapPost("/login", async (HttpContext context, LoginRequest request, AuthService authService) =>
        {
            var tokens = await authService.LoginAsync(request);
            if (tokens == null)
            {
                return Results.Unauthorized();
            }

            context.Response.Cookies.Append(
                "accessToken",
                tokens.AccessToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddMinutes(15)
                }
            );

            context.Response.Cookies.Append(
                "refreshToken",
                tokens.RefreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(7)
                }
            );

            return Results.Ok(new { Message = "Logged in successfully" });
        });

        group.MapPost("/logout", async (HttpContext context, AuthService authService) =>
        {
            var refreshToken = context.Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await authService.LogoutAsync(refreshToken);
            }

            context.Response.Cookies.Delete("accessToken");
            context.Response.Cookies.Delete("refreshToken");

            return Results.Ok(new { Message = "Logged out successfully" });
        });

        group.MapPatch("/reset-password", async (
            AuthService authService,
            MailService mailService,
            [FromBody] ResetPasswordRequest resetPasswordRequest
        ) =>
        {
            var newPassword = await authService.ResetPassword(resetPasswordRequest.Email);
            if (newPassword == null)
            {
                return Results.BadRequest();
            }

            try
            {
                var res = await mailService.SendMail(
                    resetPasswordRequest.Email,
                    "Password reset",
                    $"Your password is set to {newPassword}. Please log in and change it."
                );
                if (!res)
                {
                    return Results.InternalServerError();
                }
            }
            catch
            {
                return Results.InternalServerError();
            }

            return Results.Ok();
        });
    }
}
