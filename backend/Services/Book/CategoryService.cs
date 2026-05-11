using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LibraryPlus.Services.Book;

public class CategoryService(IMongoDatabase db)
{
    private readonly IMongoCollection<CategoryModel> _categories = db.GetCollection<CategoryModel>("categories");

    public async Task<CategoryModel> CreateCategory(CreateCategoryRequest createCategoryRequest)
    {
        var category = new CategoryModel
        {
            Name = createCategoryRequest.Name,
        };
        await _categories.InsertOneAsync(category);
        return category;
    }

    public async Task<bool> EditCategory(string id, UpdateCategoryRequest updateCategoryRequest)
    {
        var res = await _categories.UpdateOneAsync(
            Builders<CategoryModel>.Filter.Eq(c => c.Id, id),
            Builders<CategoryModel>.Update.Set(c => c.Name, updateCategoryRequest.Name)
        );
        return res.MatchedCount == 1;
    }

    public async Task DeleteCategory(string id)
    {
        await _categories.FindOneAndDeleteAsync(
            Builders<CategoryModel>.Filter.Eq(c => c.Id, id)
        );
    }

    public async Task<IList<CategoryModel>> GetAllCategories()
    {
        return await _categories.AsQueryable().ToListAsync();
    }
}