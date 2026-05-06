using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Book;

public class PublisherService(IMongoDatabase db)
{
    private readonly IMongoCollection<PublisherModel> _publishers = db.GetCollection<PublisherModel>("publishers");

    public async Task<PublisherModel> CreateAuthor(CreatePublisherRequest createPublisherRequest)
    {
        var author = new PublisherModel
        {
            Name = createPublisherRequest.Name,
        };
        await _publishers.InsertOneAsync(author);
        return author;
    }

    public async Task<bool> EditAuthor(string id, UpdatePublisherRequest updatePublisherRequest)
    {
        var res = await _publishers.UpdateOneAsync(
            Builders<PublisherModel>.Filter.Eq(a => a.Id, id),
            Builders<PublisherModel>.Update.Set(a => a.Name, updatePublisherRequest.NewName)
        );
        return res.MatchedCount == 1;
    }

    public async Task<IList<PublisherModel>> GetAuthors(int page)
    {
        return await _publishers.AsQueryable()
            .Skip(8 * (page - 1))
            .Take(8)
            .ToListAsync();
    }

    public async Task DeleteAuthor(string id)
    {
        await _publishers.FindOneAndDeleteAsync(
            Builders<PublisherModel>.Filter.Eq(a => a.Id, id)
        );
    }
}