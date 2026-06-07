using LibraryPlus.Data;
using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Book;

public class AuthorService(ApplicationDbContext db)
{
    private readonly ApplicationDbContext _db = db;

    public async Task<AuthorModel> CreateAuthor(CreateAuthorRequest createAuthorRequest)
    {
        var author = new AuthorModel
        {
            Name = createAuthorRequest.Name,
        };
        _db.Authors.Add(author);
        await _db.SaveChangesAsync();
        return author;
    }

    public async Task<bool> EditAuthor(string id, UpdateAuthorRequest updateAuthorRequest)
    {
        var author = await _db.Authors.FirstOrDefaultAsync(a => a.Id == id);
        if (author == null) return false;
        
        author.Name = updateAuthorRequest.Name;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IList<AuthorModel>> GetAuthors(int page)
    {
        return await _db.Authors
            .Skip(8 * (page - 1))
            .Take(8)
            .ToListAsync();
    }

    public async Task<IList<AuthorModel>> GetAuthorsByIds(IList<string?> ids)
    {
        return await _db.Authors
            .Where(a => ids.Contains(a.Id))
            .ToListAsync();
    }

    public async Task<IList<AuthorModel>> GetAllAuthors()
    {
        return await _db.Authors.ToListAsync();
    }

    public async Task<AuthorModel?> GetAuthor(string id)
    {
        return await _db.Authors.FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task DeleteAuthor(string id)
    {
        var author = await _db.Authors.FirstOrDefaultAsync(a => a.Id == id);
        if (author != null)
        {
            _db.Authors.Remove(author);
            await _db.SaveChangesAsync();
        }
    }
}