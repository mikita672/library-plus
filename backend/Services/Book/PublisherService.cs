using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Book;

public class PublisherService(IMongoDatabase db)
{
    private readonly IMongoCollection<PublisherModel> _publishers = db.GetCollection<PublisherModel>("publishers");

    public async Task<PublisherModel> CreatePublisher(CreatePublisherRequest createPublisherRequest)
    {
        var publisher = new PublisherModel
        {
            Name = createPublisherRequest.Name,
        };
        await _publishers.InsertOneAsync(publisher);
        return publisher;
    }

    public async Task<bool> EditPublisher(string id, UpdatePublisherRequest updatePublisherRequest)
    {
        var res = await _publishers.UpdateOneAsync(
            Builders<PublisherModel>.Filter.Eq(p => p.Id, id),
            Builders<PublisherModel>.Update.Set(p => p.Name, updatePublisherRequest.NewName)
        );
        return res.MatchedCount == 1;
    }

    public async Task<IList<PublisherModel>> GetPublishers(int page)
    {
        return await _publishers.AsQueryable()
            .Skip(8 * (page - 1))
            .Take(8)
            .ToListAsync();
    }

    public async Task<IList<PublisherModel>> GetAllPublishers()
    {
        return await _publishers.AsQueryable().ToListAsync();
    }

    public async Task DeletePublisher(string id)
    {
        await _publishers.FindOneAndDeleteAsync(
            Builders<PublisherModel>.Filter.Eq(p => p.Id, id)
        );
    }
}