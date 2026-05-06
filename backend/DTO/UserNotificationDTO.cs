namespace LibraryPlus.DTO;

public record UserNotificationDTO(
    string Id,
    string Text,
    bool IsRead
);