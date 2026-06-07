namespace LibraryPlus.Requests.User;

public record NotificationRequest(
    string Subject,
    string Text
);

public record SendOneNotificationRequest(
    string Email,
    NotificationRequest NotificationBody
);