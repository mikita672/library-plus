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

}