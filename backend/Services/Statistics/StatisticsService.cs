using LibraryPlus.Models.Book;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Models.User;
using LibraryPlus.Requests.Statistics;
using LibraryPlus.Responses.Statistics;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Statistics;

public class StatisticsService(IMongoDatabase db)
{
    private readonly IMongoCollection<BookModel> _books = db.GetCollection<BookModel>("books");
    private readonly IMongoCollection<BookUnitModel> _bookUnits = db.GetCollection<BookUnitModel>("bookUnits");
    private readonly IMongoCollection<UserModel> _users = db.GetCollection<UserModel>("users");
    private readonly IMongoCollection<ReservationModel> _reservations = db.GetCollection<ReservationModel>("reservations");
    private readonly IMongoCollection<CategoryModel> _categories = db.GetCollection<CategoryModel>("categories");

    public async Task<StatisticsResponse> GetStatistics(StatisticsRequest request)
    {
        var from = request.From.ToUniversalTime();
        var to = request.To.ToUniversalTime();

        var totalUnitsTask = _bookUnits.CountDocumentsAsync(_ => true);
        var totalMembersTask = _users.CountDocumentsAsync(u => !u.IsDeleted);
        var booksRentedTask = _reservations.CountDocumentsAsync(r => r.Status == "Taken");
        
        var activeResTask = _reservations.CountDocumentsAsync(r => r.Status == "Taken" || r.Status == "Reserved");

        var mostPopularBookTask = _books.Find(_ => true)
            .SortByDescending(b => b.Popularity)
            .Project(b => b.Title)
            .FirstOrDefaultAsync();

        var activeUsersFilter = Builders<ReservationModel>.Filter.Or(
            Builders<ReservationModel>.Filter.And(Builders<ReservationModel>.Filter.Gte(r => r.CreatedAt, from), Builders<ReservationModel>.Filter.Lte(r => r.CreatedAt, to)),
            Builders<ReservationModel>.Filter.And(Builders<ReservationModel>.Filter.Gte(r => r.ReturnedDate, from), Builders<ReservationModel>.Filter.Lte(r => r.ReturnedDate, to))
        );
        var activeUsersTask = _reservations.DistinctAsync(r => r.UserId, activeUsersFilter);

        var newMembersTask = _users.CountDocumentsAsync(u => u.JoinedAt >= from && u.JoinedAt <= to);
        var newBooksTask = _books.CountDocumentsAsync(b => b.CreatedAt >= from && b.CreatedAt <= to);
        var popularCategoryTask = GetMostPopularCategoryName(from, to);

        var delayedFilter = Builders<ReservationModel>.Filter.Or(
            Builders<ReservationModel>.Filter.And(
                Builders<ReservationModel>.Filter.Ne(r => r.ReturnedDate, null),
                Builders<ReservationModel>.Filter.Where(r => r.ReturnedDate > r.EndDate),
                Builders<ReservationModel>.Filter.Gte(r => r.ReturnedDate, from),
                Builders<ReservationModel>.Filter.Lte(r => r.ReturnedDate, to)
            ),
            Builders<ReservationModel>.Filter.And(
                Builders<ReservationModel>.Filter.Eq(r => r.ReturnedDate, null),
                Builders<ReservationModel>.Filter.Lt(r => r.EndDate, DateTime.UtcNow),
                Builders<ReservationModel>.Filter.Gte(r => r.EndDate, from),
                Builders<ReservationModel>.Filter.Lte(r => r.EndDate, to)
            )
        );
        var delayedReturnsTask = _reservations.CountDocumentsAsync(delayedFilter);

        await Task.WhenAll(
            totalUnitsTask, totalMembersTask, booksRentedTask, activeResTask, 
            mostPopularBookTask, newMembersTask, newBooksTask, popularCategoryTask, delayedReturnsTask
        );

        var activeUsersCursor = await activeUsersTask;
        var activeUsersList = await activeUsersCursor.ToListAsync();

        return new StatisticsResponse(
            await totalUnitsTask,
            await totalMembersTask,
            await booksRentedTask,
            (int)Math.Max(0, await totalUnitsTask - await activeResTask),
            await mostPopularBookTask ?? "N/A",
            activeUsersList.Count,
            await newMembersTask,
            await newBooksTask,
            await popularCategoryTask,
            await delayedReturnsTask
        );
    }

    private async Task<string> GetMostPopularCategoryName(DateTime from, DateTime to)
    {
        var pipeline = new BsonDocument[]
        {
            new BsonDocument("$match", new BsonDocument("createdAt", new BsonDocument { { "$gte", from }, { "$lte", to } })),
            new BsonDocument("$lookup", new BsonDocument { { "from", "bookUnits" }, { "localField", "bookUnitId" }, { "foreignField", "_id" }, { "as", "u" } }),
            new BsonDocument("$unwind", "$u"),
            new BsonDocument("$lookup", new BsonDocument { { "from", "books" }, { "localField", "u.bookId" }, { "foreignField", "_id" }, { "as", "b" } }),
            new BsonDocument("$unwind", "$b"),
            new BsonDocument("$unwind", "$b.categoryIds"),
            new BsonDocument("$group", new BsonDocument { { "_id", "$b.categoryIds" }, { "count", new BsonDocument("$sum", 1) } }),
            new BsonDocument("$sort", new BsonDocument("count", -1)),
            new BsonDocument("$limit", 1),
            new BsonDocument("$lookup", new BsonDocument { { "from", "categories" }, { "localField", "_id" }, { "foreignField", "_id" }, { "as", "c" } }),
            new BsonDocument("$unwind", "$c"),
            new BsonDocument("$project", new BsonDocument("n", "$c.name"))
        };

        var result = await _reservations.Aggregate<BsonDocument>(PipelineDefinition<ReservationModel, BsonDocument>.Create(pipeline)).FirstOrDefaultAsync();
        return result != null ? result["n"].AsString : "N/A";
    }
}
