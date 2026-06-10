using LibraryPlus.Models.User;

namespace LibraryPlus.Responses.User;

public record UserNotificationCountResponse(
    int PagesCount,
    int NotReadCount
);

public record UserNotificationResponse(
    int Id,
    string Subject,
    string Text,
    bool IsRead,
    DateTime CreatedAt
);