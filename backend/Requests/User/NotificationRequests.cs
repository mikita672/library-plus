namespace LibraryPlus.Requests.User;

public record NotificationRequest(
    string Text
);

public record SendOneNotificationRequest(
    string Email,
    NotificationRequest NotificationBody
);