using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Models.User;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Reservation;
using LibraryPlus.Responses.Reservation;
using LibraryPlus.Requests.User;
using LibraryPlus.Services.Book;
using LibraryPlus.Services.Mail;
using LibraryPlus.Services.User;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Services.Reservation;

public class ReservationService(LibraryPlusContext context, BookService bookService, NotificationService notificationService, IMailService mailService)
{
    private readonly LibraryPlusContext _context = context;
    private readonly BookService _bookService = bookService;
    private readonly NotificationService _notificationService = notificationService;
    private readonly IMailService _mailService = mailService;
    public const int USER_PAGE_SIZE = 3;
    public const int ADMIN_PAGE_SIZE = 6;

    public async Task<(ReservationModel? Reservation, string? Error)> CreateReservation(int userId, CreateReservationRequest request)
    {
        var totalDays = (request.EndDate - request.StartDate).TotalDays;
        if (totalDays < 14 || totalDays > 30)
        {
            return (null, "Reservation period must be between 14 and 30 days.");
        }

        var bookUnitsForBookIds = await _context.BookUnits.Where(bu => bu.BookId == request.BookId).Select(bu => bu.Id).ToListAsync();
        var existingReservation = await _context.Reservations.FirstOrDefaultAsync(r => r.UserId == userId && r.ReturnedDate == null && r.Status != "Canceled" && bookUnitsForBookIds.Contains(r.BookUnitId));
        if (existingReservation != null)
        {
            return (null, "You already have an active reservation for this book.");
        }

        var bookUnit = await _bookService.GetAvailableBookUnitForBook(request.BookId);
        if (bookUnit == null)
        {
            return (null, "No available copies of this book at the moment.");
        }

        var book = await _bookService.GetBookById(request.BookId);
        if (book == null)
        {
            return (null, "Book not found.");
        }

        var reservation = new ReservationModel
        {
            BookUnitId = bookUnit.Id,
            UserId = userId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            ReturnedDate = null,
            BookConditionUponReturn = null,
            Status = "Reserved",
            RepurchasePrice = book.RepurchasePrice,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();
        await _bookService.IncreasePopularity(book);
        return (reservation, null);
    }

    public async Task<IList<ReservationResponse>> GetUserReservations(int userId, int page, string? status = null, string? searchToken = null)
    {
        var query = BuildFilteredQuery(status, searchToken, userId);

        var reservations = await query.OrderByDescending(r => r.CreatedAt)
            .Skip(USER_PAGE_SIZE * (page - 1))
            .Take(USER_PAGE_SIZE)
            .ToListAsync();

        return await EnrichReservations(reservations, userId);
    }

    public async Task<int> GetUserReservationsPageCount(int userId, string? status = null, string? searchToken = null)
    {
        var query = BuildFilteredQuery(status, searchToken, userId);
        var count = await query.CountAsync();
        return (int)Math.Ceiling(count / (double)USER_PAGE_SIZE);
    }

    public async Task<bool> HandleTaken(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation != null)
        {
            reservation.Status = "Taken";
            await _context.SaveChangesAsync();
            await SendStatusNotification(id, "Taken");
            return true;
        }
        return false;
    }

