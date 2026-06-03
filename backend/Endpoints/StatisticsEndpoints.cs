using LibraryPlus.Filters;
using LibraryPlus.Requests.Statistics;
using LibraryPlus.Services.Statistics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryPlus.Endpoints;

public static class StatisticsEndpoints
{
    public static void MapStatisticsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/statistics")
            .RequireAuthorization()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapPost("/", async (
            StatisticsRequest request,
            StatisticsService statisticsService
        ) =>
        {
            var stats = await statisticsService.GetStatistics(request);
            return Results.Ok(stats);
        });
    }
}
