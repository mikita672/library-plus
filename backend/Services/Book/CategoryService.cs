using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Book;

public class CategoryService(LibraryPlusContext context)
{
    private readonly LibraryPlusContext _context = context;

    public async Task<CategoryModel> CreateCategory(CreateCategoryRequest createCategoryRequest)
    {
        var category = new CategoryModel
        {
            Name = createCategoryRequest.Name,
        };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<bool> EditCategory(int id, UpdateCategoryRequest updateCategoryRequest)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return false;
        }

        category.Name = updateCategoryRequest.Name;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category != null)
        {
            category.IsActive = false;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IList<CategoryModel>> GetAllCategories(bool includeInactive = false)
    {
        return await _context.Categories.Where(c => includeInactive || c.IsActive).ToListAsync();
    }

    public async Task<IList<CategoryModel>> GetCategoriesByIds(IList<int> ids)
    {
        return await _context.Categories
            .Where(c => ids.Contains(c.Id))
            .ToListAsync();
    }
}