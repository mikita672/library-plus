using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Models.User;
using LibraryPlus.Models.Reservation;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.IO;

namespace LibraryPlus.Services;

public class DbInitializer
{
    private record SeedBook(string Title, string Author, string Publisher, string Language, int Year, int Pages, decimal Price, string[] Categories, string Description);

    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LibraryPlusContext>();
        var httpClient = scope.ServiceProvider.GetRequiredService<HttpClient>();

        context.Database.EnsureCreated();

        if (await context.Books.AnyAsync())
        {
            return;
        }

        var adminEmail = "admin@admin.com";
        var admin = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (admin == null)
        {
            admin = new UserModel
            {
                Email = adminEmail,
                Name = "Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"),
                JoinedAt = DateTime.UtcNow,
                IsAdmin = true,
                IsDeleted = false
            };
            context.Users.Add(admin);
            await context.SaveChangesAsync();
        }

        var exampleUsers = new List<UserModel>();
        for (int i = 1; i <= 3; i++)
        {
            var userEmail = $"user{i}@example.com";
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null)
            {
                user = new UserModel
                {
                    Email = userEmail,
                    Name = $"Example User {i}",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                    JoinedAt = DateTime.UtcNow.AddDays(-60),
                    IsAdmin = false,
                    IsDeleted = false
                };
                context.Users.Add(user);
            }
            exampleUsers.Add(user);
        }
        await context.SaveChangesAsync();


        var seedBooks = new List<SeedBook>
        {
            new("The Great Gatsby", "F. Scott Fitzgerald", "Scribner", "English", 1925, 180, 15.99m, new[] { "Fiction", "Classics" }, "A story of wealth, love, and the American Dream in the 1920s."),
            new("1984", "George Orwell", "Secker & Warburg", "English", 1949, 328, 12.50m, new[] { "Fiction", "Science Fiction", "Dystopian" }, "A chilling prophecy about the future of a totalitarian society."),
            new("To Kill a Mockingbird", "Harper Lee", "J.B. Lippincott & Co.", "English", 1960, 281, 14.00m, new[] { "Fiction", "Classics" }, "A powerful story of racial injustice and the loss of innocence."),
            new("The Hobbit", "J.R.R. Tolkien", "George Allen & Unwin", "English", 1937, 310, 20.00m, new[] { "Fantasy", "Adventure" }, "Bilbo Baggins' epic journey to reclaim a lost treasure."),
            new("Pride and Prejudice", "Jane Austen", "T. Egerton", "English", 1813, 279, 10.99m, new[] { "Fiction", "Classics", "Romance" }, "A classic tale of manners, upbringing, and marriage in the 19th century."),
            new("The Catcher in the Rye", "J.D. Salinger", "Little, Brown and Company", "English", 1951, 234, 13.50m, new[] { "Fiction", "Classics" }, "Holden Caulfield's journey through New York City."),
            new("Brave New World", "Aldous Huxley", "Chatto & Windus", "English", 1932, 268, 14.95m, new[] { "Science Fiction", "Dystopian" }, "A vision of a futuristic society controlled by technology."),
            new("The Alchemist", "Paulo Coelho", "HarperTorch", "English", 1988, 208, 16.00m, new[] { "Fiction", "Philosophy" }, "A fable about following your dreams."),
            new("Crime and Punishment", "Fyodor Dostoevsky", "The Russian Messenger", "English", 1866, 671, 18.50m, new[] { "Fiction", "Classics", "Philosophy" }, "A psychological thriller about guilt and redemption."),
            new("The Witcher: The Last Wish", "Andrzej Sapkowski", "SuperNowa", "Polish", 1993, 288, 22.00m, new[] { "Fantasy" }, "Introduces Geralt of Rivia, a monster hunter known as a Witcher."),
            new("Dune", "Frank Herbert", "Chilton Books", "English", 1965, 412, 25.00m, new[] { "Science Fiction" }, "Epic sci-fi set on the desert planet Arrakis."),
            new("The Da Vinci Code", "Dan Brown", "Doubleday", "English", 2003, 454, 19.99m, new[] { "Mystery", "Thriller" }, "A murder in the Louvre leads to a religious mystery."),
            new("Harry Potter and the Philosopher's Stone", "J.K. Rowling", "Bloomsbury", "English", 1997, 223, 21.00m, new[] { "Fantasy", "Adventure" }, "A young boy discovers he is a wizard."),
            new("Fahrenheit 451", "Ray Bradbury", "Ballantine Books", "English", 1953, 158, 11.00m, new[] { "Science Fiction", "Dystopian" }, "A world where books are banned and burned."),
            new("The Little Prince", "Antoine de Saint-Exupéry", "Reynal & Hitchcock", "French", 1943, 96, 9.99m, new[] { "Fiction", "Philosophy", "Children" }, "A young prince visits various planets in space."),
            new("Moby-Dick", "Herman Melville", "Richard Bentley", "English", 1851, 635, 17.00m, new[] { "Fiction", "Adventure", "Classics" }, "The voyage of the whaling ship Pequod."),
            new("War and Peace", "Leo Tolstoy", "The Russian Messenger", "English", 1869, 1225, 30.00m, new[] { "Fiction", "History", "Classics" }, "The French invasion of Russia and its impact on Tsarist society."),
            new("The Shadow of the Wind", "Carlos Ruiz Zafón", "Planeta", "Spanish", 2001, 487, 18.00m, new[] { "Fiction", "Mystery" }, "A young boy is taken to the Cemetery of Forgotten Books."),
            new("Solaris", "Stanisław Lem", "MON", "Polish", 1961, 204, 15.00m, new[] { "Science Fiction", "Philosophy" }, "Scientists study a mysterious living ocean on a distant planet."),
            new("The Name of the Rose", "Umberto Eco", "Bompiani", "Italian", 1980, 502, 20.00m, new[] { "Mystery", "History" }, "A murder mystery set in a 14th-century Italian monastery.")
        };

        var categoryMap = new Dictionary<string, CategoryModel>();
        var authorMap = new Dictionary<string, AuthorModel>();
        var publisherMap = new Dictionary<string, PublisherModel>();

        Console.WriteLine($"Starting seeding of {seedBooks.Count} realistic books...");

        foreach (var sb in seedBooks)
        {
            if (!authorMap.TryGetValue(sb.Author, out var author))
            {
                author = await context.Authors.FirstOrDefaultAsync(a => a.Name == sb.Author);
                if (author == null)
                {
                    author = new AuthorModel { Name = sb.Author };
                    context.Authors.Add(author);
                    await context.SaveChangesAsync();
                }
                authorMap[sb.Author] = author;
            }

            if (!publisherMap.TryGetValue(sb.Publisher, out var publisher))
            {
                publisher = await context.Publishers.FirstOrDefaultAsync(p => p.Name == sb.Publisher);
                if (publisher == null)
                {
                    publisher = new PublisherModel { Name = sb.Publisher };
                    context.Publishers.Add(publisher);
                    await context.SaveChangesAsync();
                }
                publisherMap[sb.Publisher] = publisher;
            }

            var bookCategoryIds = new List<int>();
            foreach (var catName in sb.Categories)
            {
                if (!categoryMap.TryGetValue(catName, out var category))
                {
                    category = await context.Categories.FirstOrDefaultAsync(c => c.Name == catName);
                    if (category == null)
                    {
                        category = new CategoryModel { Name = catName };
                        context.Categories.Add(category);
                        await context.SaveChangesAsync();
                    }
                    categoryMap[catName] = category;
                }
                bookCategoryIds.Add(category.Id);
            }

            var book = new BookModel
            {
                Title = sb.Title,
                Description = sb.Description,
                AuthorId = author.Id,
                PublisherId = publisher.Id,
                Language = sb.Language,
                PublicationYear = sb.Year,
                PagesCount = sb.Pages,
                CategoryIds = bookCategoryIds,
                RepurchasePrice = sb.Price,
                Popularity = new Random().Next(10, 500),
                CoverImage = null,
                CoverImageContentType = null,
                CreatedAt = DateTime.UtcNow
            };
            context.Books.Add(book);
            await context.SaveChangesAsync();

            for (int j = 0; j < 3; j++)
            {
                context.BookUnits.Add(new BookUnitModel
                {
                    BookId = book.Id,
                    IsArchived = false
                });
            }

            await context.SaveChangesAsync();
            Console.WriteLine($"Seeded: {sb.Title}");
        }

        var bookUnits = await context.BookUnits.ToListAsync();
        var random = new Random();
        foreach (var user in exampleUsers)
        {
            var userReservations = await context.Reservations.CountAsync(r => r.UserId == user.Id);
            if (userReservations < 6)
            {
                for (int r = 0; r < 6 - userReservations; r++)
                {
                    var randomUnit = bookUnits[random.Next(bookUnits.Count)];
                    var startDate = DateTime.UtcNow.AddDays(-random.Next(1, 30));
                    var endDate = startDate.AddDays(14);
                    
                    var reservation = new ReservationModel
                    {
                        UserId = user.Id,
                        BookUnitId = randomUnit.Id,
                        Status = "Returned",
                        StartDate = startDate,
                        EndDate = endDate,
                        CreatedAt = startDate,
                        ReturnedDate = startDate.AddDays(random.Next(1, 14)),
                        BookConditionUponReturn = "Good"
                    };
                    context.Reservations.Add(reservation);
                }
            }
        }
        await context.SaveChangesAsync();

        Console.WriteLine("Seeding completed successfully.");
    }
}
