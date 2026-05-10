using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Book;

public class BookService(IMongoDatabase db)
{
    private readonly IMongoCollection<BookModel> _books = db.GetCollection<BookModel>("books");

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
            Categories = createBookRequest.Categories,
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
                .Set(b => b.Title, updateBookRequest.NewTitle)
                .Set(b => b.Description, updateBookRequest.NewDescription)
                .Set(b => b.Language, updateBookRequest.NewLanguage)
                .Set(b => b.PublicationYear, updateBookRequest.NewPublicationYear)
                .Set(b => b.PagesCount, updateBookRequest.NewPagesCount)
                .Set(b => b.Categories, updateBookRequest.NewCategories)
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
        List<CategoryModel>? categories = null,
        uint? minPublicationYear = null,
        uint? maxPublicationYear = null,
        int pageNumber = 1,
        string? sortBy = null,
        bool sortDescending = false
    )
    {
        searchToken ??= "";
        minPublicationYear ??= 0;
        maxPublicationYear ??= uint.MaxValue;

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
        if (categories != null)
        {
            query = query.Where(b => categories.Intersect(b.Categories).Count() == categories.Count);
        }

        string normalizedSortBy = sortBy?.ToLower() ?? "title";
        if (sortDescending)
        {
            query = normalizedSortBy switch
            {
                "publicationyear" => query.OrderByDescending(b => b.PublicationYear),
                "authorid" => query.OrderByDescending(b => b.AuthorId),
                "publisherid" => query.OrderByDescending(b => b.PublisherId),
                _ => query.OrderByDescending(b => b.Title)
            };
        }
        else
        {
            query = normalizedSortBy switch
            {
                "publicationyear" => query.OrderBy(b => b.PublicationYear),
                "authorid" => query.OrderBy(b => b.AuthorId),
                "publisherid" => query.OrderBy(b => b.PublisherId),
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