using LibraryPlus.Models.Book;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Book;
using LibraryPlus.Responses.Book;
using LibraryPlus.Services.Reservation;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Book;

public class BookService(IMongoDatabase db, CategoryService categoryService)
{
    private readonly IMongoCollection<BookModel> _books = db.GetCollection<BookModel>("books");
    private readonly IMongoCollection<BookUnitModel> _bookUnits = db.GetCollection<BookUnitModel>("booksUnits");
    private readonly IMongoCollection<ReservationModel> _reservations = db.GetCollection<ReservationModel>("reservations");
    private readonly IMongoCollection<AuthorModel> _authors = db.GetCollection<AuthorModel>("authors");
    private readonly CategoryService _categoryService = categoryService;
    private const int SEARCH_PAGE_SIZE = 12;

    public async Task<BookModel> CreateBook(CreateBookRequest createBookRequest)
    {
        var book = new BookModel
        {
            Title = createBookRequest.Title,
            Description = createBookRequest.Description,
            AuthorId = createBookRequest.AuthorId,
            PublisherId = createBookRequest.PublisherId,
            Language = createBookRequest.Language,
            PublicationYear = createBookRequest.PublicationYear,
            PagesCount = createBookRequest.PagesCount,
            CategoryIds = createBookRequest.CategoryIds,
            RepurchasePrice = createBookRequest.RepurchasePrice,
            OriginalTitle = createBookRequest.OriginalTitle,
            OriginalLanguage = createBookRequest.OriginalLanguage,
            OriginalPublicationYear = createBookRequest.OriginalPublicationYear,
            OriginalPublisherId = createBookRequest.OriginalPublisherId,
        };
        await _books.InsertOneAsync(book);
        return book;
    }

    public async Task<bool> EditBook(string id, UpdateBookRequest updateBookRequest)
    {
        var res = await _books.UpdateOneAsync(
            Builders<BookModel>.Filter.Eq(b => b.Id, id),
            Builders<BookModel>.Update
                .Set(b => b.Title, updateBookRequest.Title)
                .Set(b => b.Description, updateBookRequest.Description)
                .Set(b => b.Language, updateBookRequest.Language)
                .Set(b => b.PublicationYear, updateBookRequest.PublicationYear)
                .Set(b => b.PagesCount, updateBookRequest.PagesCount)
                .Set(b => b.CategoryIds, updateBookRequest.CategoryIds)
                .Set(b => b.RepurchasePrice, updateBookRequest.RepurchasePrice)
                .Set(b => b.AuthorId, updateBookRequest.AuthorId)
                .Set(b => b.PublisherId, updateBookRequest.PublisherId)
                .Set(b => b.OriginalTitle, updateBookRequest.OriginalTitle)
                .Set(b => b.OriginalLanguage, updateBookRequest.OriginalLanguage)
                .Set(b => b.OriginalPublicationYear, updateBookRequest.OriginalPublicationYear)
                .Set(b => b.OriginalPublisherId, updateBookRequest.OriginalPublisherId)
        );
        return res.MatchedCount == 1;
    }

    public async Task<IList<BookCardResponse>> SearchBooks(
        string? searchToken = null,
        string? authorId = null,
        string? publisherId = null,
        List<string>? categoryIds = null,
        uint? minPublicationYear = null,
        uint? maxPublicationYear = null,
        int pageNumber = 1,
        string? sortBy = null,
        bool sortDescending = false
    )
    {
        searchToken ??= "";
        minPublicationYear ??= 0;
        maxPublicationYear ??= (uint)DateTime.Now.Year;

        var query = _books.AsQueryable()
            .Where(b => b.Title.StartsWith(searchToken, StringComparison.CurrentCultureIgnoreCase))
            .Where(b => b.PublicationYear >= minPublicationYear)
            .Where(b => b.PublicationYear <= maxPublicationYear);
        if (authorId != null)
        {
            query = query.Where(b => b.AuthorId == authorId);
        }
        if (publisherId != null)
        {
            query = query.Where(b => b.PublisherId == publisherId);
        }
        if (categoryIds != null && categoryIds.Count != 0)
        {
            query = query.Where(b => b.CategoryIds.Any(c => categoryIds.Contains(c)));
        }
        string normalizedSortBy = sortBy?.ToLower() ?? "title";
        if (sortDescending)
        {
            query = normalizedSortBy switch
            {
                "publicationyear" => query
                    .OrderByDescending(b => b.OriginalPublicationYear ?? b.PublicationYear),
                _ => query.OrderByDescending(b => b.Title)
            };
        }
        else
        {
            query = normalizedSortBy switch
            {
                "publicationyear" => query
                    .OrderBy(b => b.OriginalPublicationYear ?? b.PublicationYear),
                _ => query.OrderBy(b => b.Title)
            };
        }

        var books = await query.Skip(SEARCH_PAGE_SIZE * (pageNumber - 1)).Take(SEARCH_PAGE_SIZE).ToListAsync();
        var authorIds = books
            .Select(b => b.AuthorId)
            .Where(id => id != null)
            .Distinct()
            .ToList();

        var authors = await _authors.AsQueryable()
            .Where(a => authorIds.Contains(a.Id))
            .ToListAsync();

        var authorMap = authors.ToDictionary(a => a.Id, a => a.Name);
        return [.. books.Select(b => new BookCardResponse(
                b.Id,
                b.Title,
                b.Language,
                b.AuthorId != null && authorMap.TryGetValue(b.AuthorId, out var name) ? name : null,
                b.PublicationYear,
                b.OriginalPublicationYear,
                b.CoverURI
            ))];
    }

