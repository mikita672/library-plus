using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Book;

public class PublisherService(LibraryPlusContext context)
{
    private readonly LibraryPlusContext _context = context;

    public async Task<PublisherModel> CreatePublisher(CreatePublisherRequest createPublisherRequest)
    {
        var publisher = new PublisherModel
        {
            Name = createPublisherRequest.Name,
        };
        _context.Publishers.Add(publisher);
        await _context.SaveChangesAsync();
        return publisher;
    }

    public async Task<bool> EditPublisher(int id, UpdatePublisherRequest updatePublisherRequest)
    {
        var publisher = await _context.Publishers.FindAsync(id);
        if (publisher == null) return false;

        publisher.Name = updatePublisherRequest.Name;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IList<PublisherModel>> GetPublishers(int page)
    {
        return await _context.Publishers
            .Skip(8 * (page - 1))
            .Take(8)
            .ToListAsync();
    }

    public async Task<IList<PublisherModel>> GetAllPublishers()
    {
        return await _context.Publishers.ToListAsync();
    }

    public async Task<IList<PublisherModel>> GetPublishersByIds(IList<int> ids)
    {
        return await _context.Publishers
            .Where(p => ids.Contains(p.Id))
            .ToListAsync();
    }

    public async Task DeletePublisher(int id)
    {
        var publisher = await _context.Publishers.FindAsync(id);
        if (publisher != null)
        {
            _context.Publishers.Remove(publisher);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<PublisherModel?> GetPublisher(int id)
    {
        return await _context.Publishers.FirstOrDefaultAsync(p => p.Id == id);
    }
}