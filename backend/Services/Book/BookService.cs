using LibraryPlus.Models.Book;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Book;
using LibraryPlus.Responses.Book;
using LibraryPlus.Services.Storage;
using LibraryPlus.Data;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Book;

public class BookService(
    ApplicationDbContext db,
    CategoryService categoryService,
    AuthorService authorService,
    PublisherService publisherService,
    IObjectStorageService storageService)
{
    private readonly ApplicationDbContext _db = db;
    private readonly AuthorService _authorService = authorService;
    private readonly PublisherService _publisherService = publisherService;
    private readonly CategoryService _categoryService = categoryService;
    private readonly IObjectStorageService _storageService = storageService;
    private const int PAGE_SIZE = 12;

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
        _db.Books.Add(book);
        await _db.SaveChangesAsync();
        return book;
    }

    public async Task<bool> EditBook(string id, UpdateBookRequest request)
    {
        var book = await _db.Books.FirstOrDefaultAsync(b => b.Id == id);
        if (book == null) return false;

        book.Title = request.Title;
        book.Description = request.Description;
        book.Language = request.Language;
        book.PublicationYear = request.PublicationYear;
        book.PagesCount = request.PagesCount;
        book.CategoryIds = request.CategoryIds;
        book.RepurchasePrice = request.RepurchasePrice;
        book.AuthorId = request.AuthorId;
        book.PublisherId = request.PublisherId;
        book.OriginalTitle = request.OriginalTitle;
        book.OriginalLanguage = request.OriginalLanguage;
        book.OriginalPublicationYear = request.OriginalPublicationYear;
        book.OriginalPublisherId = request.OriginalPublisherId;

        await _db.SaveChangesAsync();
        return true;
    }

    private IQueryable<BookModel> BuildFilterQuery(
        string? token, string? authorId, string? publisherId, List<string>? categories,
        int? minYear, int? maxYear)
    {
        var query = _db.Books.AsQueryable()
            .Where(b => b.PublicationYear >= (minYear ?? 0))
            .Where(b => b.PublicationYear <= (maxYear ?? DateTime.Now.Year));

        if (!string.IsNullOrWhiteSpace(token))
        {
            query = query.Where(b => EF.Functions.ILike(b.Title, $"%{token}%"));
        }

        if (authorId != null) query = query.Where(b => b.AuthorId == authorId);
        if (publisherId != null) query = query.Where(b => b.PublisherId == publisherId);
        
        if (categories?.Count > 0)
        {
            query = query.Where(b => b.CategoryIds.Any(c => categories.Contains(c)));
        }

        return query;
    }

    public async Task<IList<BookCardResponse>> SearchBooks(
        string? token, string? authorId, string? publisherId, List<string>? categories,
        int? minYear, int? maxYear, bool? available, int page, string? sort, bool desc)
    {
        var query = BuildFilterQuery(token, authorId, publisherId, categories, minYear, maxYear);
        
        if (available != null)
        {
            var availableIds = await GetAvailableBookIds();
            if (available.Value)
            {
                query = query.Where(b => availableIds.Contains(b.Id));
            }
            else
            {
                query = query.Where(b => !availableIds.Contains(b.Id));
            }
        }

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

    public async Task<int> GetPagesCount(string? token, string? authorId, string? publisherId, List<string>? categories, int? minYear, int? maxYear, bool? available)
    {
        var query = BuildFilterQuery(token, authorId, publisherId, categories, minYear, maxYear);
        if (available != null)
        {
            var availableIds = await GetAvailableBookIds();
             if (available.Value)
            {
                query = query.Where(b => availableIds.Contains(b.Id));
            }
            else
            {
                query = query.Where(b => !availableIds.Contains(b.Id));
            }
        }
        var count = await query.CountAsync();
        return (int)Math.Ceiling(count / (double)PAGE_SIZE);
    }

    private async Task<HashSet<string>> GetAvailableBookIds()
    {
        var takenIds = await _db.Reservations.Where(r => r.ReturnedDate == null).Select(r => r.BookUnitId).ToListAsync();
        var allUnits = await _db.BookUnits.Where(bu => !takenIds.Contains(bu.Id) && !bu.IsArchived).ToListAsync();
        var availableBookIds = new HashSet<string>();

        foreach (var unit in allUnits)
        {
            if (availableBookIds.Contains(unit.BookId)) continue;
            
            var latestReservation = await _db.Reservations
                .Where(r => r.BookUnitId == unit.Id && r.ReturnedDate != null)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();
            
            var condition = latestReservation?.BookConditionUponReturn?.ToLower() ?? "good";
            if (condition.Contains("good") || condition.Contains("minor"))
            {
                availableBookIds.Add(unit.BookId);
            }
        }
        
        return availableBookIds;
    }

    private async Task<IList<BookCardResponse>> MapToCards(List<BookModel> books)
    {
        var authorIds = books.Select(b => b.AuthorId).OfType<string>().Distinct().ToList();
        var catIds = books.SelectMany(b => b.CategoryIds ?? []).Distinct().ToList();
        var publisherIds = books.Select(b => b.PublisherId).OfType<string>().Distinct().ToList();

        var authors = await _authorService.GetAuthorsByIds(authorIds.Cast<string?>().ToList());
        var categories = await _categoryService.GetCategoriesByIds(catIds);
        var publishers = await _publisherService.GetPublishersByIds(publisherIds.Cast<string?>().ToList());

        var authorMap = authors.ToDictionary(a => a.Id, a => a.Name);
        var catMap = categories.ToDictionary(c => c.Id, c => c.Name);
        var pubMap = publishers.ToDictionary(p => p.Id, p => p.Name);

        var result = new List<BookCardResponse>();
        foreach (var b in books)
        {
            var availableUnit = await GetAvailableBookUnitForBook(b.Id);
            result.Add(new BookCardResponse(
                b.Id, b.Title, b.Language,
                b.AuthorId != null && authorMap.TryGetValue(b.AuthorId, out var n) ? n : null,
                b.CategoryIds?.Count > 0 && catMap.TryGetValue(b.CategoryIds[0], out var c) ? c : null,
                b.PublisherId != null && pubMap.TryGetValue(b.PublisherId, out var p) ? p : null,
                b.PublicationYear, b.OriginalPublicationYear,
                _storageService.GetPublicUrl(b.CoverURI),
                availableUnit != null
            ));
        }
        return result;
    }

    public async Task<BookModel?> GetBookById(string id) => await _db.Books.FirstOrDefaultAsync(b => b.Id == id);
    
    public async Task DeleteBook(string id)
    {
        var book = await _db.Books.FirstOrDefaultAsync(b => b.Id == id);
        if (book != null)
        {
            _db.Books.Remove(book);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<BookUnitModel> AddBookUnit(string bookId)
    {
        var bu = new BookUnitModel { BookId = bookId };
        _db.BookUnits.Add(bu);
        await _db.SaveChangesAsync();
        return bu;
    }

    public async Task DeleteBookUnit(string id)
    {
        var bu = await _db.BookUnits.FirstOrDefaultAsync(bu => bu.Id == id);
        if (bu != null)
        {
            _db.BookUnits.Remove(bu);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IList<BookUnitModel>> GetBookUnitsForBook(string bookId) => await _db.BookUnits.Where(bu => bu.BookId == bookId).ToListAsync();
    
    public async Task<BookUnitModel?> GetBookUnitById(string id) => await _db.BookUnits.FirstOrDefaultAsync(bu => bu.Id == id);

    public async Task<BookPreviewResponse?> GetBookPreviewById(string id)
    {
        var book = await GetBookById(id);
        if (book == null) return null;

        var author = book.AuthorId != null ? await _authorService.GetAuthor(book.AuthorId) : null;
        var pub = book.PublisherId != null ? await _publisherService.GetPublisher(book.PublisherId) : null;
        var origPub = book.OriginalPublisherId != null ? await _publisherService.GetPublisher(book.OriginalPublisherId) : null;
        var cats = await _categoryService.GetCategoriesByIds(book.CategoryIds);
        var unit = await GetAvailableBookUnitForBook(book.Id);

        return new BookPreviewResponse(
            book.Id, book.Title, book.Description, author, pub, book.Language,
            book.PublicationYear, book.PagesCount, cats, book.OriginalTitle, book.OriginalLanguage,
            book.OriginalPublicationYear, origPub, _storageService.GetPublicUrl(book.CoverURI), unit != null
        );
    }

    public async Task<bool> SetCoverURI(string bookId, string? uri)
    {
        var book = await _db.Books.FirstOrDefaultAsync(b => b.Id == bookId);
        if (book == null) return false;
        book.CoverURI = uri;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task IncreasePopularity(BookModel book)
    {
        var b = await _db.Books.FirstOrDefaultAsync(x => x.Id == book.Id);
        if (b != null)
        {
            b.Popularity++;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<BookUnitModel?> GetAvailableBookUnitForBook(string bookId)
    {
        var takenIds = await _db.Reservations.Where(r => r.ReturnedDate == null).Select(r => r.BookUnitId).ToListAsync();
        var availableUnits = await _db.BookUnits.Where(bu => bu.BookId == bookId && !takenIds.Contains(bu.Id) && !bu.IsArchived).ToListAsync();
        
        foreach (var unit in availableUnits)
        {
            var latestReservation = await _db.Reservations
                .Where(r => r.BookUnitId == unit.Id && r.ReturnedDate != null)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();
            
            var condition = latestReservation?.BookConditionUponReturn?.ToLower() ?? "good";
            if (condition.Contains("good") || condition.Contains("minor"))
            {
                return unit;
            }
        }
        
        return null;
    }

    public async Task<bool> ArchiveBookUnit(string unitId)
    {
        var activeReservation = await _db.Reservations.FirstOrDefaultAsync(r => r.BookUnitId == unitId && r.ReturnedDate == null);
        if (activeReservation != null) return false;
        
        var bu = await _db.BookUnits.FirstOrDefaultAsync(bu => bu.Id == unitId);
        if (bu == null) return false;
        
        bu.IsArchived = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnarchiveBookUnit(string unitId)
    {
        var bu = await _db.BookUnits.FirstOrDefaultAsync(bu => bu.Id == unitId);
        if (bu == null) return false;
        
        bu.IsArchived = false;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IList<BookCardResponse>> GetBooksByAuthor(string id, string? excludedId)
    {
        var books = await _db.Books
            .Where(b => b.AuthorId == id && b.Id != excludedId)
            .OrderByDescending(b => b.Popularity)
            .Take(12)
            .ToListAsync();
        return await MapToCards(books);
    }

    public async Task<IList<BookCardResponse>> GetPopularBooks()
    {
        var books = await _db.Books
            .OrderByDescending(b => b.Popularity)
            .Take(12)
            .ToListAsync();
        return await MapToCards(books);
    }

    public async Task<IList<BookCardResponse>> GetMultipleByIds(IList<string> ids)
    {
        var books = await _db.Books.Where(b => ids.Contains(b.Id)).ToListAsync();
        return await MapToCards(books);
    }
}