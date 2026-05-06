using System.Security.Claims;
using LibraryPlus.Services.User;

namespace LibraryPlus.Filters;

public class AdminUserFilter(UserService userService) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var userId = context.HttpContext.User.FindFirstValue("sub")!;

        if (!await userService.IsAdmin(userId))
        {
            return Results.Unauthorized();
        }

        return await next(context);
    }
}