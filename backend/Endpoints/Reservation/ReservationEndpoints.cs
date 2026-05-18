using System.Security.Claims;
using LibraryPlus.Filters;
using LibraryPlus.Requests.Reservation;
using LibraryPlus.Services.Reservation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryPlus.Endpoints.Reservation;

public static class ReservationEndpoints
{
    public static void MapReservationEndpoints(this WebApplication app)
    {
        var group = app
            .MapGroup("/api/v1/reservations")
            .AddEndpointFilter<ActiveUserFilter>();

        group.MapPost("/", [Authorize] async (
            ReservationService reservationService,
            ClaimsPrincipal claims,
            [FromBody] CreateReservationRequest createReservationRequest
        ) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            var res = await reservationService.CreateReservation(userId, createReservationRequest);
            if (res == null)
            {
                return Results.BadRequest();
            }
            return Results.Ok(res);
        });

        group.MapGet("/", [Authorize] async (
            ReservationService reservationService,
            ClaimsPrincipal claims,
            [FromBody] CreateReservationRequest createReservationRequest,
            [FromQuery] int pageNumber
        ) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            return await reservationService.GetUserReservations(userId, pageNumber);
        });

        group.MapPatch("/reservation/{id}/take", [Authorize] async (
            ReservationService reservationService,
            string id
        ) =>
        {
            await reservationService.HandleTaken(id);
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapPatch("/reservation/{id}/return", [Authorize] async (
            ReservationService reservationService,
            HandleReturnRequest handleReturnRequest,
            string id
        ) =>
        {
            await reservationService.HandleReturned(id, handleReturnRequest);
        }).AddEndpointFilter<AdminUserFilter>();

    }
}