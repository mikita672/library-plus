using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Book;

public class AuthorService(IMongoDatabase db)
{
    private readonly IMongoCollection<AuthorModel> _authors = db.GetCollection<AuthorModel>("authors");

    public async Task<AuthorModel> CreateAuthor(CreateAuthorRequest createAuthorRequest)
    {
        var author = new AuthorModel
        {
            Name = createAuthorRequest.Name,
        };
        await _authors.InsertOneAsync(author);
        return author;
    }

    public async Task<bool> EditAuthor(string id, UpdateAuthorRequest updateAuthorRequest)
    {
        var res = await _authors.UpdateOneAsync(
            Builders<AuthorModel>.Filter.Eq(a => a.Id, id),
            Builders<AuthorModel>.Update.Set(a => a.Name, updateAuthorRequest.Name)
        );
        return res.MatchedCount == 1;
    }

    public async Task<IList<AuthorModel>> GetAuthors(int page)
    {
        return await _authors.AsQueryable()
            .Skip(8 * (page - 1))
            .Take(8)
            .ToListAsync();
    }

    public async Task<IList<AuthorModel>> GetAllAuthors()
    {
        return await _authors.AsQueryable().ToListAsync();
    }

    public async Task DeleteAuthor(string id)
    {
        await _authors.FindOneAndDeleteAsync(
            Builders<AuthorModel>.Filter.Eq(a => a.Id, id)
        );
    }
}