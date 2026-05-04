namespace LibraryPlus.Requests;

public record SendOneNotificationRequest(
    string UserId,
    string Text
);