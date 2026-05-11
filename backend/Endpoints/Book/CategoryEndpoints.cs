using LibraryPlus.Filters;
using LibraryPlus.Requests.Book;
using LibraryPlus.Services.Book;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryPlus.Endpoints.Book;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this WebApplication app)
    {
        var group = app
            .MapGroup("/api/v1/category");

        group.MapGet("/", async (CategoryService categoryService) =>
        {
            return await categoryService.GetAllCategories();
        });

        group.MapPost("/", [Authorize] async (
            CategoryService categoryService,
            [FromBody] CreateCategoryRequest createCategoryRequest
        ) =>
        {
            return await categoryService.CreateCategory(createCategoryRequest);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapPut("/{id}", [Authorize] async (
            CategoryService categoryService,
            [FromBody] UpdateCategoryRequest updateCategoryRequest,
            string id
        ) =>
        {
            if (!await categoryService.EditCategory(id, updateCategoryRequest))
            {
                return Results.NotFound();
            }
            return Results.Ok();
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();

        group.MapDelete("/{id}", [Authorize] async (
            CategoryService categoryService,
            string id
        ) =>
        {
            await categoryService.DeleteCategory(id);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();
    }
}