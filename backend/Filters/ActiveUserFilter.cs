using System.Security.Claims;
using LibraryPlus.Services.User;

namespace LibraryPlus.Filters;

public class ActiveUserFilter(UserService userService) : IEndpointFilter
{
    private readonly UserService _userService = userService;

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var userId = context.HttpContext.User.FindFirstValue("sub");

        if (userId == null)
        {
            return Results.Unauthorized();
        }

        var user = await _userService.GetUserById(userId);
        if (user == null || user.IsDeleted)
        {
            return Results.Unauthorized();
        }
        return await next(context);
    }
}