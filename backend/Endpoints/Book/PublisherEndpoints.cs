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
            .MapGroup("/api/v1/publisher");

        group.MapGet("/", async (PublisherService publisherService) =>
        {
            return await publisherService.GetAllPublishers();
        });

        group.MapPost("/", [Authorize] async (
            PublisherService publisherService,
            [FromBody] CreatePublisherRequest createPublisherRequest
        ) =>
        {
            await publisherService.CreatePublisher(createPublisherRequest);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapPut("/{id}", [Authorize] async (
            PublisherService publisherService,
            [FromBody] UpdatePublisherRequest updatePublisherRequest,
            string id
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

        group.MapDelete("/{id}", [Authorize] async (
            PublisherService publisherService,
            string id
        ) =>
        {
            await publisherService.DeletePublisher(id);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();
    }
}