using System.Security.Claims;
using LibraryPlus.Filters;
using LibraryPlus.Services.Book;
using LibraryPlus.Services.Storage;
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

        group.MapPost("/books/{bookId}/cover", UploadBookCover)
            .RequireAuthorization()
            .AddEndpointFilter<AdminUserFilter>()
            .DisableAntiforgery();

        group.MapPost("/users/me/avatar", UploadUserAvatar)
            .RequireAuthorization()
            .DisableAntiforgery();
    }

    private static async Task<IResult> UploadBookCover(
        string bookId,
        IFormFile file,
        BookService bookService,
        IObjectStorageService storageService,
        CancellationToken ct)
    {
        if (file.Length == 0) return Results.BadRequest("File is empty.");
        if (file.Length > MaxBookCoverSize) return Results.BadRequest("File is too large.");
        if (!AllowedContentTypes.Contains(file.ContentType)) return Results.BadRequest("Invalid file type.");

        var book = await bookService.GetBookById(bookId);
        if (book == null) return Results.NotFound("Book not found.");

        var extension = Path.GetExtension(file.FileName);
        var key = $"covers/{bookId}{extension}";

        using var stream = file.OpenReadStream();
        var uploadedKey = await storageService.UploadAsync(key, stream, file.ContentType, ct);

        await bookService.SetCoverURI(bookId, uploadedKey);

        return Results.Ok(new { coverURI = storageService.GetPublicUrl(uploadedKey) });
    }

    private static async Task<IResult> UploadUserAvatar(
        ClaimsPrincipal user,
        IFormFile file,
        UserService userService,
        IObjectStorageService storageService,
        CancellationToken ct)
    {
        var userId = user.FindFirstValue("sub")!;
        if (file.Length == 0) return Results.BadRequest("File is empty.");
        if (file.Length > MaxAvatarSize) return Results.BadRequest("File is too large.");
        if (!AllowedContentTypes.Contains(file.ContentType)) return Results.BadRequest("Invalid file type.");

        var extension = Path.GetExtension(file.FileName);
        var key = $"avatars/{userId}{extension}";

        using var stream = file.OpenReadStream();
        var uploadedKey = await storageService.UploadAsync(key, stream, file.ContentType, ct);

        await userService.SetAvatarUrl(userId, uploadedKey);

        return Results.Ok(new { avatarUrl = storageService.GetPublicUrl(uploadedKey) });
    }
}
