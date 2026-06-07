using LibraryPlus.Data;
using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Book;

public class PublisherService(ApplicationDbContext db)
{
    private readonly ApplicationDbContext _db = db;

    public async Task<PublisherModel> CreatePublisher(CreatePublisherRequest createPublisherRequest)
    {
        var publisher = new PublisherModel
        {
            Name = createPublisherRequest.Name,
        };
        _db.Publishers.Add(publisher);
        await _db.SaveChangesAsync();
        return publisher;
    }

    public async Task<bool> EditPublisher(string id, UpdatePublisherRequest updatePublisherRequest)
    {
        var publisher = await _db.Publishers.FirstOrDefaultAsync(p => p.Id == id);
        if (publisher == null) return false;
        
        publisher.Name = updatePublisherRequest.Name;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IList<PublisherModel>> GetPublishers(int page)
    {
        return await _db.Publishers
            .Skip(8 * (page - 1))
            .Take(8)
            .ToListAsync();
    }

    public async Task<IList<PublisherModel>> GetAllPublishers()
    {
        return await _db.Publishers.ToListAsync();
    }

    public async Task<IList<PublisherModel>> GetPublishersByIds(IList<string?> ids)
    {
        return await _db.Publishers
            .Where(p => ids.Contains(p.Id))
            .ToListAsync();
    }

    public async Task DeletePublisher(string id)
    {
        var publisher = await _db.Publishers.FirstOrDefaultAsync(p => p.Id == id);
        if (publisher != null)
        {
            _db.Publishers.Remove(publisher);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<PublisherModel?> GetPublisher(string id)
    {
        return await _db.Publishers.FirstOrDefaultAsync(p => p.Id == id);
    }
}