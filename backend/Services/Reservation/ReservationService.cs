using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Models.User;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Requests.Reservation;
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
        if (totalDays < 14 || totalDays > 30) { return (null, "Reservation period must be between 14 and 30 days."); }

        var bookUnitsForBookIds = await _context.BookUnits.Where(bu => bu.BookId == request.BookId).Select(bu => bu.Id).ToListAsync();
        var existingReservation = await _context.Reservations.FirstOrDefaultAsync(r => r.UserId == userId && r.ReturnedDate == null && bookUnitsForBookIds.Contains(r.BookUnitId));
        if (existingReservation != null) { return (null, "You already have an active reservation for this book."); }

        var bookUnit = await _bookService.GetAvailableBookUnitForBook(request.BookId);
        if (bookUnit == null) { return (null, "No available copies of this book at the moment."); }

        var book = await _bookService.GetBookById(request.BookId);
        if (book == null) { return (null, "Book not found."); }

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

    public async Task<IList<ReservationModel>> GetUserReservations(int userId, int page, string? status = null, string? searchToken = null)
    {
        var query = BuildFilteredQuery(status, searchToken, userId);

        return await query.OrderByDescending(r => r.CreatedAt)
            .Skip(USER_PAGE_SIZE * (page - 1))
            .Take(USER_PAGE_SIZE)
            .ToListAsync();
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

    public async Task<IList<ReservationModel>> GetAllReservations(int page, string? status = null, string? searchToken = null)
    {
        var query = BuildFilteredQuery(status, searchToken);

        return await query.OrderByDescending(r => r.CreatedAt)
            .Skip(ADMIN_PAGE_SIZE * (page - 1))
            .Take(ADMIN_PAGE_SIZE)
            .ToListAsync();
    }

    public async Task<int> GetAllReservationsPageCount(string? status = null, string? searchToken = null)
    {
        var query = BuildFilteredQuery(status, searchToken);
        var count = await query.CountAsync();
        return (int)Math.Ceiling(count / (double)ADMIN_PAGE_SIZE);
    }

    public async Task<IList<ReservationModel>> GetReservationsByBookUnit(int bookUnitId)
    {
        return await _context.Reservations.Where(r => r.BookUnitId == bookUnitId).OrderByDescending(r => r.CreatedAt).ToListAsync();
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
            query = from r in query
                    join u in _context.Users on r.UserId equals u.Id
                    join bu in _context.BookUnits on r.BookUnitId equals bu.Id
                    join b in _context.Books on bu.BookId equals b.Id
                    where (u.Name != null && EF.Functions.ILike(u.Name, $"%{searchToken}%")) ||
                          EF.Functions.ILike(u.Email, $"%{searchToken}%") ||
                          EF.Functions.ILike(b.Title, $"%{searchToken}%")
                    select r;
        }

        return query;
    }

    public async Task<bool> CancelReservationByUser(int reservationId, int userId)
    {
        var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId && r.UserId == userId);
        if (reservation == null) { return false; }
        if (reservation.Status != "Reserved") { return false; }

        reservation.Status = "Returned";
        reservation.ReturnedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task SendStatusNotification(int reservationId, string newStatus)
    {
        var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId);
        if (reservation == null) { return; }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == reservation.UserId);
        if (user == null) { return; }

        var bookUnit = await _context.BookUnits.FirstOrDefaultAsync(bu => bu.Id == reservation.BookUnitId);
        var book = bookUnit != null ? await _context.Books.FirstOrDefaultAsync(b => b.Id == bookUnit.BookId) : null;
        var bookTitle = book?.Title ?? "Unknown";

        var subject = $"Reservation status updated: {newStatus}";
        var text = $"Your reservation for \"{bookTitle}\" has been updated to status: {newStatus}.";

        await _notificationService.SendOneUserNotification(reservation.UserId, new NotificationRequest(subject, text));
        _ = _mailService.SendMail(user.Email, subject, text);
    }
}