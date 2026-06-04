using LibraryPlus.Models.Book;
using LibraryPlus.Models.User;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Reservation;
using LibraryPlus.Services.Book;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Reservation;

public class ReservationService(IMongoDatabase db, BookService bookService)
{
    private readonly IMongoCollection<ReservationModel> _reservations = db.GetCollection<ReservationModel>("reservations");
    private readonly IMongoCollection<UserModel> _users = db.GetCollection<UserModel>("users");
    private readonly IMongoCollection<BookModel> _books = db.GetCollection<BookModel>("books");
    private readonly IMongoCollection<BookUnitModel> _bookUnits = db.GetCollection<BookUnitModel>("bookUnits");
    private readonly BookService _bookService = bookService;
    private const int PAGE_SIZE = 8;

    public async Task<ReservationModel?> CreateReservation(string userId, CreateReservationRequest request)
    {
        var bookUnit = await _bookService.GetAvailableBookUnitForBook(request.BookId);
        if (bookUnit == null) return null;

        var book = await _bookService.GetBookById(request.BookId);
        if (book == null) return null;

        var reservation = new ReservationModel
        {
            BookUnitId = bookUnit.Id,
            UserId = userId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            ReturnedDate = null,
            BookConditionUponReturn = null,
            Status = "Reserved",
            RepurchasePrice = book.RepurchasePrice,
            CreatedAt = DateTime.UtcNow,
        };

        await _reservations.InsertOneAsync(reservation);
        await _bookService.IncreasePopularity(book);
        return reservation;
    }

    public async Task<IList<ReservationModel>> GetUserReservations(string userId, int page)
    {
        return await _reservations.Find(r => r.UserId == userId)
            .SortByDescending(r => r.CreatedAt)
            .Skip(PAGE_SIZE * (page - 1))
            .Limit(PAGE_SIZE)
            .ToListAsync();
    }

    public async Task<bool> HandleTaken(string id)
    {
        var result = await _reservations.UpdateOneAsync(
            r => r.Id == id,
            Builders<ReservationModel>.Update.Set(r => r.Status, "Taken")
        );
        return result.ModifiedCount == 1;
    }

    public async Task<bool> HandleReturned(string id, HandleReturnRequest request)
    {
        var update = Builders<ReservationModel>.Update
            .Set(r => r.Status, "Returned")
            .Set(r => r.ReturnedDate, DateTime.UtcNow)
            .Set(r => r.BookConditionUponReturn, request.BookConditionUponReturn)
            .Set(r => r.AdditionalNote, request.AdditionalNote)
            .Set(r => r.StartDate, request.StartDate)
            .Set(r => r.EndDate, request.EndDate);

        var result = await _reservations.UpdateOneAsync(r => r.Id == id, update);
        return result.ModifiedCount == 1;
    }

    public async Task<bool> UpdateStatus(string id, string status)
    {
        var result = await _reservations.UpdateOneAsync(
            r => r.Id == id,
            Builders<ReservationModel>.Update.Set(r => r.Status, status)
        );
        return result.ModifiedCount == 1;
    }

    public async Task<IList<ReservationModel>> GetAllReservations(int page, string? status = null, string? searchToken = null)
    {
        var pipeline = CreateFilteredPipeline(status, searchToken);

        pipeline.Add(new BsonDocument("$sort", new BsonDocument("createdAt", -1)));
        pipeline.Add(new BsonDocument("$skip", PAGE_SIZE * (page - 1)));
        pipeline.Add(new BsonDocument("$limit", PAGE_SIZE));

        return await _reservations.Aggregate<ReservationModel>(PipelineDefinition<ReservationModel, ReservationModel>.Create(pipeline)).ToListAsync();
    }

    public async Task<int> GetAllReservationsPageCount(string? status = null, string? searchToken = null)
    {
        var pipeline = CreateFilteredPipeline(status, searchToken);
        pipeline.Add(new BsonDocument("$count", "total"));

        var result = await _reservations.Aggregate<BsonDocument>(PipelineDefinition<ReservationModel, BsonDocument>.Create(pipeline)).FirstOrDefaultAsync();
        if (result == null) return 1;

        return (int)Math.Ceiling(result["total"].AsInt32 / (double)PAGE_SIZE);
    }

    private List<BsonDocument> CreateFilteredPipeline(string? status, string? searchToken)
    {
        var pipeline = new List<BsonDocument>();

        if (!string.IsNullOrWhiteSpace(status))
        {
            pipeline.Add(new BsonDocument("$match", new BsonDocument("status", status)));
        }

        if (!string.IsNullOrWhiteSpace(searchToken))
        {
            pipeline.Add(new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "users" },
                { "localField", "userId" },
                { "foreignField", "_id" },
                { "as", "user" }
            }));

            pipeline.Add(new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "bookUnits" },
                { "localField", "bookUnitId" },
                { "foreignField", "_id" },
                { "as", "unit" }
            }));
            pipeline.Add(new BsonDocument("$unwind", "$unit"));

            pipeline.Add(new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "books" },
                { "localField", "unit.bookId" },
                { "foreignField", "_id" },
                { "as", "book" }
            }));

            var regex = new BsonRegularExpression(searchToken, "i");
            pipeline.Add(new BsonDocument("$match", new BsonDocument("$or", new BsonArray
            {
                new BsonDocument("user.name", regex),
                new BsonDocument("user.email", regex),
                new BsonDocument("book.title", regex)
            })));
        }

        return pipeline;
    }
}
