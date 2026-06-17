using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Book;
using LibraryPlus.Responses.Book;

using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Book;

public class BookService(
    LibraryPlusContext context,
    CategoryService categoryService,
    AuthorService authorService,
    PublisherService publisherService,
    ReviewService reviewService)
{
    private readonly LibraryPlusContext _context = context;
    private readonly AuthorService _authorService = authorService;
    private readonly PublisherService _publisherService = publisherService;
    private readonly CategoryService _categoryService = categoryService;
    private readonly ReviewService _reviewService = reviewService;
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
            Categories = await _context.Categories.Where(c => request.CategoryIds.Contains(c.Id)).ToListAsync(),
            RepurchasePrice = request.RepurchasePrice,
            OriginalTitle = request.OriginalTitle,
            OriginalLanguage = request.OriginalLanguage,
            OriginalPublicationYear = request.OriginalPublicationYear,
            OriginalPublisherId = request.OriginalPublisherId,
            Popularity = 0,
            CoverImage = null,
            CoverImageContentType = null,
            CreatedAt = DateTime.UtcNow
        };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return book;
    }

    public async Task<bool> EditBook(int id, UpdateBookRequest request)
    {
        var book = await _context.Books.Include(b => b.Categories).FirstOrDefaultAsync(b => b.Id == id);
        if (book == null)
        {
            return false;
        }

        book.Title = request.Title;
        book.Description = request.Description;
        book.Language = request.Language;
        book.PublicationYear = request.PublicationYear;
        book.PagesCount = request.PagesCount;

        book.Categories.Clear();
        var newCategories = await _context.Categories.Where(c => request.CategoryIds.Contains(c.Id)).ToListAsync();
        foreach (var c in newCategories) book.Categories.Add(c);

        book.RepurchasePrice = request.RepurchasePrice;
        book.AuthorId = request.AuthorId;
        book.PublisherId = request.PublisherId;

        if (!string.IsNullOrWhiteSpace(request.OriginalTitle))
        {
            book.OriginalTitle = request.OriginalTitle;
        }

        if (!string.IsNullOrWhiteSpace(request.OriginalLanguage))
        {
            book.OriginalLanguage = request.OriginalLanguage;
        }

        if (request.OriginalPublicationYear.HasValue && request.OriginalPublicationYear > 0)
        {
            book.OriginalPublicationYear = request.OriginalPublicationYear;
        }

        if (request.OriginalPublisherId.HasValue && request.OriginalPublisherId > 0)
        {
            book.OriginalPublisherId = request.OriginalPublisherId;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    private string? GetImageUrl(int bookId, byte[]? coverImage)
    {
        if (coverImage == null)
        {
            return null;
        }
        return $"/api/media/books/{bookId}/cover";
    }

    private async Task<IQueryable<BookModel>> BuildFilterQuery(
        string? token, int? authorId, int? publisherId, List<int>? categories,
        int? minYear, int? maxYear, bool? available, bool includeInactive)
    {
        var query = _context.Books.AsQueryable()
            .Where(b => b.PublicationYear >= (minYear ?? 0))
            .Where(b => b.PublicationYear <= (maxYear ?? DateTime.Now.Year));

        if (!includeInactive)
        {
            query = query.Where(b => b.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(token))
        {
            query = query.Where(b => EF.Functions.ILike(b.Title, $"%{token}%"));
        }

        if (authorId != null)
        {
            query = query.Where(b => b.AuthorId == authorId);
        }
        if (publisherId != null)
        {
            query = query.Where(b => b.PublisherId == publisherId);
        }
        if (categories?.Count > 0)
        {
            query = query.Where(b => b.Categories.Any(c => categories.Contains(c.Id)));
        }

        if (available != null)
        {
            var availableIds = await GetAvailableBookIds();
            if (available == true)
            {
                query = query.Where(b => availableIds.Contains(b.Id));
            }
            else
                query = query.Where(b => !availableIds.Contains(b.Id));
        }

        return query;
    }

    private async Task<HashSet<int>> GetAvailableBookIds()
    {
        var takenIds = await _context.Reservations.Where(r => r.ReturnedDate == null && r.Status != "Canceled").Select(r => r.BookUnitId).ToListAsync();
        var allUnits = await _context.BookUnits.Where(bu => !takenIds.Contains(bu.Id) && !bu.IsArchived).ToListAsync();
        var availableBookIds = new HashSet<int>();

        foreach (var unit in allUnits)
        {
            if (availableBookIds.Contains(unit.BookId))
            {
                continue;
            }

            var latestReservation = await _context.Reservations
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

    public async Task<IList<BookCardResponse>> SearchBooks(
        string? token, int? authorId, int? publisherId, List<int>? categories,
        int? minYear, int? maxYear, bool? available, int page, string? sort, bool desc, bool includeInactive)
    {
        var query = await BuildFilterQuery(token, authorId, publisherId, categories, minYear, maxYear, available, includeInactive);
        var sortBy = sort?.ToLower() ?? "title";

        query = (desc, sortBy) switch
        {
            (true, "publicationyear") => query.OrderByDescending(b => b.OriginalPublicationYear ?? b.PublicationYear),
            (false, "publicationyear") => query.OrderBy(b => b.OriginalPublicationYear ?? b.PublicationYear),
            (true, "relevancy") => query.OrderByDescending(b => b.Popularity),
            (false, "relevancy") => query.OrderBy(b => b.Popularity),
            (true, "rating") => query.OrderByDescending(b => _context.Reviews.Where(r => r.BookId == b.Id).Average(r => (double?)r.Rating) ?? 0),
            (false, "rating") => query.OrderBy(b => _context.Reviews.Where(r => r.BookId == b.Id).Average(r => (double?)r.Rating) ?? 0),
            (true, _) => query.OrderByDescending(b => b.Title),
            (false, _) => query.OrderBy(b => b.Title)
        };

        var books = await query.Include(b => b.Categories).Skip(PAGE_SIZE * (page - 1)).Take(PAGE_SIZE).ToListAsync();
        return await MapToCards(books);
    }

    public async Task<int> GetPagesCount(string? token, int? authorId, int? publisherId, List<int>? categories, int? minYear, int? maxYear, bool? available, bool includeInactive)
    {
        var query = await BuildFilterQuery(token, authorId, publisherId, categories, minYear, maxYear, available, includeInactive);
        var count = await query.CountAsync();
        return (int)Math.Ceiling(count / (double)PAGE_SIZE);
    }

    private async Task<IList<BookCardResponse>> MapToCards(List<BookModel> books)
    {
        var authorIds = books.Select(b => b.AuthorId).OfType<int>().Distinct().ToList();
        var catIds = books.SelectMany(b => b.Categories.Select(c => c.Id)).Distinct().ToList();
        var publisherIds = books.Select(b => b.PublisherId).OfType<int>().Distinct().ToList();
        var bookIds = books.Select(b => b.Id).ToList();

        var authors = await _authorService.GetAuthorsByIds(authorIds);
        var categories = await _categoryService.GetCategoriesByIds(catIds);
        var publishers = await _publisherService.GetPublishersByIds(publisherIds);
        var ratings = await _reviewService.GetBulkBookRatings(bookIds);

        var authorMap = authors.ToDictionary(a => a.Id, a => a.Name);
        var catMap = categories.ToDictionary(c => c.Id, c => c.Name);
        var pubMap = publishers.ToDictionary(p => p.Id, p => p.Name);

        var results = new List<BookCardResponse>();
        foreach (var b in books)
        {
            var isAvailable = (await GetAvailableBookUnitForBook(b.Id)) != null;
            ratings.TryGetValue(b.Id, out var rating);
            results.Add(new BookCardResponse(
                b.Id, b.Title, b.Language,
                b.AuthorId != null && authorMap.TryGetValue(b.AuthorId.Value, out var n) ? n : null,
                b.Categories.Count > 0 ? b.Categories.First().Name : null,
                b.PublisherId != null && pubMap.TryGetValue(b.PublisherId.Value, out var p) ? p : null,
                b.PublicationYear, b.OriginalPublicationYear,
                GetImageUrl(b.Id, b.CoverImage),
                isAvailable,
                rating?.AverageRating ?? 0,
                rating?.ReviewCount ?? 0
            ));
        }
        return results;
    }

    public async Task<BookModel?> GetBookById(int id) => await _context.Books.Include(b => b.Categories).FirstOrDefaultAsync(b => b.Id == id);
    public async Task DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book != null)
        {
            book.IsActive = false;
            await _context.SaveChangesAsync();
        }
    }
    public async Task<BookUnitModel> AddBookUnit(int bookId) 
    { 
        var bu = new BookUnitModel { BookId = bookId }; 
        _context.BookUnits.Add(bu); 
        await _context.SaveChangesAsync();
        return bu; 
    }
    public async Task DeleteBookUnit(int id)
    {
        var bu = await _context.BookUnits.FindAsync(id);
        if (bu != null)
        {
            _context.BookUnits.Remove(bu);
            await _context.SaveChangesAsync();
        }
    }
    public async Task<IList<BookUnitModel>> GetBookUnitsForBook(int bookId) => await _context.BookUnits.Where(bu => bu.BookId == bookId).ToListAsync();
    public async Task<BookUnitModel?> GetBookUnitById(int id) => await _context.BookUnits.FirstOrDefaultAsync(bu => bu.Id == id);

    public async Task<BookPreviewResponse?> GetBookPreviewById(int id)
    {
        var book = await GetBookById(id);
        if (book == null)
        {
            return null;
        }

        var author = book.AuthorId != null ? await _authorService.GetAuthor(book.AuthorId.Value) : null;
        var pub = book.PublisherId != null ? await _publisherService.GetPublisher(book.PublisherId.Value) : null;
        var origPub = book.OriginalPublisherId != null ? await _publisherService.GetPublisher(book.OriginalPublisherId.Value) : null;
        var cats = book.Categories.ToList();
        var unit = await GetAvailableBookUnitForBook(book.Id);
        var rating = await _reviewService.GetBookRatingSummary(book.Id);

        return new BookPreviewResponse(
            book.Id, book.Title, book.Description, author, pub, book.Language,
            book.PublicationYear, book.PagesCount, cats, book.OriginalTitle, book.OriginalLanguage,
            book.OriginalPublicationYear, origPub, GetImageUrl(book.Id, book.CoverImage), unit != null,
            rating.AverageRating, rating.ReviewCount, book.RepurchasePrice
        );
    }

    public async Task<bool> SetCoverImageId(int id, byte[]? coverImage, string? contentType)
    {
        var book = await _context.Books.FindAsync(id);
        if (book != null)
        {
            book.CoverImage = coverImage;
            book.CoverImageContentType = contentType;
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task IncreasePopularity(BookModel book)
    {
        var b = await _context.Books.FindAsync(book.Id);
        if (b != null)
        {
            b.Popularity++;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<BookUnitModel?> GetAvailableBookUnitForBook(int bookId)
    {
        var takenIds = await _context.Reservations.Where(r => r.ReturnedDate == null && r.Status != "Canceled").Select(r => r.BookUnitId).ToListAsync();
        var availableUnits = await _context.BookUnits.Where(bu => bu.BookId == bookId && !takenIds.Contains(bu.Id) && !bu.IsArchived).ToListAsync();

        foreach (var unit in availableUnits)
        {
            var latestReservation = await _context.Reservations
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

    public async Task<bool> ArchiveBookUnit(int unitId)
    {
        var activeReservation = await _context.Reservations.FirstOrDefaultAsync(r => r.BookUnitId == unitId && r.ReturnedDate == null);
        if (activeReservation != null)
        {
            return false;
        }

        var bu = await _context.BookUnits.FindAsync(unitId);
        if (bu != null)
        {
            bu.IsArchived = true;
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<bool> UnarchiveBookUnit(int unitId)
    {
        var bu = await _context.BookUnits.FindAsync(unitId);
        if (bu != null)
        {
            bu.IsArchived = false;
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<IList<BookCardResponse>> GetBooksByAuthor(int id, int? excludedId)
    {
        var books = await _context.Books.Include(b => b.Categories).Where(b => b.AuthorId == id && b.Id != excludedId && b.IsActive).OrderByDescending(b => b.Popularity).Take(12).ToListAsync();
        return await MapToCards(books);
    }

    public async Task<IList<BookCardResponse>> GetPopularBooks()
    {
        var books = await _context.Books.Include(b => b.Categories).Where(b => b.IsActive).OrderByDescending(b => b.Popularity).Take(12).ToListAsync();
        return await MapToCards(books);
    }

    public async Task<IList<BookCardResponse>> GetMultipleByIds(IList<int> ids)
    {
        var books = await _context.Books.Include(b => b.Categories).Where(b => ids.Contains(b.Id)).ToListAsync();
        return await MapToCards(books);
    }
}