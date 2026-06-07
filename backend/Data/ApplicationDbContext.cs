using LibraryPlus.Models.Book;
using LibraryPlus.Models.Reservation;
using LibraryPlus.Models.User;
using Microsoft.EntityFrameworkCore;

namespace LibraryPlus.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<UserModel> Users { get; set; } = null!;
    public DbSet<BookModel> Books { get; set; } = null!;
    public DbSet<BookUnitModel> BookUnits { get; set; } = null!;
    public DbSet<AuthorModel> Authors { get; set; } = null!;
    public DbSet<PublisherModel> Publishers { get; set; } = null!;
    public DbSet<CategoryModel> Categories { get; set; } = null!;
    public DbSet<ReservationModel> Reservations { get; set; } = null!;
    public DbSet<NotificationModel> Notifications { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BookModel>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CategoryIds).HasColumnType("text[]");
        });

        modelBuilder.Entity<UserModel>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<AuthorModel>().HasKey(e => e.Id);
        modelBuilder.Entity<PublisherModel>().HasKey(e => e.Id);
        modelBuilder.Entity<CategoryModel>().HasKey(e => e.Id);
        modelBuilder.Entity<BookUnitModel>().HasKey(e => e.Id);
        modelBuilder.Entity<ReservationModel>().HasKey(e => e.Id);
        modelBuilder.Entity<NotificationModel>().HasKey(e => e.Id);
    }
}