    public async Task<bool> HandleReturned(int id, HandleReturnRequest request)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation != null)
        {
            reservation.Status = "Returned";
            reservation.ReturnedDate = DateTime.UtcNow;
            reservation.BookConditionUponReturn = request.BookConditionUponReturn;
            reservation.AdditionalNote = request.AdditionalNote;
            await _context.SaveChangesAsync();
            await SendStatusNotification(id, "Returned");
            return true;
        }
        return false;
    }

    public async Task<bool> UpdateStatus(int id, string status)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation != null)
        {
            reservation.Status = status;
            await _context.SaveChangesAsync();
            await SendStatusNotification(id, status);
            return true;
        }
        return false;
    }

    public async Task<IList<ReservationResponse>> GetAllReservations(int page, string? status = null, string? searchToken = null)
    {
        var query = BuildFilteredQuery(status, searchToken);

        var reservations = await query.OrderByDescending(r => r.CreatedAt)
            .Skip(ADMIN_PAGE_SIZE * (page - 1))
            .Take(ADMIN_PAGE_SIZE)
            .ToListAsync();

        return await EnrichReservations(reservations);
    }

    public async Task<int> GetAllReservationsPageCount(string? status = null, string? searchToken = null)
    {
        var query = BuildFilteredQuery(status, searchToken);
        var count = await query.CountAsync();
        return (int)Math.Ceiling(count / (double)ADMIN_PAGE_SIZE);
    }

    public async Task<IList<ReservationResponse>> GetReservationsByBookUnit(int bookUnitId)
    {
        var reservations = await _context.Reservations.Where(r => r.BookUnitId == bookUnitId).OrderByDescending(r => r.CreatedAt).ToListAsync();
        return await EnrichReservations(reservations);
    }

    private IQueryable<ReservationModel> BuildFilteredQuery(string? status, string? searchToken, int? userId = null)
    {
        var query = _context.Reservations.AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(r => r.UserId == userId);
        }

        if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
        {
            query = query.Where(r => r.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(searchToken))
        {
            query = query
                .Join(_context.Users, r => r.UserId, u => u.Id, (r, u) => new { r, u })
                .Join(_context.BookUnits, ru => ru.r.BookUnitId, bu => bu.Id, (ru, bu) => new { ru.r, ru.u, bu })
                .Join(_context.Books, rubu => rubu.bu.BookId, b => b.Id, (rubu, b) => new { rubu.r, rubu.u, rubu.bu, b })
                .Where(x => (x.u.Name != null && EF.Functions.ILike(x.u.Name, $"%{searchToken}%")) ||
                            EF.Functions.ILike(x.u.Email, $"%{searchToken}%") ||
                            EF.Functions.ILike(x.b.Title, $"%{searchToken}%"))
                .Select(x => x.r);
        }

        return query;
    }

    private async Task<IList<ReservationResponse>> EnrichReservations(List<ReservationModel> reservations, int? currentUserId = null)
    {
        var unitIds = reservations.Select(r => r.BookUnitId).Distinct().ToList();
        var units = await _context.BookUnits.Where(bu => unitIds.Contains(bu.Id)).ToDictionaryAsync(bu => bu.Id);

        var bookIds = units.Values.Select(bu => bu.BookId).Distinct().ToList();
        var books = await _context.Books
            .Include(b => b.Author)
            .Where(b => bookIds.Contains(b.Id))
            .ToDictionaryAsync(b => b.Id);

        var userIds = reservations.Select(r => r.UserId).Distinct().ToList();
        var users = await _context.Users.Where(u => userIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id);

        var reviewedBooks = new List<int>();
        if (currentUserId.HasValue)
        {
            reviewedBooks = await _context.Reviews
                .Where(r => r.UserId == currentUserId.Value)
                .Select(r => r.BookId)
                .ToListAsync();
        }

        var result = new List<ReservationResponse>();
        foreach (var r in reservations)
        {
            var u = users.GetValueOrDefault(r.UserId);
            var bu = units.GetValueOrDefault(r.BookUnitId);
            var b = bu != null ? books.GetValueOrDefault(bu.BookId) : null;

            var clientName = string.Empty;
            if (u != null)
            {
                clientName = !string.IsNullOrWhiteSpace(u.Name) ? u.Name : u.Email;
            }
            if (string.IsNullOrWhiteSpace(clientName))
            {
                clientName = "Unknown";
            }

            result.Add(new ReservationResponse(
                r.Id,
                r.BookUnitId,
                r.UserId,
                r.StartDate,
                r.EndDate,
                r.ReturnedDate,
                r.BookConditionUponReturn,
                r.Status,
                r.RepurchasePrice,
                r.CreatedAt,
                r.AdditionalNote,
                clientName,
                u?.Email ?? string.Empty,
                u?.PhoneNumber ?? "none",
                u?.AvatarImage == null ? null : $"/api/media/users/{u.Id}/avatar",
                bu?.BookId ?? 0,
                b?.Title ?? "Unknown",
                b?.Author?.Name ?? "Unknown",
                b?.Language ?? "Unknown",
                b?.PublicationYear ?? 0,
                b?.CoverImage == null ? null : $"/api/media/books/{b.Id}/cover",
                bu != null && currentUserId.HasValue && reviewedBooks.Contains(bu.BookId)
            ));
        }

        return result;
    }

    public async Task<bool> CancelReservationByUser(int reservationId, int userId)
    {
        var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId && r.UserId == userId);
        if (reservation == null)
        {
            return false;
        }
        if (reservation.Status != "Reserved")
        {
            return false;
        }

        reservation.Status = "Canceled";
        reservation.ReturnedDate = null;
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task SendStatusNotification(int reservationId, string newStatus)
    {
        var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId);
        if (reservation == null)
        {
            return;
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == reservation.UserId);
        if (user == null)
        {
            return;
        }

        var bookUnit = await _context.BookUnits.FirstOrDefaultAsync(bu => bu.Id == reservation.BookUnitId);
        var book = bookUnit != null ? await _context.Books.FirstOrDefaultAsync(b => b.Id == bookUnit.BookId) : null;
        var bookTitle = book?.Title ?? "Unknown";

        var subject = $"Reservation status updated: {newStatus}";
        var text = $"Your reservation for \"{bookTitle}\" has been updated to status: {newStatus}.";

        await _notificationService.SendOneUserNotification(reservation.UserId, new NotificationRequest(subject, text));
        _ = _mailService.SendMail(user.Email, subject, text);
    }
}