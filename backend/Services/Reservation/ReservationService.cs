using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Reservation;
using LibraryPlus.Services.Book;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Reservation;

public class ReservationService(IMongoDatabase db, BookService bookService)
{
    private readonly IMongoCollection<ReservationModel> _reservations = db.GetCollection<ReservationModel>("reservations");
    private readonly BookService _bookService = bookService;

    public async Task<ReservationModel?> CreateReservation(string userId, CreateReservationRequest createReservationRequest)
    {
        var bookUnit = await _bookService.GetAvailableBookUnitForBook(createReservationRequest.BookId);
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

    public async Task<IList<ReservationModel>> GetUserReservations(string userId, int page)
    {
        return await _reservations.AsQueryable()
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Skip(8 * (page - 1))
            .Take(8)
            .ToListAsync();
    }

    public async Task<bool> HandleTaken(string id)
    {
        var res = await _reservations.UpdateOneAsync(
            Builders<ReservationModel>.Filter.Eq(r => r.Id, id),
            Builders<ReservationModel>.Update.Set(r => r.Status, "Taken")
        );
        return res.MatchedCount == 1;
    }

    public async Task<bool> HandleReturned(string id, HandleReturnRequest handleReturnRequest)
    {
        var res = await _reservations.UpdateOneAsync(
            Builders<ReservationModel>.Filter.Eq(r => r.Id, id),
            Builders<ReservationModel>.Update
                .Set(r => r.Status, "Returned")
                .Set(r => r.ReturnedDate, DateTime.UtcNow)
                .Set(r => r.BookConditionUponReturn, handleReturnRequest.BookConditionUponReturn)
        );
        return res.MatchedCount == 1;
    }

}