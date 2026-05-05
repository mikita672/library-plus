using LibraryPlus.Requests;
using LibraryPlus.Filters;
using LibraryPlus.Services.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryPlus.Endpoints.User;

public static class NotificationEndpoints
{
    public static void MapNotificationEndpoints(this WebApplication app)
    {
        var group = app
            .MapGroup("/api/v1/notification")
            .AddEndpointFilter<ActiveUserFilter>();

        group.MapPost("/sendOne", [Authorize] async (
            NotificationService notificationService,
            [FromBody] SendOneNotificationRequest sendOneNotificationRequest
        ) =>
        {
            await notificationService.SendOneUserNotification(sendOneNotificationRequest.UserId, sendOneNotificationRequest.Text);
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapPost("/sendAll", [Authorize] async (
            UserService userService,
            [FromBody] SendAllNotificationRequest sendOneNotificationRequest
        ) =>
        {
            await userService.SendAllUsersNotification(sendOneNotificationRequest.Text);
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapPatch("/read/{id}", [Authorize] async (
            ClaimsPrincipal claims,
            NotificationService notificationService,
            string id
        ) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            if (!await notificationService.MarkNotificationAsRead(userId, id))
            {
                return Results.NotFound();
            }
            return Results.Ok();
        });

    }

}