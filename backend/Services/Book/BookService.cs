using LibraryPlus.Models.Book;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Book;
using LibraryPlus.Responses.Book;
using LibraryPlus.Services.Storage;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Book;

public class BookService(
    IMongoDatabase db,
    CategoryService categoryService,
    AuthorService authorService,
    PublisherService publisherService,
    IObjectStorageService storageService)
{
    private readonly IMongoCollection<BookModel> _books = db.GetCollection<BookModel>("books");
    private readonly IMongoCollection<BookUnitModel> _bookUnits = db.GetCollection<BookUnitModel>("bookUnits");
    private readonly IMongoCollection<ReservationModel> _reservations = db.GetCollection<ReservationModel>("reservations");
    private readonly AuthorService _authorService = authorService;
    private readonly PublisherService _publisherService = publisherService;
    private readonly CategoryService _categoryService = categoryService;
    private readonly IObjectStorageService _storageService = storageService;
    private const int PAGE_SIZE = 6;

    public async Task<BookModel> CreateBook(CreateBookRequest request)
    {
        var book = new BookModel
        {
            Title = request.Title,
            Description = request.Description,
            AuthorId = request.AuthorId,
            PublisherId = request.PublisherId,
            Language = request.Language,
            PublicationYear = request.PublicationYear,
            PagesCount = request.PagesCount,
            CategoryIds = request.CategoryIds,
            RepurchasePrice = request.RepurchasePrice,
            OriginalTitle = request.OriginalTitle,
            OriginalLanguage = request.OriginalLanguage,
            OriginalPublicationYear = request.OriginalPublicationYear,
            OriginalPublisherId = request.OriginalPublisherId,
            Popularity = 0,
            CreatedAt = DateTime.UtcNow
        };
        await _books.InsertOneAsync(book);
        return book;
    }

    public async Task<bool> EditBook(string id, UpdateBookRequest request)
    {
        var update = Builders<BookModel>.Update
            .Set(b => b.Title, request.Title)
            .Set(b => b.Description, request.Description)
            .Set(b => b.Language, request.Language)
            .Set(b => b.PublicationYear, request.PublicationYear)
            .Set(b => b.PagesCount, request.PagesCount)
            .Set(b => b.CategoryIds, request.CategoryIds)
            .Set(b => b.RepurchasePrice, request.RepurchasePrice)
            .Set(b => b.AuthorId, request.AuthorId)
            .Set(b => b.PublisherId, request.PublisherId)
            .Set(b => b.OriginalTitle, request.OriginalTitle)
            .Set(b => b.OriginalLanguage, request.OriginalLanguage)
            .Set(b => b.OriginalPublicationYear, request.OriginalPublicationYear)
            .Set(b => b.OriginalPublisherId, request.OriginalPublisherId);

        var result = await _books.UpdateOneAsync(b => b.Id == id, update);
        return result.ModifiedCount == 1;
    }

    private async Task<IQueryable<BookModel>> BuildFilterQuery(
        string? token, string? authorId, string? publisherId, List<string>? categories,
        uint? minYear, uint? maxYear, bool? available)
    {
        var query = _books.AsQueryable()
            .Where(b => b.PublicationYear >= (minYear ?? 0))
            .Where(b => b.PublicationYear <= (maxYear ?? (uint)DateTime.Now.Year));

        if (!string.IsNullOrWhiteSpace(token))
        {
            query = query.Where(b => b.Title.ToLower().Contains(token.ToLower()));
        }

        if (authorId != null) query = query.Where(b => b.AuthorId == authorId);
        if (publisherId != null) query = query.Where(b => b.PublisherId == publisherId);
        if (categories?.Count > 0) query = query.Where(b => b.CategoryIds.Any(c => categories.Contains(c)));

        if (available != null)
        {
            var availableIds = await GetAvailableBookIds();
            query = query.Where(b => availableIds.Contains(b.Id) == available);
        }

        return query;
    }

    private async Task<HashSet<string>> GetAvailableBookIds()
    {
        var takenIds = await _reservations.Find(r => r.ReturnedDate == null).Project(r => r.BookUnitId).ToListAsync();
        var allUnits = await _bookUnits.Find(bu => !takenIds.Contains(bu.Id)).ToListAsync();
        var availableBookIds = new HashSet<string>();

        foreach (var unit in allUnits)
        {
            if (availableBookIds.Contains(unit.BookId)) continue;
            
            var latestReservation = await _reservations.Find(r => r.BookUnitId == unit.Id && r.ReturnedDate != null)
                .SortByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();
            
            var condition = latestReservation?.BookConditionUponReturn?.ToLower() ?? "good";
            if (condition.Contains("good") || condition.Contains("minor"))
            {
                availableBookIds.Add(unit.BookId);
            }
        }
        
        return availableBookIds;
    }

    public async Task<IList<BookCardResponse>> SearchBooks(
        string? token, string? authorId, string? publisherId, List<string>? categories,
        uint? minYear, uint? maxYear, bool? available, int page, string? sort, bool desc)
    {
        var query = await BuildFilterQuery(token, authorId, publisherId, categories, minYear, maxYear, available);
        var sortBy = sort?.ToLower() ?? "title";

        query = (desc, sortBy) switch
        {
            (true, "publicationyear") => query.OrderByDescending(b => b.OriginalPublicationYear ?? b.PublicationYear),
            (false, "publicationyear") => query.OrderBy(b => b.OriginalPublicationYear ?? b.PublicationYear),
            (true, "relevancy") => query.OrderByDescending(b => b.Popularity),
            (false, "relevancy") => query.OrderBy(b => b.Popularity),
            (true, _) => query.OrderByDescending(b => b.Title),
            (false, _) => query.OrderBy(b => b.Title)
        };

        var books = await query.Skip(PAGE_SIZE * (page - 1)).Take(PAGE_SIZE).ToListAsync();
        return await MapToCards(books);
    }

    public async Task<uint> GetPagesCount(string? token, string? authorId, string? publisherId, List<string>? categories, uint? minYear, uint? maxYear, bool? available)
    {
        var query = await BuildFilterQuery(token, authorId, publisherId, categories, minYear, maxYear, available);
        var count = await query.CountAsync();
        return (uint)Math.Ceiling(count / (double)PAGE_SIZE);
    }

    private async Task<IList<BookCardResponse>> MapToCards(List<BookModel> books)
    {
        var authorIds = books.Select(b => b.AuthorId).OfType<string>().Distinct().ToList<string?>();
        var catIds = books.SelectMany(b => b.CategoryIds ?? []).Distinct().ToList<string?>();
        var publisherIds = books.Select(b => b.PublisherId).OfType<string>().Distinct().ToList<string?>();

        var authorsTask = _authorService.GetAuthorsByIds(authorIds);
        var categoriesTask = _categoryService.GetCategoriesByIds(catIds);
        var publishersTask = _publisherService.GetPublishersByIds(publisherIds);

        await Task.WhenAll(authorsTask, categoriesTask, publishersTask);

        var authorMap = authorsTask.Result.ToDictionary(a => a.Id, a => a.Name);
        var catMap = categoriesTask.Result.ToDictionary(c => c.Id, c => c.Name);
        var pubMap = publishersTask.Result.ToDictionary(p => p.Id, p => p.Name);

        return await Task.WhenAll([.. books.Select(async b => new BookCardResponse(
            b.Id, b.Title, b.Language,
            b.AuthorId != null && authorMap.TryGetValue(b.AuthorId, out var n) ? n : null,
            b.CategoryIds?.Count > 0 && catMap.TryGetValue(b.CategoryIds[0], out var c) ? c : null,
            b.PublisherId != null && pubMap.TryGetValue(b.PublisherId, out var p) ? p : null,
            b.PublicationYear, b.OriginalPublicationYear,
            _storageService.GetPublicUrl(b.CoverURI),
            (await GetAvailableBookUnitForBook(b.Id)) != null
        ))]);
    }

    public async Task<BookModel?> GetBookById(string id) => await _books.Find(b => b.Id == id).FirstOrDefaultAsync();
    public async Task DeleteBook(string id) => await _books.DeleteOneAsync(b => b.Id == id);
    public async Task<BookUnitModel> AddBookUnit(string bookId) { var bu = new BookUnitModel { BookId = bookId }; await _bookUnits.InsertOneAsync(bu); return bu; }
    public async Task DeleteBookUnit(string id) => await _bookUnits.DeleteOneAsync(bu => bu.Id == id);
    public async Task<IList<BookUnitModel>> GetBookUnitsForBook(string bookId) => await _bookUnits.Find(bu => bu.BookId == bookId).ToListAsync();
    public async Task<BookUnitModel?> GetBookUnitById(string id) => await _bookUnits.Find(bu => bu.Id == id).FirstOrDefaultAsync();

    public async Task<BookPreviewResponse?> GetBookPreviewById(string id)
    {
        var book = await GetBookById(id);
        if (book == null) return null;

        var authorTask = book.AuthorId != null ? _authorService.GetAuthor(book.AuthorId) : Task.FromResult<AuthorModel?>(null);
        var pubTask = book.PublisherId != null ? _publisherService.GetPublisher(book.PublisherId) : Task.FromResult<PublisherModel?>(null);
        var origPubTask = book.OriginalPublisherId != null ? _publisherService.GetPublisher(book.OriginalPublisherId) : Task.FromResult<PublisherModel?>(null);
        var catsTask = _categoryService.GetCategoriesByIds(book.CategoryIds);
        var unitTask = GetAvailableBookUnitForBook(book.Id);

        await Task.WhenAll(authorTask, pubTask, origPubTask, catsTask, unitTask);

        return new BookPreviewResponse(
            book.Id, book.Title, book.Description, await authorTask, await pubTask, book.Language,
            book.PublicationYear, book.PagesCount, await catsTask, book.OriginalTitle, book.OriginalLanguage,
            book.OriginalPublicationYear, await origPubTask, _storageService.GetPublicUrl(book.CoverURI), (await unitTask) != null
        );
    }

    public async Task<bool> SetCoverURI(string bookId, string? uri)
    {
        var res = await _books.UpdateOneAsync(b => b.Id == bookId, Builders<BookModel>.Update.Set(b => b.CoverURI, uri));
        return res.ModifiedCount == 1;
    }

    public async Task IncreasePopularity(BookModel book) => await _books.UpdateOneAsync(b => b.Id == book.Id, Builders<BookModel>.Update.Inc(b => b.Popularity, (uint)1));

    public async Task<BookUnitModel?> GetAvailableBookUnitForBook(string bookId)
    {
        var takenIds = await _reservations.Find(r => r.ReturnedDate == null).Project(r => r.BookUnitId).ToListAsync();
        var availableUnits = await _bookUnits.Find(bu => bu.BookId == bookId && !takenIds.Contains(bu.Id)).ToListAsync();
        
        foreach (var unit in availableUnits)
        {
            var latestReservation = await _reservations.Find(r => r.BookUnitId == unit.Id && r.ReturnedDate != null)
                .SortByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();
            
            var condition = latestReservation?.BookConditionUponReturn?.ToLower() ?? "good";
            if (condition.Contains("good") || condition.Contains("minor"))
            {
                return unit;
            }
        }
        
        return null;
    }

    public async Task<IList<BookCardResponse>> GetBooksByAuthor(string id, string? excludedId)
    {
        var books = await _books.Find(b => b.AuthorId == id && b.Id != excludedId).SortByDescending(b => b.Popularity).Limit(12).ToListAsync();
        return await MapToCards(books);
    }

    public async Task<IList<BookCardResponse>> GetPopularBooks()
    {
        var books = await _books.Find(_ => true).SortByDescending(b => b.Popularity).Limit(12).ToListAsync();
        return await MapToCards(books);
    }

    public async Task<IList<BookCardResponse>> GetMultipleByIds(IList<string> ids)
    {
        var books = await _books.Find(b => ids.Contains(b.Id)).ToListAsync();
        return await MapToCards(books);
    }
}
