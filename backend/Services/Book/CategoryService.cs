using LibraryPlus.Data;
using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Book;

public class CategoryService(ApplicationDbContext db)
{
    private readonly ApplicationDbContext _db = db;

    public async Task<CategoryModel> CreateCategory(CreateCategoryRequest createCategoryRequest)
    {
        var category = new CategoryModel
        {
            Name = createCategoryRequest.Name,
        };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();
        return category;
    }

    public async Task<bool> EditCategory(string id, UpdateCategoryRequest updateCategoryRequest)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category == null) return false;
        
        category.Name = updateCategoryRequest.Name;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task DeleteCategory(string id)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category != null)
        {
            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IList<CategoryModel>> GetAllCategories()
    {
        return await _db.Categories.ToListAsync();
    }

    public async Task<IList<CategoryModel>> GetCategoriesByIds(IList<string> ids)
    {
        return await _db.Categories
            .Where(c => ids.Contains(c.Id))
            .ToListAsync();
    }
}