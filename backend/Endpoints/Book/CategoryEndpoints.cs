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
            .MapGroup("/api/v1/categories");

        group.MapGet("/", async (CategoryService categoryService, [FromQuery] bool includeInactive = false) =>
        {
            return await categoryService.GetAllCategories(includeInactive);
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

        group.MapPut("/category/{id}", [Authorize] async (
            CategoryService categoryService,
            [FromBody] UpdateCategoryRequest updateCategoryRequest,
            int id
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

        group.MapDelete("/category/{id}", [Authorize] async (
            CategoryService categoryService,
            int id
        ) =>
        {
            await categoryService.DeleteCategory(id);
        })
            .AddEndpointFilter<ActiveUserFilter>()
            .AddEndpointFilter<AdminUserFilter>();
    }
}