namespace LibraryPlus.DTO;

public record UserNotificationDTO(
    string Id,
    string Subject,
    string Text,
    bool IsRead
);