using LibraryPlus.Models.Book;
using LibraryPlus.Models.User;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Reservation;
using LibraryPlus.Requests.User;
using LibraryPlus.Services.Book;
using LibraryPlus.Services.Mail;
using LibraryPlus.Services.User;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Reservation;

public class ReservationService(IMongoDatabase db, BookService bookService, NotificationService notificationService, IMailService mailService)
{
    private readonly IMongoCollection<ReservationModel> _reservations = db.GetCollection<ReservationModel>("reservations");
    private readonly IMongoCollection<UserModel> _users = db.GetCollection<UserModel>("users");
    private readonly IMongoCollection<BookModel> _books = db.GetCollection<BookModel>("books");
    private readonly IMongoCollection<BookUnitModel> _bookUnits = db.GetCollection<BookUnitModel>("bookUnits");
    private readonly BookService _bookService = bookService;
    private readonly NotificationService _notificationService = notificationService;
    private readonly IMailService _mailService = mailService;
    public const int USER_PAGE_SIZE = 3;
    public const int ADMIN_PAGE_SIZE = 6;

    public async Task<(ReservationModel? Reservation, string? Error)> CreateReservation(string userId, CreateReservationRequest request)
    {
        var totalDays = (request.EndDate - request.StartDate).TotalDays;
        if (totalDays < 14 || totalDays > 30) return (null, "Reservation period must be between 14 and 30 days.");

        var bookUnitsForBook = await _bookUnits.Find(bu => bu.BookId == request.BookId).Project(bu => bu.Id).ToListAsync();
        var existingReservation = await _reservations.Find(r => r.UserId == userId && r.ReturnedDate == null && bookUnitsForBook.Contains(r.BookUnitId)).FirstOrDefaultAsync();
        if (existingReservation != null) return (null, "You already have an active reservation for this book.");

        var bookUnit = await _bookService.GetAvailableBookUnitForBook(request.BookId);
        if (bookUnit == null) return (null, "No available copies of this book at the moment.");

        var book = await _bookService.GetBookById(request.BookId);
        if (book == null) return (null, "Book not found.");

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
        return (reservation, null);
    }

    public async Task<IList<ReservationModel>> GetUserReservations(string userId, int page, string? status = null, string? searchToken = null)
    {
        var pipeline = CreateFilteredPipeline(status, searchToken, userId);

        pipeline.Add(new BsonDocument("$sort", new BsonDocument("createdAt", -1)));
        pipeline.Add(new BsonDocument("$skip", USER_PAGE_SIZE * (page - 1)));
        pipeline.Add(new BsonDocument("$limit", USER_PAGE_SIZE));

        return await _reservations.Aggregate<ReservationModel>(PipelineDefinition<ReservationModel, ReservationModel>.Create(pipeline)).ToListAsync();
    }

    public async Task<int> GetUserReservationsPageCount(string userId, string? status = null, string? searchToken = null)
    {
        var pipeline = CreateFilteredPipeline(status, searchToken, userId);
        pipeline.Add(new BsonDocument("$count", "total"));

        var result = await _reservations.Aggregate<BsonDocument>(PipelineDefinition<ReservationModel, BsonDocument>.Create(pipeline)).FirstOrDefaultAsync();
        if (result == null) return 1;

        return (int)Math.Ceiling(result["total"].AsInt32 / (double)USER_PAGE_SIZE);
    }

    public async Task<bool> HandleTaken(string id)
    {
        var result = await _reservations.UpdateOneAsync(
            r => r.Id == id,
            Builders<ReservationModel>.Update.Set(r => r.Status, "Taken")
        );
        if (result.ModifiedCount == 1)
        {
            await SendStatusNotification(id, "Taken");
            return true;
        }
        return false;
    }

    public async Task<bool> HandleReturned(string id, HandleReturnRequest request)
    {
        var update = Builders<ReservationModel>.Update
            .Set(r => r.Status, "Returned")
            .Set(r => r.ReturnedDate, DateTime.UtcNow)
            .Set(r => r.BookConditionUponReturn, request.BookConditionUponReturn)
            .Set(r => r.AdditionalNote, request.AdditionalNote);

        var result = await _reservations.UpdateOneAsync(r => r.Id == id, update);
        if (result.ModifiedCount == 1)
        {
            await SendStatusNotification(id, "Returned");
            return true;
        }
        return false;
    }

