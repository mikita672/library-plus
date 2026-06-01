namespace LibraryPlus.Requests.Reservation;

public record CreateReservationRequest(
    string BookId,
    DateTime StartDate,
    DateTime EndDate
);

public record HandleReturnRequest(
    string BookConditionUponReturn,
    string? AdditionalNote,
    DateTime StartDate,
    DateTime EndDate
);