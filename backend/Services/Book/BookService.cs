using LibraryPlus.Models.Book;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Book;
using LibraryPlus.Responses.Book;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Book;

public class BookService(IMongoDatabase db, CategoryService categoryService, AuthorService authorService, PublisherService publisherService)
{
    private readonly IMongoCollection<BookModel> _books = db.GetCollection<BookModel>("books");
    private readonly IMongoCollection<BookUnitModel> _bookUnits = db.GetCollection<BookUnitModel>("bookUnits");
    private readonly IMongoCollection<ReservationModel> _reservations = db.GetCollection<ReservationModel>("reservations");
    private readonly AuthorService _authorService = authorService;
    private readonly PublisherService _publisherService = publisherService;
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
            Popularity = 0,
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

    private async Task<IQueryable<BookModel>> BuildBookFilterQueryAsync(
            string? searchToken,
            string? authorId,
            string? publisherId,
            List<string>? categoryIds,
            uint? minPublicationYear,
            uint? maxPublicationYear,
            bool? isAvailable)
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

        if (isAvailable != null)
        {
            var reservedBookUnitIds = await _reservations.AsQueryable()
                .Where(r => r.ReturnedDate == null)
                .Select(r => r.BookUnitId)
                .ToListAsync();

            var availableBookIds = await _bookUnits.AsQueryable()
                .Where(bu => !reservedBookUnitIds.Contains(bu.Id))
                .Select(bu => bu.BookId)
                .Distinct()
                .ToListAsync();

            query = query.Where(b => availableBookIds.Contains(b.Id) == isAvailable);
        }

