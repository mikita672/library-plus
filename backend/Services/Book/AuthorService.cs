using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Book;

public class AuthorService(LibraryPlusContext context)
{
    private readonly LibraryPlusContext _context = context;

    public async Task<AuthorModel> CreateAuthor(CreateAuthorRequest createAuthorRequest)
    {
        var author = new AuthorModel
        {
            Name = createAuthorRequest.Name,
        };
        _context.Authors.Add(author);
        await _context.SaveChangesAsync();
        return author;
    }

    public async Task<bool> EditAuthor(int id, UpdateAuthorRequest updateAuthorRequest)
    {
        var author = await _context.Authors.FindAsync(id);
        if (author == null)
        {
            return false;
        }

        author.Name = updateAuthorRequest.Name;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IList<AuthorModel>> GetAuthors(int page)
    {
        return await _context.Authors
            .Skip(8 * (page - 1))
            .Take(8)
            .ToListAsync();
    }

    public async Task<IList<AuthorModel>> GetAuthorsByIds(IList<int> ids)
    {
        return await _context.Authors
            .Where(a => ids.Contains(a.Id))
            .ToListAsync();
    }

    public async Task<IList<AuthorModel>> GetAllAuthors(bool includeInactive = false)
    {
        return await _context.Authors.Where(a => includeInactive || a.IsActive).ToListAsync();
    }

    public async Task<AuthorModel?> GetAuthor(int id)
    {
        return await _context.Authors.FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task DeleteAuthor(int id)
    {
        var author = await _context.Authors.FindAsync(id);
        if (author != null)
        {
            author.IsActive = false;
            await _context.SaveChangesAsync();
        }
    }
}