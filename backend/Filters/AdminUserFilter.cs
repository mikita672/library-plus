using System.Security.Claims;
using LibraryPlus.Services.User;

namespace LibraryPlus.Filters;

public class AdminUserFilter(UserService userService) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var userIdStr = context.HttpContext.User.FindFirstValue("sub")!;

        if (!int.TryParse(userIdStr, out var userId) || !await userService.IsAdmin(userId))
        {
            return Results.Unauthorized();
        }

        return await next(context);
    }
}