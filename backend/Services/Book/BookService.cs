using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using MongoDB.Driver;

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
            RepurchasePrice = createBookRequest.RepurchasePrice,
            OriginalTitle = createBookRequest.OriginalTitle,
            OriginalLanguage = createBookRequest.OriginalLanguage,
            OriginalPublicationYear = createBookRequest.OriginalPublicationYear,
            OriginalPublisherId = createBookRequest.OriginalPublisherId,
        };
        await _books.InsertOneAsync(book);
        return book;
    }
}