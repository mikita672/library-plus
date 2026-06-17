using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Models.User;
using LibraryPlus.Models.Reservation;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace LibraryPlus.Services;

public class DbInitializer
{
    private record SeedBook(string Title, string Author, string Publisher, string Language, int Year, int Pages, decimal Price, string[] Categories, string Description);

    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LibraryPlusContext>();

        context.Database.EnsureCreated();

        try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE \"Books\" ADD COLUMN IF NOT EXISTS \"IsActive\" boolean NOT NULL DEFAULT true;"); } catch {}
        try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE \"Authors\" ADD COLUMN IF NOT EXISTS \"IsActive\" boolean NOT NULL DEFAULT true;"); } catch {}
        try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE \"Categories\" ADD COLUMN IF NOT EXISTS \"IsActive\" boolean NOT NULL DEFAULT true;"); } catch {}
        try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE \"Publishers\" ADD COLUMN IF NOT EXISTS \"IsActive\" boolean NOT NULL DEFAULT true;"); } catch {}

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
                JoinedAt = DateTime.UtcNow.AddMonths(-13),
                IsAdmin = true,
                IsDeleted = false
            };
            context.Users.Add(admin);
            await context.SaveChangesAsync();
        }

        var exampleUsers = new List<UserModel>();
        for (int i = 1; i <= 6; i++)
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
                    JoinedAt = DateTime.UtcNow.AddMonths(-13),
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
            new("Tender Is the Night", "F. Scott Fitzgerald", "Scribner", "English", 1934, 315, 14.50m, new[] { "Fiction", "Classics" }, "The tragic story of Dick Diver and his wife, Nicole."),
            new("This Side of Paradise", "F. Scott Fitzgerald", "Scribner", "English", 1920, 276, 12.99m, new[] { "Fiction", "Classics" }, "A novel about post-World War I youth and their morality."),
            new("The Beautiful and Damned", "F. Scott Fitzgerald", "Scribner", "English", 1922, 345, 13.50m, new[] { "Fiction", "Classics" }, "A portrait of the Eastern elite during the Jazz Age."),
            new("Flappers and Philosophers", "F. Scott Fitzgerald", "Scribner", "English", 1920, 163, 10.99m, new[] { "Fiction", "Short Stories" }, "A collection of eight short stories."),


            new("1984", "George Orwell", "Secker & Warburg", "English", 1949, 328, 12.50m, new[] { "Fiction", "Science Fiction", "Dystopian" }, "A chilling prophecy about the future of a totalitarian society."),
            new("Animal Farm", "George Orwell", "Secker & Warburg", "English", 1945, 112, 9.99m, new[] { "Fiction", "Dystopian" }, "A satirical allegorical novella about the Russian Revolution."),
            new("Homage to Catalonia", "George Orwell", "Secker & Warburg", "English", 1938, 232, 14.00m, new[] { "Non-Fiction", "History" }, "Orwell's personal account of his experiences in the Spanish Civil War."),
            new("Down and Out in Paris and London", "George Orwell", "Victor Gollancz Ltd", "English", 1933, 213, 11.50m, new[] { "Non-Fiction", "Memoir" }, "A memoir of poverty in two major European cities."),
            new("Burmese Days", "George Orwell", "Harper & Brothers", "English", 1934, 300, 13.99m, new[] { "Fiction", "Classics" }, "A tale of the waning days of British imperialism."),


            new("The Hobbit", "J.R.R. Tolkien", "George Allen & Unwin", "English", 1937, 310, 20.00m, new[] { "Fantasy", "Adventure" }, "Bilbo Baggins' epic journey to reclaim a lost treasure."),
            new("The Fellowship of the Ring", "J.R.R. Tolkien", "George Allen & Unwin", "English", 1954, 423, 22.00m, new[] { "Fantasy", "Adventure" }, "The first volume of The Lord of the Rings."),
            new("The Two Towers", "J.R.R. Tolkien", "George Allen & Unwin", "English", 1954, 352, 22.00m, new[] { "Fantasy", "Adventure" }, "The second volume of The Lord of the Rings."),
            new("The Return of the King", "J.R.R. Tolkien", "George Allen & Unwin", "English", 1955, 416, 22.00m, new[] { "Fantasy", "Adventure" }, "The third volume of The Lord of the Rings."),
            new("The Silmarillion", "J.R.R. Tolkien", "George Allen & Unwin", "English", 1977, 365, 25.00m, new[] { "Fantasy", "Mythology" }, "A collection of mythopoeic works."),


            new("Pride and Prejudice", "Jane Austen", "T. Egerton", "English", 1813, 279, 10.99m, new[] { "Fiction", "Classics", "Romance" }, "A classic tale of manners, upbringing, and marriage in the 19th century."),
            new("Sense and Sensibility", "Jane Austen", "T. Egerton", "English", 1811, 352, 11.50m, new[] { "Fiction", "Classics", "Romance" }, "The story of the Dashwood sisters."),
            new("Emma", "Jane Austen", "John Murray", "English", 1815, 474, 12.99m, new[] { "Fiction", "Classics", "Romance" }, "A novel about youthful hubris and romantic misunderstandings."),
            new("Persuasion", "Jane Austen", "John Murray", "English", 1817, 249, 10.50m, new[] { "Fiction", "Classics", "Romance" }, "Austen's last completed novel."),
            new("Northanger Abbey", "Jane Austen", "John Murray", "English", 1817, 244, 9.99m, new[] { "Fiction", "Classics", "Gothic" }, "A satire of Gothic novels."),


            new("Crime and Punishment", "Fyodor Dostoevsky", "The Russian Messenger", "English", 1866, 671, 18.50m, new[] { "Fiction", "Classics", "Philosophy" }, "A psychological thriller about guilt and redemption."),
            new("The Brothers Karamazov", "Fyodor Dostoevsky", "The Russian Messenger", "English", 1880, 796, 22.00m, new[] { "Fiction", "Classics", "Philosophy" }, "A passionate philosophical novel set in 19th-century Russia."),
            new("The Idiot", "Fyodor Dostoevsky", "The Russian Messenger", "English", 1869, 615, 19.50m, new[] { "Fiction", "Classics", "Philosophy" }, "The story of Prince Myshkin, a truly good man."),
            new("Notes from Underground", "Fyodor Dostoevsky", "Epoch", "English", 1864, 136, 9.99m, new[] { "Fiction", "Classics", "Philosophy" }, "One of the first existentialist novels."),
            new("Demons", "Fyodor Dostoevsky", "The Russian Messenger", "English", 1872, 714, 21.00m, new[] { "Fiction", "Classics", "Philosophy" }, "A tragic satire of political radicalism."),


            new("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "Bloomsbury", "English", 1997, 309, 15.00m, new[] { "Fantasy", "Adventure", "Children" }, "A young boy discovers he is a wizard."),
            new("Harry Potter and the Chamber of Secrets", "J.K. Rowling", "Bloomsbury", "English", 1998, 341, 16.00m, new[] { "Fantasy", "Adventure", "Children" }, "Harry's second year at Hogwarts."),
            new("Harry Potter and the Prisoner of Azkaban", "J.K. Rowling", "Bloomsbury", "English", 1999, 435, 17.00m, new[] { "Fantasy", "Adventure", "Children" }, "Harry's third year at Hogwarts."),
            new("Harry Potter and the Goblet of Fire", "J.K. Rowling", "Bloomsbury", "English", 2000, 734, 20.00m, new[] { "Fantasy", "Adventure", "Children" }, "Harry's fourth year at Hogwarts and the Triwizard Tournament."),
            new("Harry Potter and the Order of the Phoenix", "J.K. Rowling", "Bloomsbury", "English", 2003, 870, 25.00m, new[] { "Fantasy", "Adventure", "Children" }, "Harry's fifth year at Hogwarts and the return of Voldemort.")
        };

        var categoryMap = new Dictionary<string, CategoryModel>();
        var authorMap = new Dictionary<string, AuthorModel>();
        var publisherMap = new Dictionary<string, PublisherModel>();

        Console.WriteLine($"Starting seeding of {seedBooks.Count} books...");

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

            var bookCategories = new List<CategoryModel>();
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
                bookCategories.Add(category);
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
                Categories = bookCategories,
                RepurchasePrice = sb.Price,
                Popularity = new Random().Next(10, 500),
                CoverImage = null,
                CoverImageContentType = null,
                CreatedAt = DateTime.UtcNow
            };
            context.Books.Add(book);
            await context.SaveChangesAsync();

            for (int j = 0; j < 5; j++)
            {
                context.BookUnits.Add(new BookUnitModel
                {
                    BookId = book.Id,
                    IsArchived = false
                });
            }
        }
        await context.SaveChangesAsync();

        var bookUnits = await context.BookUnits.ToListAsync();
        var allBooks = await context.Books.ToListAsync();
        var random = new Random();
        var now = DateTime.UtcNow;


        for (int monthOffset = 12; monthOffset >= 0; monthOffset--)
        {
            int rentalsThisMonth = random.Next(1, 3);
            for (int r = 0; r < rentalsThisMonth; r++)
            {
                var randomUser = exampleUsers[random.Next(exampleUsers.Count)];
                var randomUnit = bookUnits[random.Next(bookUnits.Count)];

                int daysInMonth = DateTime.DaysInMonth(now.AddMonths(-monthOffset).Year, now.AddMonths(-monthOffset).Month);
                var startDate = new DateTime(now.AddMonths(-monthOffset).Year, now.AddMonths(-monthOffset).Month, random.Next(1, daysInMonth + 1));

                if (startDate > now)
                {
                    startDate = now.AddDays(-1);
                }

                var endDate = startDate.AddDays(random.Next(14, 30));

                var returnedDate = startDate.AddDays(random.Next(1, 28));
                if (returnedDate > now)
                {
                    returnedDate = now.AddDays(-1);
                }

                var condition = random.NextDouble() > 0.8 ? "Minor Damages" : "Good";

                var reservation = new ReservationModel
                {
                    UserId = randomUser.Id,
                    BookUnitId = randomUnit.Id,
                    Status = "Returned",
                    StartDate = startDate.ToUniversalTime(),
                    EndDate = endDate.ToUniversalTime(),
                    CreatedAt = startDate.ToUniversalTime(),
                    ReturnedDate = returnedDate.ToUniversalTime(),
                    BookConditionUponReturn = condition,
                    RepurchasePrice = allBooks.First(b => b.Id == randomUnit.BookId).RepurchasePrice
                };
                context.Reservations.Add(reservation);
            }
        }
        await context.SaveChangesAsync();

        var reviewsTexts = new[] {
            "Great book, really enjoyed it!",
            "It was okay, a bit slow in the middle.",
            "Absolutely phenomenal, couldn't put it down.",
            "Not really my cup of tea.",
            "A classic for a reason. Highly recommend.",
            "Interesting perspective, well written.",
            "A bit confusing at times but overall good.",
            "Masterpiece!"
        };


        foreach (var b in allBooks)
        {
            int reviewCount = random.Next(1, 7);
            var usersToReview = exampleUsers.OrderBy(x => random.Next()).Take(reviewCount).ToList();

            foreach (var user in usersToReview)
            {

                var userReservationsForBook = await context.Reservations
                    .Where(r => r.UserId == user.Id && r.ReturnedDate != null)
                    .Select(r => r.BookUnitId)
                    .ToListAsync();

                var bookUnitIds = bookUnits.Where(u => u.BookId == b.Id).Select(u => u.Id).ToList();

                if (!userReservationsForBook.Intersect(bookUnitIds).Any())
                {

                    var dummyUnit = bookUnits.First(u => u.BookId == b.Id);
                    var dummyStartDate = now.AddDays(-60);
                    context.Reservations.Add(new ReservationModel {
                        UserId = user.Id,
                        BookUnitId = dummyUnit.Id,
                        Status = "Returned",
                        StartDate = dummyStartDate,
                        EndDate = dummyStartDate.AddDays(14),
                        CreatedAt = dummyStartDate,
                        ReturnedDate = dummyStartDate.AddDays(10),
                        BookConditionUponReturn = "Good",
                        RepurchasePrice = b.RepurchasePrice
                    });
                    await context.SaveChangesAsync();
                }

                var review = new ReviewModel
                {
                    BookId = b.Id,
                    UserId = user.Id,
                    Rating = random.Next(3, 6), 
                    ReviewText = reviewsTexts[random.Next(reviewsTexts.Length)],
                    CreatedAt = now.AddDays(-random.Next(1, 100))
                };
                context.Reviews.Add(review);
            }
        }
        await context.SaveChangesAsync();

        Console.WriteLine("Seeding completed successfully.");
    }
}
