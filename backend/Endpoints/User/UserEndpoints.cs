using System.Security.Claims;
using LibraryPlus.Filters;
using LibraryPlus.Requests.User;
using LibraryPlus.Responses.User;
using LibraryPlus.Services.Auth;
using LibraryPlus.Services.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryPlus.Endpoints.User;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1/users");
        group.AddEndpointFilter<ActiveUserFilter>();


        group.MapGet("/meShort", [Authorize] async (ClaimsPrincipal claims, UserService userService) =>
        {
            var userIdStr = claims.FindFirstValue("sub");
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId)) return Results.Unauthorized();
            
            var user = await userService.GetUserById(userId);
            if (user == null) return Results.NotFound();
            
            return Results.Ok(new MeShortResponse(user.Email, user.Name, userService.GetAvatarUrlById(user), user.PhoneNumber));
        });

        group.MapGet("/user/{id}", [Authorize] async (int id, UserService userService) =>
        {
            var user = await userService.GetUserById(id);
            if (user == null) return Results.NotFound();
            
            return Results.Ok(new MeShortResponse(user.Email, user.Name, userService.GetAvatarUrlById(user), user.PhoneNumber));
        });

        group.MapGet("/me", [Authorize] async (ClaimsPrincipal claims, UserService userService) =>
        {
            var userIdStr = claims.FindFirstValue("sub");
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

            var user = await userService.GetUserById(userId);
            if (user == null) return Results.NotFound();

            var response = MeResponse.FromModel(user);
            return Results.Ok(response with { AvatarUrl = userService.GetAvatarUrlById(user) });
        });

        group.MapPatch("/updatePhoneNumber", [Authorize] async (
            ClaimsPrincipal claims,
            UserService userService,
            [FromBody] UpdatePhoneNumberRequest updatePhoneNumberDto) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            await userService.UpdatePhoneNumber(userId, updatePhoneNumberDto.NewPhoneNumber);
        });

        group.MapPatch("/updateName", [Authorize] async (
            ClaimsPrincipal claims,
            UserService userService,
            [FromBody] UpdateNameRequest updateNameDto) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            await userService.UpdateName(userId, updateNameDto.NewName);
        });

        group.MapPatch("/updateProfile", [Authorize] async (
            ClaimsPrincipal claims,
            UserService userService,
            [FromBody] UpdateProfileRequest updateProfileDto) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            await userService.UpdateProfile(userId, updateProfileDto.Name, updateProfileDto.PhoneNumber);
        });

        group.MapPatch("/updatePassword", [Authorize] async (
            ClaimsPrincipal claims,
            AuthService authService,
            [FromBody] UpdatePasswordRequest updatePasswordDto
        ) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            var res = await authService.ChangePassword(userId, updatePasswordDto.OldPassword, updatePasswordDto.NewPassword);
            if (!res)
            {
                return Results.BadRequest();
            }
            return Results.Ok();
        });

        group.MapGet("/notifications", [Authorize] async (
            ClaimsPrincipal claims,
            NotificationService notificationService,
            [FromQuery] int pageNumber
        ) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            return await notificationService.GetUserNotifications(userId, pageNumber);
        });

        group.MapGet("/notifications/count", [Authorize] async (
            ClaimsPrincipal claims,
            NotificationService notificationService
        ) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            return await notificationService.GetUserNotificationsCount(userId);
        });

        group.MapDelete("/me", [Authorize] async (
            ClaimsPrincipal claims,
            UserService userService,
            RefreshTokenService refreshTokenService) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            var deleted = await userService.SoftDeleteUser(userId);
            if (deleted)
            {
                await refreshTokenService.RemoveRefreshTokensForUser(userId);
            }

            return deleted ? Results.NoContent() : Results.NotFound();
        });

        group.MapGet("/all", [Authorize] async (
            UserService userService,
            [FromQuery] int pageNumber,
            [FromQuery] string? searchToken
        ) =>
        {
            var users = await userService.GetUsers(pageNumber, searchToken);
            return Results.Ok(users.Select(u => AdminUserResponse.FromModel(u, userService.GetAvatarUrlById(u))));
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapGet("/all/pages", [Authorize] async (
            UserService userService,
            [FromQuery] string? searchToken
        ) =>
        {
            var pages = await userService.GetUsersPages(searchToken);
            return Results.Ok(pages);
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapPatch("/user/{id}/delete", [Authorize] async (
            int id,
            UserService userService,
            RefreshTokenService refreshTokenService) =>
        {
            var deleted = await userService.SoftDeleteUser(id);
            if (deleted)
            {
                await refreshTokenService.RemoveRefreshTokensForUser(id);
            }
            return deleted ? Results.NoContent() : Results.NotFound();
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapPatch("/user/{id}/restore", [Authorize] async (
            int id,
            UserService userService) =>
        {
            var restored = await userService.RestoreUser(id);
            return restored ? Results.NoContent() : Results.NotFound();
        }).AddEndpointFilter<AdminUserFilter>();
    }
}