    public async Task<bool> UpdateStatus(string id, string status)
    {
        var result = await _reservations.UpdateOneAsync(
            r => r.Id == id,
            Builders<ReservationModel>.Update.Set(r => r.Status, status)
        );
        if (result.ModifiedCount == 1)
        {
            await SendStatusNotification(id, status);
            return true;
        }
        return false;
    }

    public async Task<IList<ReservationModel>> GetAllReservations(int page, string? status = null, string? searchToken = null)
    {
        var pipeline = CreateFilteredPipeline(status, searchToken);

        pipeline.Add(new BsonDocument("$sort", new BsonDocument("createdAt", -1)));
        pipeline.Add(new BsonDocument("$skip", ADMIN_PAGE_SIZE * (page - 1)));
        pipeline.Add(new BsonDocument("$limit", ADMIN_PAGE_SIZE));

        return await _reservations.Aggregate<ReservationModel>(PipelineDefinition<ReservationModel, ReservationModel>.Create(pipeline)).ToListAsync();
    }

    public async Task<int> GetAllReservationsPageCount(string? status = null, string? searchToken = null)
    {
        var pipeline = CreateFilteredPipeline(status, searchToken);
        pipeline.Add(new BsonDocument("$count", "total"));

        var result = await _reservations.Aggregate<BsonDocument>(PipelineDefinition<ReservationModel, BsonDocument>.Create(pipeline)).FirstOrDefaultAsync();
        if (result == null) return 1;

        return (int)Math.Ceiling(result["total"].AsInt32 / (double)ADMIN_PAGE_SIZE);
    }

    public async Task<IList<ReservationModel>> GetReservationsByBookUnit(string bookUnitId)
    {
        return await _reservations.Find(r => r.BookUnitId == bookUnitId).SortByDescending(r => r.CreatedAt).ToListAsync();
    }

    private List<BsonDocument> CreateFilteredPipeline(string? status, string? searchToken, string? userId = null)
    {
        var pipeline = new List<BsonDocument>();

        if (!string.IsNullOrWhiteSpace(userId))
        {
            pipeline.Add(new BsonDocument("$match", new BsonDocument("userId", ObjectId.Parse(userId))));
        }

        if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
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

    public async Task<bool> CancelReservationByUser(string reservationId, string userId)
    {
        var reservation = await _reservations.Find(r => r.Id == reservationId && r.UserId == userId).FirstOrDefaultAsync();
        if (reservation == null) return false;
        if (reservation.Status != "Reserved") return false;

        var result = await _reservations.UpdateOneAsync(
            r => r.Id == reservationId,
            Builders<ReservationModel>.Update
                .Set(r => r.Status, "Returned")
                .Set(r => r.ReturnedDate, DateTime.UtcNow)
        );

        return result.ModifiedCount > 0;
    }

    private async Task SendStatusNotification(string reservationId, string newStatus)
    {
        var reservation = await _reservations.Find(r => r.Id == reservationId).FirstOrDefaultAsync();
        if (reservation == null) return;

        var user = await _users.Find(u => u.Id == reservation.UserId).FirstOrDefaultAsync();
        if (user == null) return;

        var bookUnit = await _bookUnits.Find(bu => bu.Id == reservation.BookUnitId).FirstOrDefaultAsync();
        var book = bookUnit != null ? await _books.Find(b => b.Id == bookUnit.BookId).FirstOrDefaultAsync() : null;
        var bookTitle = book?.Title ?? "Unknown";

        var subject = $"Reservation status updated: {newStatus}";
        var text = $"Your reservation for \"{bookTitle}\" has been updated to status: {newStatus}.";

        await _notificationService.SendOneUserNotification(reservation.UserId, new NotificationRequest(subject, text));
        _ = _mailService.SendMail(user.Email, subject, text);
    }
}
