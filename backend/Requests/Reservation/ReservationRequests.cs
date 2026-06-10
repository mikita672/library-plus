namespace LibraryPlus.Requests.Reservation;

public record CreateReservationRequest(
    int BookId,
    DateTime StartDate,
    DateTime EndDate
);

public record HandleReturnRequest(
    string BookConditionUponReturn,
    string? AdditionalNote
);

public record UpdateStatusRequest(
    string Status
);