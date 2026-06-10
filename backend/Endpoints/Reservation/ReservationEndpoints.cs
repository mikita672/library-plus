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
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            var (reservation, error) = await reservationService.CreateReservation(userId, createReservationRequest);
            if (reservation == null)
            {
                return Results.BadRequest(error);
            }
            return Results.Ok(reservation);
        });

        group.MapGet("/", [Authorize] async (
            ReservationService reservationService,
            ClaimsPrincipal claims,
            [FromQuery] int pageNumber,
            [FromQuery] string? status,
            [FromQuery] string? searchToken
        ) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            return await reservationService.GetUserReservations(userId, pageNumber, status, searchToken);
        });

        group.MapGet("/pages", [Authorize] async (
            ReservationService reservationService,
            ClaimsPrincipal claims,
            [FromQuery] string? status,
            [FromQuery] string? searchToken
        ) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            return await reservationService.GetUserReservationsPageCount(userId, status, searchToken);
        });

        group.MapPatch("/reservation/{id}/cancel", [Authorize] async (
            ReservationService reservationService,
            ClaimsPrincipal claims,
            int id
        ) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            var result = await reservationService.CancelReservationByUser(id, userId);
            if (!result) return Results.BadRequest("Cannot cancel this reservation.");
            return Results.Ok();
        });

    group.MapPatch("/reservation/{id}/take", [Authorize] async (
        ReservationService reservationService,
        int id
    ) =>
    {
            await reservationService.HandleTaken(id);
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapPatch("/reservation/{id}/return", [Authorize] async (
            ReservationService reservationService,
            HandleReturnRequest handleReturnRequest,
            int id
        ) =>
        {
            await reservationService.HandleReturned(id, handleReturnRequest);
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapPatch("/reservation/{id}/status", [Authorize] async (
            ReservationService reservationService,
            UpdateStatusRequest updateStatusRequest,
            int id
        ) =>
        {
            await reservationService.UpdateStatus(id, updateStatusRequest.Status);
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapGet("/all", [Authorize] async (
            ReservationService reservationService,
            [FromQuery] int pageNumber,
            [FromQuery] string? status,
            [FromQuery] string? searchToken
        ) =>
        {
            return await reservationService.GetAllReservations(pageNumber, status, searchToken);
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapGet("/byUnit/{unitId:int}", [Authorize] async (
            ReservationService reservationService,
            int unitId
        ) =>
        {
            return await reservationService.GetReservationsByBookUnit(unitId);
        }).AddEndpointFilter<AdminUserFilter>();

        group.MapGet("/all/pages", [Authorize] async (
            ReservationService reservationService,
            [FromQuery] string? status,
            [FromQuery] string? searchToken
        ) =>
        {
            return await reservationService.GetAllReservationsPageCount(status, searchToken);
        }).AddEndpointFilter<AdminUserFilter>();

    }
}