    public async Task<uint> GetPagesCount(
        string? searchToken = null,
        string? authorId = null,
        string? publisherId = null,
        List<string>? categoryIds = null,
        uint? minPublicationYear = null,
        uint? maxPublicationYear = null,
        string? sortBy = null,
        bool sortDescending = false
    )
    {
        searchToken ??= "";
        minPublicationYear ??= 0;
        maxPublicationYear ??= (uint)DateTime.Now.Year;

        var query = _books.AsQueryable()
            .Where(b => b.Title.StartsWith(searchToken, StringComparison.CurrentCultureIgnoreCase))
            .Where(b => b.PublicationYear >= minPublicationYear)
            .Where(b => b.PublicationYear <= maxPublicationYear);
        if (authorId != null)
        {
            query = query.Where(b => b.AuthorId == authorId);
        }
        if (publisherId != null)
        {
            query = query.Where(b => b.PublisherId == publisherId);
        }
        if (categoryIds != null && categoryIds.Count != 0)
        {
            query = query.Where(b => b.CategoryIds.Any(c => categoryIds.Contains(c)));
        }
        string normalizedSortBy = sortBy?.ToLower() ?? "title";
        if (sortDescending)
        {
            query = normalizedSortBy switch
            {
                "publicationyear" => query.OrderByDescending(b => b.PublicationYear),
                _ => query.OrderByDescending(b => b.Title)
            };
        }
        else
        {
            query = normalizedSortBy switch
            {
                "publicationyear" => query.OrderBy(b => b.PublicationYear),
                _ => query.OrderBy(b => b.Title)
            };
        }

        var totalBooks = await query.CountAsync();
        return (uint)Math.Ceiling((double)totalBooks / SEARCH_PAGE_SIZE);
    }


    public async Task DeleteBook(string id)
    {
        await _books.FindOneAndDeleteAsync(b => b.Id == id);
    }

    public async Task<BookUnitModel> AddBookUnit(string bookId)
    {
        var bookUnit = new BookUnitModel
        {
            BookId = bookId,
        };
        await _bookUnits.InsertOneAsync(bookUnit);
        return bookUnit;
    }

    public async Task DeleteBookUnit(string bookUnitId)
    {
        await _bookUnits.FindOneAndDeleteAsync(b => b.Id == bookUnitId);
    }

    public async Task<BookModel?> GetBookById(string id)
    {
        return await _books.AsQueryable().Where(b => b.Id == id).FirstOrDefaultAsync();
    }

    public async Task<BookUnitModel?> GetAvailableBookUnit(string bookId)
    {
        var reservedBookUnitIds = _reservations.AsQueryable()
            .Where(r => r.ReturnedDate == null)
            .Join(
                _bookUnits.AsQueryable(),
                r => r.BookUnitId,
                bu => bu.Id,
                (r, bu) => bu.Id
            );

        return await _bookUnits.AsQueryable()
            .Where(bu => bu.BookId == bookId)
            .Where(bu => !reservedBookUnitIds.Contains(bu.Id))
            .FirstOrDefaultAsync();
    }

}