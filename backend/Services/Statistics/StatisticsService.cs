using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Models.User;
using LibraryPlus.Requests.Statistics;
using LibraryPlus.Responses.Statistics;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Statistics;

public class StatisticsService(LibraryPlusContext context)
{
    private readonly LibraryPlusContext _context = context;

    public async Task<StatisticsResponse> GetStatistics(StatisticsRequest request)
    {
        var fromDate = request.From.ToUniversalTime();
        var toDate = request.To.ToUniversalTime();

        var totalUnits = await _context.BookUnits.CountAsync();
        var totalMembers = await _context.Users.CountAsync(u => !u.IsDeleted);
        var booksRented = await _context.Reservations.CountAsync(r => r.Status == "Taken");
        
        var activeResCount = await _context.Reservations.CountAsync(r => r.Status == "Taken" || r.Status == "Reserved");

        var mostPopularBook = await GetMostPopularBookName(fromDate, toDate);

        var activeUsersCount = await _context.Reservations
            .Where(r => (r.CreatedAt >= fromDate && r.CreatedAt <= toDate) || (r.ReturnedDate >= fromDate && r.ReturnedDate <= toDate))
            .Select(r => r.UserId)
            .Distinct()
            .CountAsync();

        var newMembers = await _context.Users.CountAsync(u => u.JoinedAt >= fromDate && u.JoinedAt <= toDate);
        var newBooks = await _context.Books.CountAsync(b => b.CreatedAt >= fromDate && b.CreatedAt <= toDate);
        var popularCategory = await GetMostPopularCategoryName(fromDate, toDate);

        var delayedReturns = await _context.Reservations.CountAsync(r => 
            (r.ReturnedDate != null && r.ReturnedDate > r.EndDate && r.ReturnedDate >= fromDate && r.ReturnedDate <= toDate) ||
            (r.ReturnedDate == null && r.EndDate < DateTime.UtcNow && r.EndDate >= fromDate && r.EndDate <= toDate)
        );

        return new StatisticsResponse(
            totalUnits,
            totalMembers,
            booksRented,
            (int)Math.Max(0, totalUnits - activeResCount),
            mostPopularBook,
            activeUsersCount,
            newMembers,
            newBooks,
            popularCategory,
            delayedReturns
        );
    }

    private async Task<string> GetMostPopularCategoryName(DateTime fromDate, DateTime toDate)
    {
        var categoryId = await (from r in _context.Reservations
                               join bu in _context.BookUnits on r.BookUnitId equals bu.Id
                               join b in _context.Books on bu.BookId equals b.Id
                               from c in b.Categories
                               where r.CreatedAt >= fromDate && r.CreatedAt <= toDate
                               group c.Id by c.Id into g
                               orderby g.Count() descending
                               select (int?)g.Key)
                               .FirstOrDefaultAsync();

        if (categoryId == null || categoryId == 0) { return "N/A"; }

        var category = await _context.Categories.FindAsync(categoryId);
        return category?.Name ?? "N/A";
    }

    private async Task<string> GetMostPopularBookName(DateTime fromDate, DateTime toDate)
    {
        var bookName = await (from r in _context.Reservations
                               join bu in _context.BookUnits on r.BookUnitId equals bu.Id
                               join b in _context.Books on bu.BookId equals b.Id
                               where r.CreatedAt >= fromDate && r.CreatedAt <= toDate
                               group b.Title by b.Title into g
                               orderby g.Count() descending
                               select g.Key)
                               .FirstOrDefaultAsync();

        return bookName ?? "N/A";
    }
}