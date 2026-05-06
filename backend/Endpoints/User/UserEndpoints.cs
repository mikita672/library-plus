using System.Security.Claims;
using LibraryPlus.DTO;
using LibraryPlus.Filters;
using LibraryPlus.Requests;
using LibraryPlus.Services.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryPlus.Endpoints.User;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1/user");
        group.AddEndpointFilter<ActiveUserFilter>();
        
        group.MapGet("/meShort", [Authorize] async (ClaimsPrincipal claims, UserService userService) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            var user = (await userService.GetUserById(userId))!;
            return new MeShortDTO(user.Email, user.Name, user.AvatarUrl);
        });

        group.MapGet("/me", [Authorize] async (ClaimsPrincipal claims, UserService userService) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            var user = (await userService.GetUserById(userId))!;
            return MeDTO.FromModel(user);
        });

        group.MapPatch("/updateAddress", [Authorize] async (
            ClaimsPrincipal claims,
            UserService userService,
            [FromBody] UpdateAddressRequest updateAddressRequest
        ) => {
            var userId = claims.FindFirstValue("sub")!;
            await userService.UpdateAddress(userId, updateAddressRequest);
        });

        group.MapPatch("/updatePhoneNumber", [Authorize] async (
            ClaimsPrincipal claims,
            UserService userService,
            [FromBody] UpdatePhoneNumberRequest updatePhoneNumberDto) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            await userService.UpdatePhoneNumber(userId, updatePhoneNumberDto.NewPhoneNumber);
        });

        group.MapPatch("/updatePassword", [Authorize] async (
            ClaimsPrincipal claims,
            UserService userService,
            [FromBody] UpdatePasswordRequest updatePasswordDto
        ) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            var res = await userService.UpdatePassword(userId, updatePasswordDto.OldPassword, updatePasswordDto.NewPassword);
            if (!res)
            {
                return Results.BadRequest();
            }
            return Results.Ok();
        });

        group.MapGet("/getNotifications/{page:int}", [Authorize] async (
            ClaimsPrincipal claims,
            NotificationService notificationService,
            int page
        ) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            return await notificationService.GetUserNotifications(userId, page);
        });
        
    }
}