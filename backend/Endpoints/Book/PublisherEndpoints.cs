using LibraryPlus.Filters;
using LibraryPlus.Requests.Book;
using LibraryPlus.Services.Book;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryPlus.Endpoints.Book;

public static class PublisherEndpoints
{
    public static void MapPublisherEndpoints(this WebApplication app)
    {
        var group = app
            .MapGroup("/api/v1/publishers");

        group.MapGet("/", async (PublisherService publisherService) =>
        {
            return await publisherService.GetAllPublishers();
        });

        group.MapPost("/", [Authorize] async (
            PublisherService publisherService,
            [FromBody] CreatePublisherRequest createPublisherRequest
        ) =>
        {
            return await publisherService.CreatePublisher(createPublisherRequest);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapPut("/publisher/{id}", [Authorize] async (
            PublisherService publisherService,
            [FromBody] UpdatePublisherRequest updatePublisherRequest,
            int id
        ) =>
        {
            if (!await publisherService.EditPublisher(id, updatePublisherRequest))
            {
                return Results.NotFound();
            }
            return Results.Ok();
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapDelete("/publisher/{id}", [Authorize] async (
            PublisherService publisherService,
            int id
        ) =>
        {
            await publisherService.DeletePublisher(id);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();
    }
}