        return query;
    }

    public async Task<IList<BookCardResponse>> GetMultipleByIds(IList<string> ids)
    {
        var books = await _books.AsQueryable()
            .Where(b => ids.Contains(b.Id))
            .ToListAsync();

        var authorIds = books
            .Select(b => b.AuthorId)
            .Where(id => id != null)
            .Distinct()
            .ToList();

        var authors = await _authorService.GetAuthorsByIds(authorIds);
        var authorMap = authors.ToDictionary(a => a.Id, a => a.Name);

        var categoryIds = books
            .SelectMany(b => b.CategoryIds ?? [])
            .Distinct()
            .ToList();
        var categories = await _categoryService.GetCategoriesByIds(categoryIds);
        var categoryMap = categories.ToDictionary(c => c.Id, c => c.Name);

        return await Task.WhenAll([.. books.Select(async b => new BookCardResponse(
            b.Id,
            b.Title,
            b.Language,
            b.AuthorId != null && authorMap.TryGetValue(b.AuthorId, out var name) ? name : null,
            b.CategoryIds != null && b.CategoryIds.Count > 0 && categoryMap.TryGetValue(b.CategoryIds[0], out var catName) ? catName : null,
            b.PublicationYear,
            b.OriginalPublicationYear,
            b.CoverURI,
            (await GetAvailableBookUnitForBook(b.Id)) != null
        ))]);

    }

    public async Task<IList<BookCardResponse>> SearchBooks(
        string? searchToken = null,
        string? authorId = null,
        string? publisherId = null,
        List<string>? categoryIds = null,
        uint? minPublicationYear = null,
        uint? maxPublicationYear = null,
        bool? isAvailable = null,
        int pageNumber = 1,
        string? sortBy = null,
        bool sortDescending = false
    )
    {
        var query = await BuildBookFilterQueryAsync(
            searchToken, authorId, publisherId, categoryIds,
            minPublicationYear, maxPublicationYear, isAvailable);

        string normalizedSortBy = sortBy?.ToLower() ?? "title";

        if (sortDescending)
        {
            query = normalizedSortBy switch
            {
                "publicationyear" => query
                    .OrderByDescending(b => b.OriginalPublicationYear ?? b.PublicationYear),
                "relevancy" => query
                    .OrderByDescending(b => b.Popularity),
                _ => query.OrderByDescending(b => b.Title)
            };
        }
        else
        {
            query = normalizedSortBy switch
            {
                "publicationyear" => query.OrderBy(b => b.OriginalPublicationYear ?? b.PublicationYear),
                "relevancy" => query.OrderBy(b => b.Popularity),
                _ => query.OrderBy(b => b.Title)
            };
        }

        var books = await query.Skip(SEARCH_PAGE_SIZE * (pageNumber - 1)).Take(SEARCH_PAGE_SIZE).ToListAsync();

        var authorIds = books
            .Select(b => b.AuthorId)
            .Where(id => id != null)
            .Distinct()
            .ToList();

        var authors = await _authorService.GetAuthorsByIds(authorIds);
        var authorMap = authors.ToDictionary(a => a.Id, a => a.Name);

        var responseCategoryIds = books
            .SelectMany(b => b.CategoryIds ?? [])
            .Distinct()
            .ToList();
        var categories = await _categoryService.GetCategoriesByIds(responseCategoryIds);
        var categoryMap = categories.ToDictionary(c => c.Id, c => c.Name);

        return await Task.WhenAll([.. books.Select(async b => new BookCardResponse(
            b.Id,
            b.Title,
            b.Language,
            b.AuthorId != null && authorMap.TryGetValue(b.AuthorId, out var name) ? name : null,
            b.CategoryIds != null && b.CategoryIds.Count > 0 && categoryMap.TryGetValue(b.CategoryIds[0], out var catName) ? catName : null,
            b.PublicationYear,
            b.OriginalPublicationYear,
            b.CoverURI,
            (await GetAvailableBookUnitForBook(b.Id)) != null
        ))]);
    }

    public async Task<uint> GetPagesCount(
        string? searchToken = null,
        string? authorId = null,
        string? publisherId = null,
        List<string>? categoryIds = null,
        uint? minPublicationYear = null,
        uint? maxPublicationYear = null,
        bool? isAvailable = null
    )
    {
        var query = await BuildBookFilterQueryAsync(
            searchToken, authorId, publisherId, categoryIds,
            minPublicationYear, maxPublicationYear, isAvailable);

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

    public async Task<BookPreviewResponse?> GetBookPreviewById(string id)
    {
        var book = await _books.AsQueryable().Where(b => b.Id == id).FirstOrDefaultAsync();
        if (book == null)
        {
            return null;
        }
        var authorTask = book.AuthorId != null ? _authorService.GetAuthor(book.AuthorId) : Task.FromResult<AuthorModel?>(null);
        var publisherTask = book.PublisherId != null ? _publisherService.GetPublisher(book.PublisherId) : Task.FromResult<PublisherModel?>(null);
        var originalPublisherTask = book.OriginalPublisherId != null ? _publisherService.GetPublisher(book.OriginalPublisherId) : Task.FromResult<PublisherModel?>(null);
        var categoriesTask = _categoryService.GetCategoriesByIds(book.CategoryIds);
        var bookUnitTask = GetAvailableBookUnitForBook(book.Id);
        await Task.WhenAll(authorTask, publisherTask, originalPublisherTask, categoriesTask, bookUnitTask);
        return new BookPreviewResponse(
            book.Id,
            book.Title,
            book.Description,
            await authorTask,
            await publisherTask,
            book.Language,
            book.PublicationYear,
            book.PagesCount,
            await categoriesTask,
            book.OriginalTitle,
            book.OriginalLanguage,
            book.OriginalPublicationYear,
            await originalPublisherTask,
            book.CoverURI,
            (await bookUnitTask) != null
        );
    }

    public async Task IncreasePopularity(BookModel book)
    {
        await _books.UpdateOneAsync(
            Builders<BookModel>.Filter.Eq(b => b.Id, book.Id),
            Builders<BookModel>.Update.Set(b => b.Popularity, book.Popularity + 1)
        );
    }

    public async Task<BookUnitModel?> GetAvailableBookUnitForBook(string bookId)
    {
        var reservedBookUnitIds = await _reservations.AsQueryable()
            .Where(r => r.ReturnedDate == null)
            .Select(r => r.BookUnitId)
            .ToListAsync();

        return await _bookUnits.AsQueryable()
            .Where(bu => bu.BookId == bookId)
            .Where(bu => !reservedBookUnitIds.Contains(bu.Id))
            .FirstOrDefaultAsync();
    }

    public async Task<IList<BookCardResponse>> GetBooksByAuthor(string authorId, string? excludedBookId)
    {
        var authorTask = _authorService.GetAuthor(authorId);
        var booksQuery = _books.AsQueryable();
        if (excludedBookId != null)
        {
            booksQuery = booksQuery.Where(b => b.Id != excludedBookId);
        }
        booksQuery = booksQuery
            .Where(b => b.AuthorId == authorId)
            .OrderByDescending(b => b.Popularity)
            .Take(12);
        var booksTask = booksQuery.ToListAsync();

        await Task.WhenAll(booksTask, authorTask);
        var books = await booksTask;
        var author = await authorTask;

        var categoryIds = books
            .SelectMany(b => b.CategoryIds ?? [])
            .Distinct()
            .ToList();
        var categories = await _categoryService.GetCategoriesByIds(categoryIds);
        var categoryMap = categories.ToDictionary(c => c.Id, c => c.Name);

        return await Task.WhenAll([.. books.Select(async b => new BookCardResponse(
            b.Id,
            b.Title,
            b.Language,
            author?.Name,
            b.CategoryIds != null && b.CategoryIds.Count > 0 && categoryMap.TryGetValue(b.CategoryIds[0], out var catName) ? catName : null,
            b.PublicationYear,
            b.OriginalPublicationYear,
            b.CoverURI,
            (await GetAvailableBookUnitForBook(b.Id)) != null
        ))]);
    }

    public async Task<IList<BookCardResponse>> GetPopularBooks()
    {
        var books = await _books.AsQueryable()
            .OrderByDescending(b => b.Popularity)
            .Take(12)
            .ToListAsync();

        var authorIds = books
            .Select(b => b.AuthorId)
            .Where(id => id != null)
            .Distinct()
            .ToList();

        var authors = await _authorService.GetAuthorsByIds(authorIds);
        var authorDict = authors.ToDictionary(a => a.Id);

        var categoryIds = books
            .SelectMany(b => b.CategoryIds ?? [])
            .Distinct()
            .ToList();
        var categories = await _categoryService.GetCategoriesByIds(categoryIds);
        var categoryMap = categories.ToDictionary(c => c.Id, c => c.Name);

        var responseTasks = books.Select(async b =>
        {
            authorDict.TryGetValue(b.AuthorId ?? string.Empty, out var author);
            categoryMap.TryGetValue(b.CategoryIds?.FirstOrDefault() ?? string.Empty, out var catName);

            return new BookCardResponse(
                b.Id,
                b.Title,
                b.Language,
                author?.Name,
                catName,
                b.PublicationYear,
                b.OriginalPublicationYear,
                b.CoverURI,
                (await GetAvailableBookUnitForBook(b.Id)) != null
            );
        });

        return [.. await Task.WhenAll(responseTasks)];
    }

}