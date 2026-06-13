using System.Security.Claims;
using LibraryPlus.Filters;
using LibraryPlus.Requests.Misc;
using LibraryPlus.Services.User;
using Microsoft.AspNetCore.Authorization;
using LibraryPlus.Models;
using Microsoft.EntityFrameworkCore;

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
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            await notificationService.SendAdminNotification(userId, contactRequest.Message);
        });

        group.MapGet("/stats/reservations", [Authorize] async (
            LibraryPlusContext context,
            ClaimsPrincipal claims
        ) =>
        {
            var userIdStr = claims.FindFirstValue("sub");
            if (userIdStr == null || !int.TryParse(userIdStr, out var userId)) { return Results.Unauthorized(); }
            
            var last12Months = DateTime.UtcNow.AddMonths(-11);
            var startOfMonth = new DateTime(last12Months.Year, last12Months.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            
            var data = await context.Reservations
                .Where(r => r.CreatedAt >= startOfMonth)
                .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
                .Select(g => new { 
                    Year = g.Key.Year, 
                    Month = g.Key.Month, 
                    Count = g.Count() 
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            return Results.Ok(data);
        }).AddEndpointFilter<AdminUserFilter>();

    }
}