namespace LibraryPlus.Requests.Reservation;

public record CreateReservationRequest(
    string BookId,
    DateTime StartDate,
    DateTime EndDate
);