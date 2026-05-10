using LibraryPlus.Filters;
using LibraryPlus.Requests.Book;
using LibraryPlus.Services.Book;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryPlus.Endpoints.Book;

public static class BookEndpoints
{
    public static void MapBookEndpoints(this WebApplication app)
    {
        var group = app
            .MapGroup("/api/v1/book");

        group.MapGet("/", async (
            [FromQuery] string? searchToken,
            [FromQuery] string? authorId,
            [FromQuery] string? publisherId,
            [FromQuery] string[]? categoryIds,
            [FromQuery] uint? minPublicationYear,
            [FromQuery] uint? maxPublicationYear,
            [FromQuery] int pageNumber,
            [FromQuery] string? sortBy,
            [FromQuery] bool sortDescending,
            BookService bookService
        ) =>
        {
            return await bookService.SearchBooks(
                searchToken,
                authorId,
                publisherId,
                categoryIds?.ToList(),
                minPublicationYear,
                maxPublicationYear,
                pageNumber,
                sortBy,
                sortDescending
            );
        });

        group.MapPost("/", [Authorize] async (
            BookService bookService,
            [FromBody] CreateBookRequest createBookRequest
        ) =>
        {
            await bookService.CreateBook(createBookRequest);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapPut("/{id}", [Authorize] async (
            BookService bookService,
            [FromBody] UpdateBookRequest updateBookRequest,
            string id
        ) =>
        {
            if (!await bookService.EditBook(id, updateBookRequest))
            {
                return Results.NotFound();
            }
            return Results.Ok();
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapDelete("/{id}", [Authorize] async (
            BookService bookService,
            string id
        ) =>
        {
            await bookService.DeleteBook(id);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapPost("/bookUnit", [Authorize] async (
            BookService bookService,
            [FromBody] AddBookUnitRequest addBookUnitRequest
        ) =>
        {
            await bookService.AddBookUnit(addBookUnitRequest.BookId);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapDelete("/bookUnit/{id}", [Authorize] async (
            BookService bookService,
            string id
        ) =>
        {
            await bookService.DeleteBookUnit(id);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();
    }
}