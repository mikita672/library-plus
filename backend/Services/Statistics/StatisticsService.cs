using LibraryPlus.Models.Book;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Models.User;
using LibraryPlus.Requests.Statistics;
using LibraryPlus.Responses.Statistics;
using LibraryPlus.Data;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Statistics;

public class StatisticsService(ApplicationDbContext db)
{
    private readonly ApplicationDbContext _db = db;

    public async Task<StatisticsResponse> GetStatistics(StatisticsRequest request)
    {
        var startDate = request.From.ToUniversalTime();
        var endDate = request.To.ToUniversalTime();

        var totalUnitsTask = _db.BookUnits.CountAsync();
        var totalMembersTask = _db.Users.CountAsync(u => !u.IsDeleted);
        var booksRentedTask = _db.Reservations.CountAsync(r => r.Status == "Taken");
        
        var activeResTask = _db.Reservations.CountAsync(r => r.Status == "Taken" || r.Status == "Reserved");

        var mostPopularBookTask = _db.Books
            .OrderByDescending(b => b.Popularity)
            .Select(b => b.Title)
            .FirstOrDefaultAsync();

        var activeUsersCountTask = _db.Reservations
            .Where(r => (r.CreatedAt >= startDate && r.CreatedAt <= endDate) || (r.ReturnedDate >= startDate && r.ReturnedDate <= endDate))
            .Select(r => r.UserId)
            .Distinct()
            .CountAsync();

        var newMembersTask = _db.Users.CountAsync(u => u.JoinedAt >= startDate && u.JoinedAt <= endDate);
        var newBooksTask = _db.Books.CountAsync(b => b.CreatedAt >= startDate && b.CreatedAt <= endDate);
        var popularCategoryTask = GetMostPopularCategoryName(startDate, endDate);

        var delayedReturnsTask = _db.Reservations.CountAsync(r => 
            (r.ReturnedDate != null && r.ReturnedDate > r.EndDate && r.ReturnedDate >= startDate && r.ReturnedDate <= endDate) ||
            (r.ReturnedDate == null && r.EndDate < DateTime.UtcNow && r.EndDate >= startDate && r.EndDate <= endDate)
        );

        await Task.WhenAll(
            totalUnitsTask, totalMembersTask, booksRentedTask, activeResTask, 
            mostPopularBookTask, activeUsersCountTask, newMembersTask, newBooksTask, popularCategoryTask, delayedReturnsTask
        );

        return new StatisticsResponse(
            await totalUnitsTask,
            await totalMembersTask,
            await booksRentedTask,
            (int)Math.Max(0, await totalUnitsTask - await activeResTask),
            await mostPopularBookTask ?? "N/A",
            await activeUsersCountTask,
            await newMembersTask,
            await newBooksTask,
            await popularCategoryTask,
            await delayedReturnsTask
        );
    }

    private async Task<string> GetMostPopularCategoryName(DateTime startDate, DateTime endDate)
    {
        var result = await (from r in _db.Reservations
                     join bu in _db.BookUnits on r.BookUnitId equals bu.Id
                     join b in _db.Books on bu.BookId equals b.Id
                     where r.CreatedAt >= startDate && r.CreatedAt <= endDate
                     from categoryId in b.CategoryIds
                     group categoryId by categoryId into g
                     orderby g.Count() descending
                     select g.Key).FirstOrDefaultAsync();

        if (result == null) return "N/A";

        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == result);
        return category?.Name ?? "N/A";
    }
}