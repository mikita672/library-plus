using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Requests.Book;
using LibraryPlus.Responses.Book;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Book;

public class ReviewService(LibraryPlusContext context)
{
    private readonly LibraryPlusContext _context = context;
    private const int REVIEWS_PER_PAGE = 3;

    public async Task<ReviewModel?> CreateReview(int userId, CreateReviewRequest request)
    {
        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.BookId == request.BookId && r.UserId == userId);
        if (existingReview != null) return null;

        var bookUnitIds = await _context.BookUnits
            .Where(bu => bu.BookId == request.BookId)
            .Select(bu => bu.Id)
            .ToListAsync();

        var hasReturnedReservation = await _context.Reservations
            .AnyAsync(r => r.UserId == userId
                && bookUnitIds.Contains(r.BookUnitId)
                && r.ReturnedDate != null);

        if (!hasReturnedReservation) return null;

        var review = new ReviewModel
        {
            BookId = request.BookId,
            UserId = userId,
            Rating = Math.Clamp(request.Rating, 1, 5),
            ReviewText = request.ReviewText,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task<BookReviewsResponse> GetBookReviews(int bookId, int page)
    {
        var query = _context.Reviews
            .Where(r => r.BookId == bookId)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)REVIEWS_PER_PAGE);

        var reviews = await query
            .Skip(REVIEWS_PER_PAGE * (page - 1))
            .Take(REVIEWS_PER_PAGE)
            .ToListAsync();

        var userIds = reviews.Select(r => r.UserId).Distinct().ToList();
        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync();
        var userMap = users.ToDictionary(u => u.Id);

        var responses = reviews.Select(r =>
        {
            userMap.TryGetValue(r.UserId, out var user);
            string? avatarUrl = user?.AvatarImage != null ? $"/api/media/users/{user.Id}/avatar" : null;
            return new ReviewResponse(
                r.Id,
                r.BookId,
                r.Rating,
                r.ReviewText,
                user?.Name,
                user?.Email,
                avatarUrl,
                r.CreatedAt
            );
        }).ToList();

        return new BookReviewsResponse(responses, totalCount, totalPages);
    }

    public async Task<BookRatingSummary> GetBookRatingSummary(int bookId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.BookId == bookId)
            .ToListAsync();

        if (reviews.Count == 0) return new BookRatingSummary(0, 0);

        var avg = reviews.Average(r => r.Rating);
        return new BookRatingSummary(Math.Round(avg, 2), reviews.Count);
    }

    public async Task<Dictionary<int, BookRatingSummary>> GetBulkBookRatings(List<int> bookIds)
    {
        var reviews = await _context.Reviews
            .Where(r => bookIds.Contains(r.BookId))
            .GroupBy(r => r.BookId)
            .Select(g => new { BookId = g.Key, Avg = g.Average(r => r.Rating), Count = g.Count() })
            .ToListAsync();

        var result = new Dictionary<int, BookRatingSummary>();
        foreach (var r in reviews)
        {
            result[r.BookId] = new BookRatingSummary(Math.Round(r.Avg, 2), r.Count);
        }
        return result;
    }

    public async Task<List<int>> GetReviewedBookIds(int userId)
    {
        return await _context.Reviews
            .Where(r => r.UserId == userId)
            .Select(r => r.BookId)
            .ToListAsync();
    }
}
