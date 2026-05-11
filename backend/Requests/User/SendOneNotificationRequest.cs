namespace LibraryPlus.Requests.User;

public record SendOneNotificationRequest(
    string UserId,
    NotificationBody NotificationBody
);