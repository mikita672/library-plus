using LibraryPlus.Models.Book;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Models.User;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Models;

public class LibraryPlusContext : DbContext
{
    public LibraryPlusContext(DbContextOptions<LibraryPlusContext> options) : base(options) { }

    public DbSet<UserModel> Users { get; set; } = null!;
    public DbSet<AuthorModel> Authors { get; set; } = null!;
    public DbSet<BookModel> Books { get; set; } = null!;
    public DbSet<BookUnitModel> BookUnits { get; set; } = null!;
    public DbSet<CategoryModel> Categories { get; set; } = null!;
    public DbSet<PublisherModel> Publishers { get; set; } = null!;
    public DbSet<ReservationModel> Reservations { get; set; } = null!;
    public DbSet<NotificationModel> Notifications { get; set; } = null!;
    public DbSet<UserNotificationModel> UserNotifications { get; set; } = null!;
    public DbSet<ReviewModel> Reviews { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserModel>(entity => {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
        });


        modelBuilder.Entity<AuthorModel>(entity => {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<BookModel>(entity => {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.OriginalPublisher)
                  .WithMany()
                  .HasForeignKey(e => e.OriginalPublisherId);
            entity.HasOne(e => e.Publisher)
                  .WithMany()
                  .HasForeignKey(e => e.PublisherId);
        });

        modelBuilder.Entity<BookUnitModel>(entity => {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<CategoryModel>(entity => {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<PublisherModel>(entity => {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<ReservationModel>(entity => {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<NotificationModel>(entity => {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<UserNotificationModel>(entity => {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<ReviewModel>(entity => {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.BookId, e.UserId }).IsUnique();
        });
    }
}
