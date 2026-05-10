using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Book;

public class BookService(IMongoDatabase db, CategoryService categoryService)
{
    private readonly IMongoCollection<BookModel> _books = db.GetCollection<BookModel>("books");
    private readonly CategoryService _categoryService = categoryService;

    public async Task<BookModel> CreateBook(CreateBookRequest createBookRequest)
    {
        var categories = await _categoryService.GetCategoriesByIds(createBookRequest.CategoryIds);

        var book = new BookModel
        {
            Title = createBookRequest.Title,
            Description = createBookRequest.Description,
            AuthorId = createBookRequest.AuthorId,
            PublisherId = createBookRequest.PublisherId,
            Language = createBookRequest.Language,
            PublicationYear = createBookRequest.PublicationYear,
            PagesCount = createBookRequest.PagesCount,
            Categories = categories,
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
        var newCategories = await _categoryService.GetCategoriesByIds(updateBookRequest.NewCategoryIds);

        var res = await _books.UpdateOneAsync(
            Builders<BookModel>.Filter.Eq(b => b.Id, id),
            Builders<BookModel>.Update
                .Set(b => b.Title, updateBookRequest.NewTitle)
                .Set(b => b.Description, updateBookRequest.NewDescription)
                .Set(b => b.Language, updateBookRequest.NewLanguage)
                .Set(b => b.PublicationYear, updateBookRequest.NewPublicationYear)
                .Set(b => b.PagesCount, updateBookRequest.NewPagesCount)
                .Set(b => b.Categories, newCategories)
                .Set(b => b.RepurchasePrice, updateBookRequest.NewRepurchasePrice)
                .Set(b => b.AuthorId, updateBookRequest.NewAuthorId)
                .Set(b => b.PublisherId, updateBookRequest.NewPublisherId)
                .Set(b => b.OriginalTitle, updateBookRequest.NewOriginalTitle)
                .Set(b => b.OriginalLanguage, updateBookRequest.NewOriginalLanguage)
                .Set(b => b.OriginalPublicationYear, updateBookRequest.NewOriginalPublicationYear)
                .Set(b => b.OriginalPublisherId, updateBookRequest.NewOriginalPublisherId)
        );
        return res.MatchedCount == 1;
    }

    public async Task<IList<BookModel>> SearchBooks(
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
            .Where(b => b.Title.StartsWith(searchToken))
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
            query = query.Where(b =>
                categoryIds.All(id => b.Categories.Any(c => c.Id == id)));
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

        query = query.Skip(9 * (pageNumber - 1)).Take(9);
        return await query.ToListAsync();
    }

    public async Task DeleteBook(string id)
    {
        await _books.FindOneAndDeleteAsync(b => b.Id == id);
    }
}