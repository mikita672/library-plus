using System.Security.Claims;
using LibraryPlus.Filters;
using LibraryPlus.Models;
using LibraryPlus.Services.Book;
using LibraryPlus.Services.User;
using Microsoft.AspNetCore.Mvc;

namespace LibraryPlus.Endpoints;

public static class MediaEndpoints
{
    private static readonly string[] AllowedContentTypes = ["image/jpeg", "image/png", "image/webp"];
    private const long MaxBookCoverSize = 5 * 1024 * 1024;
    private const long MaxAvatarSize = 2 * 1024 * 1024;

    public static void MapMediaEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/media");

        group.MapPost("/books/{bookId:int}/cover", UploadBookCover)
            .RequireAuthorization()
            .AddEndpointFilter<AdminUserFilter>()
            .DisableAntiforgery();

        group.MapPost("/users/me/avatar", UploadUserAvatar)
            .RequireAuthorization()
            .DisableAntiforgery();

        group.MapGet("/books/{bookId:int}/cover", GetBookCover);
        group.MapGet("/users/{userId:int}/avatar", GetUserAvatar);
    }

    private static async Task<IResult> UploadBookCover(
        int bookId,
        IFormFile file,
        BookService bookService,
        LibraryPlusContext context,
        CancellationToken ct)
    {
        if (file.Length == 0)
        {
            return Results.BadRequest("File is empty.");
        }
        if (file.Length > MaxBookCoverSize)
        {
            return Results.BadRequest("File is too large.");
        }
        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            return Results.BadRequest("Invalid file type.");
        }

        var book = await bookService.GetBookById(bookId);
        if (book == null)
        {
            return Results.NotFound("Book not found.");
        }

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, ct);

        var coverBytes = memoryStream.ToArray();
        await bookService.SetCoverImageId(bookId, coverBytes, file.ContentType);

        return Results.Ok(new { coverURI = $"/api/media/books/{bookId}/cover" });
    }

    private static async Task<IResult> UploadUserAvatar(
        ClaimsPrincipal user,
        IFormFile file,
        UserService userService,
        LibraryPlusContext context,
        CancellationToken ct)
    {
        var userIdStr = user.FindFirstValue("sub")!;
        if (!int.TryParse(userIdStr, out var userId))
        {
            return Results.Unauthorized();
        }

        if (file.Length == 0)
        {
            return Results.BadRequest("File is empty.");
        }
        if (file.Length > MaxAvatarSize)
        {
            return Results.BadRequest("File is too large.");
        }
        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            return Results.BadRequest("Invalid file type.");
        }

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, ct);

        var avatarBytes = memoryStream.ToArray();
        await userService.SetAvatarImageId(userId, avatarBytes, file.ContentType);

        return Results.Ok(new { avatarUrl = $"/api/media/users/{userId}/avatar" });
    }

    private static async Task<IResult> GetBookCover(int bookId, LibraryPlusContext context)
    {
        var book = await context.Books.FindAsync(bookId);
        if (book?.CoverImage == null || book.CoverImageContentType == null)
        {
            return Results.NotFound();
        }

        return Results.File(book.CoverImage, book.CoverImageContentType);
    }

    private static async Task<IResult> GetUserAvatar(int userId, LibraryPlusContext context)
    {
        var user = await context.Users.FindAsync(userId);
        if (user?.AvatarImage == null || user.AvatarImageContentType == null)
        {
            return Results.NotFound();
        }

        return Results.File(user.AvatarImage, user.AvatarImageContentType);
    }
}
