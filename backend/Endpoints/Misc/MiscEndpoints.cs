using System.Security.Claims;
using LibraryPlus.Filters;
using LibraryPlus.Requests.Misc;
using LibraryPlus.Services.User;
using Microsoft.AspNetCore.Authorization;

namespace LibraryPlus.Endpoints.Misc;

public static class MiscEndpoints
{
    public static void MapMiscEndpoints(this WebApplication app)
    {
        var group = app
            .MapGroup("/api/v1/misc")
            .AddEndpointFilter<ActiveUserFilter>();

        group.MapPost("/contact", [Authorize] async (
            NotificationService notificationService,
            ClaimsPrincipal claims,
            ContactRequest contactRequest
        ) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            await notificationService.SendAdminNotification(userId, contactRequest.Message);
        });

    }
}