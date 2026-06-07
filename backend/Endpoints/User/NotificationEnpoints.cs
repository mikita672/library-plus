using LibraryPlus.Requests.User;
using LibraryPlus.Filters;
using LibraryPlus.Services.User;
using LibraryPlus.Services.Mail;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryPlus.Endpoints.User;

public static class NotificationEndpoints
{
    public static void MapNotificationEndpoints(this WebApplication app)
    {
        var group = app
            .MapGroup("/api/v1/notifications")
            .AddEndpointFilter<ActiveUserFilter>();

        group.MapPost("/sendOne", [Authorize] async (
            NotificationService notificationService,
            UserService userService,
            IMailService mailService,
            [FromBody] SendOneNotificationRequest sendOneNotificationRequest
        ) =>
        {
            var user = await userService.GetUserByEmail(sendOneNotificationRequest.Email);
            if (user == null)
            {
                return Results.NotFound("User not found.");
            }
            await notificationService.SendOneUserNotification(user.Id, sendOneNotificationRequest.NotificationBody);
            _ = mailService.SendMail(user.Email, sendOneNotificationRequest.NotificationBody.Subject, sendOneNotificationRequest.NotificationBody.Text);
            return Results.Ok();
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapPost("/sendAll", [Authorize] async (
            UserService userService,
            IMailService mailService,
            [FromBody] NotificationRequest sendNotificationRequest
        ) =>
        {
            await userService.SendAllUsersNotification(sendNotificationRequest);
            var users = await userService.GetAllUserEmails();
            foreach (var email in users)
            {
                _ = mailService.SendMail(email, sendNotificationRequest.Subject, sendNotificationRequest.Text);
            }
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

        group.MapGet("/suggestUsers", [Authorize] async (
            UserService userService,
            [FromQuery] string query
        ) =>
        {
            if (string.IsNullOrWhiteSpace(query)) return Results.Ok(Array.Empty<object>());
            var suggestions = await userService.SuggestUsersByEmail(query);
            return Results.Ok(suggestions);
        }).AddEndpointFilter<AdminUserFilter>();
    }
}