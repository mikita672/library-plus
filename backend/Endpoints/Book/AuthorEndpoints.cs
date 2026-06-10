using LibraryPlus.Filters;
using LibraryPlus.Requests.Book;
using LibraryPlus.Services.Book;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryPlus.Endpoints.Book;

public static class AuthorEndpoints
{
    public static void MapAuthorEndpoints(this WebApplication app)
    {
        var group = app
            .MapGroup("/api/v1/authors");

        group.MapGet("/", async (AuthorService authorService) =>
        {
            return await authorService.GetAllAuthors();
        });

        group.MapPost("/", [Authorize] async (
            AuthorService authorService,
            [FromBody] CreateAuthorRequest createAuthorRequest
        ) =>
        {
            return await authorService.CreateAuthor(createAuthorRequest);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapPut("/author/{id}", [Authorize] async (
            AuthorService authorService,
            [FromBody] UpdateAuthorRequest updateAuthorRequest,
            int id
        ) =>
        {
            if (!await authorService.EditAuthor(id, updateAuthorRequest))
            {
                return Results.NotFound();
            }
            return Results.Ok();
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapDelete("/author/{id}", [Authorize] async (
            AuthorService authorService,
            int id
        ) =>
        {
            await authorService.DeleteAuthor(id);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();
    }
}