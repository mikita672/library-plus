using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Reservation;
using LibraryPlus.Services.Book;
using MongoDB.Driver;

namespace LibraryPlus.Services.Reservation;

public class ReservationService(IMongoDatabase db, BookService bookService)
{
    private readonly IMongoCollection<ReservationModel> _reservations = db.GetCollection<ReservationModel>("reservations");
    private readonly BookService _bookService = bookService;

    public async Task<ReservationModel?> CreateReservation(string userId, CreateReservationRequest createReservationRequest)
    {
        var bookUnit = await _bookService.GetAvailableBookUnit(createReservationRequest.BookId);
        if (bookUnit == null)
        {
            return null;
        }
        var book = await _bookService.GetBookById(createReservationRequest.BookId);
        if (book == null)
        {
            return null;
        }

        var reservation = new ReservationModel
        {
            BookUnitId = bookUnit.Id,
            UserId = userId,
            StartDate = createReservationRequest.StartDate,
            EndDate = createReservationRequest.EndDate,
            ReturnedDate = null,
            BookConditionUponReturn = null,
            Status = "Reserved",
            RepurchasePrice = book.RepurchasePrice,
            CreatedAt = DateTime.UtcNow,
        };
        await _reservations.InsertOneAsync(reservation);
        return reservation;
    }

}