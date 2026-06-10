using LibraryPlus.Filters;
using LibraryPlus.Requests.Book;
using LibraryPlus.Services.Book;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryPlus.Endpoints.Book;

public static class BookEndpoints
{
    public static void MapBookEndpoints(this WebApplication app)
    {
        var group = app
            .MapGroup("/api/v1/books");

        group.MapGet("/", async (
            [FromQuery] string? searchToken,
            [FromQuery] int? authorId,
            [FromQuery] int? publisherId,
            [FromQuery] int[]? categoryIds,
            [FromQuery] int? minPublicationYear,
            [FromQuery] int? maxPublicationYear,
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
            [FromBody] int[] ids,
            BookService bookService
        ) =>
        {
            return await bookService.GetMultipleByIds([.. ids]);
        });

        group.MapGet("/pages", async (
            [FromQuery] string? searchToken,
            [FromQuery] int? authorId,
            [FromQuery] int? publisherId,
            [FromQuery] int[]? categoryIds,
            [FromQuery] int? minPublicationYear,
            [FromQuery] int? maxPublicationYear,
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
            int id
        ) =>
        {
            return await bookService.GetAvailableBookUnitForBook(id) != null;
        });

        group.MapGet("/book/{id}", async (
            BookService bookService,
            int id
        ) =>
        {
            return await bookService.GetBookPreviewById(id);
        });

        group.MapGet("/book/{id}/units", async (
            BookService bookService,
            int id
        ) =>
        {
            return await bookService.GetBookUnitsForBook(id);
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
            int id
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
            int id
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

        group.MapGet("/bookUnit/{id}", [Authorize] async (
            BookService bookService,
            int id
        ) =>
        {
            var bookUnit = await bookService.GetBookUnitById(id);
            if (bookUnit == null)
            {
                return Results.NotFound();
            }
            return Results.Ok(bookUnit);
        });

        group.MapDelete("/bookUnit/{id}", [Authorize] async (
            BookService bookService,
            int id
        ) =>
        {
            await bookService.DeleteBookUnit(id);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapGet("/booksByAuthor/{authorId}", async (
            BookService bookService,
            [FromQuery] int? excludedBookId,
            int authorId
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

        group.MapPatch("/bookUnit/{id}/archive", [Authorize] async (
            BookService bookService,
            int id
        ) =>
        {
            if (!await bookService.ArchiveBookUnit(id))
            {
                return Results.BadRequest("Cannot archive a rented book unit.");
            }
            return Results.Ok();
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapPatch("/bookUnit/{id}/unarchive", [Authorize] async (
            BookService bookService,
            int id
        ) =>
        {
            if (!await bookService.UnarchiveBookUnit(id))
            {
                return Results.NotFound();
            }
            return Results.Ok();
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapGet("/book/{id}/reviews", async (
            ReviewService reviewService,
            int id,
            [FromQuery] int? pageNumber
        ) =>
        {
            return await reviewService.GetBookReviews(id, pageNumber ?? 1);
        });

        group.MapPost("/book/{id}/reviews", [Authorize] async (
            ReviewService reviewService,
            ClaimsPrincipal claims,
            int id,
            [FromBody] CreateReviewRequest request
        ) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            var review = await reviewService.CreateReview(userId, new CreateReviewRequest(id, request.Rating, request.ReviewText));
            if (review == null)
            {
                return Results.BadRequest("You have already reviewed this book or have not returned a rental for it.");
            }
            return Results.Ok(review);
        })
            .AddEndpointFilter<ActiveUserFilter>();

        group.MapGet("/book/{id}/rating", async (
            ReviewService reviewService,
            int id
        ) =>
        {
            return await reviewService.GetBookRatingSummary(id);
        });

        group.MapGet("/me/reviewed-books", [Authorize] async (
            ReviewService reviewService,
            ClaimsPrincipal claims
        ) =>
        {
            var userId = int.Parse(claims.FindFirstValue("sub")!);
            return await reviewService.GetReviewedBookIds(userId);
        })
            .AddEndpointFilter<ActiveUserFilter>();

    }
}