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
            .MapGroup("/api/v1/books");

        group.MapGet("/", async (
            [FromQuery] string? searchToken,
            [FromQuery] string? authorId,
            [FromQuery] string? publisherId,
            [FromQuery] string[]? categoryIds,
            [FromQuery] uint? minPublicationYear,
            [FromQuery] uint? maxPublicationYear,
            [FromQuery] bool? isAvailable,
            [FromQuery] int? pageNumber,
            [FromQuery] string? sortBy,
            [FromQuery] bool? sortDescending,
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
                isAvailable,
                pageNumber ?? 1,
                sortBy,
                sortDescending ?? false
            );
        });


        group.MapPost("/multiple", async (
            [FromBody] string[] ids,
            BookService bookService
        ) =>
        {
            return await bookService.GetMultipleByIds([.. ids]);
        });

        group.MapGet("/pages", async (
            [FromQuery] string? searchToken,
            [FromQuery] string? authorId,
            [FromQuery] string? publisherId,
            [FromQuery] string[]? categoryIds,
            [FromQuery] uint? minPublicationYear,
            [FromQuery] uint? maxPublicationYear,
            [FromQuery] bool? isAvailable,
            BookService bookService
        ) =>
        {
            return await bookService.GetPagesCount(
                searchToken,
                authorId,
                publisherId,
                categoryIds?.ToList(),
                minPublicationYear,
                maxPublicationYear,
                isAvailable
            );
        });

        group.MapGet("/book/{id}/checkAvailable", async (
            BookService bookService,
            string id
        ) =>
        {
            return await bookService.GetAvailableBookUnitForBook(id) != null;
        });

        group.MapGet("/book/{id}", async (
            BookService bookService,
            string id
        ) =>
        {
            return await bookService.GetBookPreviewById(id);
        });

        group.MapPost("/", [Authorize] async (
            BookService bookService,
            [FromBody] CreateBookRequest createBookRequest
        ) =>
        {
            return await bookService.CreateBook(createBookRequest);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapPut("/book/{id}", [Authorize] async (
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

        group.MapDelete("/book/{id}", [Authorize] async (
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

        group.MapGet("/booksByAuthor/{authorId}", async (
            BookService bookService,
            [FromQuery] string? excludedBookId,
            string authorId
        ) =>
        {
            return await bookService.GetBooksByAuthor(authorId, excludedBookId);
        });

        group.MapGet("/popular", async (
            BookService bookService
        ) =>
        {
            return await bookService.GetPopularBooks();
        });

    }
}