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
        await _bookService.IncreasePopularity(book);
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
                .Set(r => r.AdditionalNote, handleReturnRequest.AdditionalNote)
                .Set(r => r.StartDate, handleReturnRequest.StartDate)
                .Set(r => r.EndDate, handleReturnRequest.EndDate)
        );
        return res.MatchedCount == 1;
    }

    public async Task<bool> UpdateStatus(string id, string status)
    {
        var res = await _reservations.UpdateOneAsync(
            Builders<ReservationModel>.Filter.Eq(r => r.Id, id),
            Builders<ReservationModel>.Update.Set(r => r.Status, status)
        );
        return res.MatchedCount == 1;
    }

    public async Task<IList<ReservationModel>> GetAllReservations(int page, string? status = null, string? searchToken = null)
    {
        var pipeline = CreateFilteredAggregationPipeline(status, searchToken);

        pipeline.Add(new BsonDocument("$sort", new BsonDocument("createdAt", -1)));
        pipeline.Add(new BsonDocument("$skip", 8 * (page - 1)));
        pipeline.Add(new BsonDocument("$limit", 8));

        var results = await _reservations.Aggregate<ReservationModel>(PipelineDefinition<ReservationModel, ReservationModel>.Create(pipeline)).ToListAsync();
        return results;
    }

    public async Task<int> GetAllReservationsPageCount(string? status = null, string? searchToken = null)
    {
        var pipeline = CreateFilteredAggregationPipeline(status, searchToken);

        pipeline.Add(new BsonDocument("$count", "totalCount"));

        var result = await _reservations.Aggregate<BsonDocument>(PipelineDefinition<ReservationModel, BsonDocument>.Create(pipeline)).FirstOrDefaultAsync();
        if (result == null) return 1;

        var count = result["totalCount"].AsInt32;
        return (int)Math.Ceiling((double)count / 8);
    }

    private List<BsonDocument> CreateFilteredAggregationPipeline(string? status = null, string? searchToken = null)
    {
        var pipeline = new List<BsonDocument>();

        if (!string.IsNullOrWhiteSpace(status))
        {
            pipeline.Add(new BsonDocument("$match", new BsonDocument("status", status)));
        }

        if (!string.IsNullOrWhiteSpace(searchToken))
        {
            // Join with Users
            pipeline.Add(new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "users" },
                { "localField", "userId" },
                { "foreignField", "_id" },
                { "as", "user_info" }
            }));

            // Join with BookUnits to get BookId
            pipeline.Add(new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "bookUnits" },
                { "localField", "bookUnitId" },
                { "foreignField", "_id" },
                { "as", "unit_info" }
            }));
            pipeline.Add(new BsonDocument("$unwind", "$unit_info"));

            // Join with Books to get title
            pipeline.Add(new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "books" },
                { "localField", "unit_info.bookId" },
                { "foreignField", "_id" },
                { "as", "book_info" }
            }));

            var regex = new BsonRegularExpression(searchToken, "i");
            pipeline.Add(new BsonDocument("$match", new BsonDocument("$or", new BsonArray
            {
                new BsonDocument("user_info.name", regex),
                new BsonDocument("user_info.email", regex),
                new BsonDocument("book_info.title", regex)
            })));
        }

        return pipeline;
    }
}
