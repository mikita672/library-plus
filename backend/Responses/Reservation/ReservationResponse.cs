namespace LibraryPlus.Responses.Reservation;

public record ReservationResponse(
    int Id,
    int BookUnitId,
    int UserId,
    DateTime StartDate,
    DateTime EndDate,
    DateTime? ReturnedDate,
    string? BookConditionUponReturn,
    string Status,
    decimal RepurchasePrice,
    DateTime CreatedAt,
    string? AdditionalNote,
    string ClientName,
    string ClientEmail,
    string ClientPhone,
    string? ClientAvatarUrl,
    int BookId,
    string BookTitle,
    string BookAuthor,
    string BookLanguage,
    int BookYear,
    string? BookCoverUri,
    bool HasReviewed
);
