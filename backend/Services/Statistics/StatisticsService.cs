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
        var totalUnitsCount = await _bookUnits.CountDocumentsAsync(_ => true);
        var totalMembersCount = await _users.CountDocumentsAsync(u => !u.IsDeleted);
        var booksRentedCount = await _reservations.CountDocumentsAsync(r => r.Status == "Taken");
        var activeReservationsCount = await _reservations.CountDocumentsAsync(r => r.Status == "Taken" || r.Status == "Reserved");
        var booksInStock = (int)Math.Max(0, totalUnitsCount - activeReservationsCount);
        var mostPopularBook = await _books.Find(_ => true)
            .SortByDescending(b => b.Popularity)
            .Project(b => b.Title)
            .FirstOrDefaultAsync() ?? "N/A";
        var from = request.From.ToUniversalTime();
        var to = request.To.ToUniversalTime();
        var activeUsersFilter = Builders<ReservationModel>.Filter.Or(
            Builders<ReservationModel>.Filter.And(
                Builders<ReservationModel>.Filter.Gte(r => r.CreatedAt, from),
                Builders<ReservationModel>.Filter.Lte(r => r.CreatedAt, to)
            ),
            Builders<ReservationModel>.Filter.And(
                Builders<ReservationModel>.Filter.Gte(r => r.ReturnedDate, from),
                Builders<ReservationModel>.Filter.Lte(r => r.ReturnedDate, to)
            )
        );
        var activeUsersInPeriod = await _reservations.Distinct(r => r.UserId, activeUsersFilter).ToListAsync();
        var newMembersCount = await _users.CountDocumentsAsync(u => u.JoinedAt >= from && u.JoinedAt <= to);
        var newBooksCount = await _books.CountDocumentsAsync(b => b.CreatedAt >= from && b.CreatedAt <= to);
        var mostPopularCategoryName = await GetMostPopularCategory(from, to);
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
        var delayedReturnsCount = await _reservations.CountDocumentsAsync(delayedFilter);

        return new StatisticsResponse(
            totalUnitsCount,
            totalMembersCount,
            booksRentedCount,
            booksInStock,
            mostPopularBook,
            activeUsersInPeriod.Count,
            newMembersCount,
            newBooksCount,
            mostPopularCategoryName,
            delayedReturnsCount
        );
    }

    private async Task<string> GetMostPopularCategory(DateTime from, DateTime to)
    {
        var pipeline = new BsonDocument[]
        {
            new BsonDocument("$match", new BsonDocument
            {
                { "createdAt", new BsonDocument { { "$gte", from }, { "$lte", to } } }
            }),
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "bookUnits" },
                { "localField", "bookUnitId" },
                { "foreignField", "_id" },
                { "as", "unit" }
            }),
            new BsonDocument("$unwind", "$unit"),
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "books" },
                { "localField", "unit.bookId" },
                { "foreignField", "_id" },
                { "as", "book" }
            }),
            new BsonDocument("$unwind", "$book"),
            new BsonDocument("$unwind", "$book.categoryIds"),
            new BsonDocument("$group", new BsonDocument
            {
                { "_id", "$book.categoryIds" },
                { "count", new BsonDocument("$sum", 1) }
            }),
            new BsonDocument("$sort", new BsonDocument("count", -1)),
            new BsonDocument("$limit", 1),
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "categories" },
                { "localField", "_id" },
                { "foreignField", "_id" },
                { "as", "category" }
            }),
            new BsonDocument("$unwind", "$category"),
            new BsonDocument("$project", new BsonDocument("name", "$category.name"))
        };

        var result = await _reservations.Aggregate<BsonDocument>(PipelineDefinition<ReservationModel, BsonDocument>.Create(pipeline)).FirstOrDefaultAsync();
        return result != null ? result["name"].AsString : "N/A";
    }
}
