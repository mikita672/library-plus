using LibraryPlus.Models;
using LibraryPlus.Models.Book;
using LibraryPlus.Models.User;
using LibraryPlus.Services.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.IO;

namespace LibraryPlus.Services;

public class DbInitializer
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LibraryPlusContext>();
        var storageService = scope.ServiceProvider.GetRequiredService<IObjectStorageService>();
        var httpClient = scope.ServiceProvider.GetRequiredService<HttpClient>();

        context.Database.EnsureCreated();

        var adminId = "00000000-0000-0000-0000-000000000000";
        var admin = await context.Users.FindAsync(adminId);
        if (admin == null)
        {
            admin = new UserModel
            {
                Id = adminId,
                Email = "admin@admin.com",
                Name = "Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"),
                JoinedAt = DateTime.UtcNow,
                IsAdmin = true,
                IsDeleted = false
            };
            context.Users.Add(admin);
            Console.WriteLine("Admin user created.");
        }

        if (!await context.Categories.AnyAsync())
        {
            var categoriesList = new List<CategoryModel>();
            string[] categoryNames = { "Fiction", "Science Fiction", "Fantasy", "Mystery", "Biography", "History", "Science", "Technology", "Business", "Health", "Travel", "Poetry", "Drama", "Horror", "Self-Help", "Philosophy", "Religion", "Art", "Music", "Cookbooks" };
            foreach (var name in categoryNames)
            {
                categoriesList.Add(new CategoryModel { Id = Guid.NewGuid().ToString(), Name = name });
            }
            context.Categories.AddRange(categoriesList);
            Console.WriteLine($"Seeded {categoriesList.Count} categories.");
        }

        if (!await context.Authors.AnyAsync())
        {
            var authorsList = new List<AuthorModel>();
            for (int i = 1; i <= 100; i++)
            {
                authorsList.Add(new AuthorModel { Id = Guid.NewGuid().ToString(), Name = $"Author {i}" });
            }
            context.Authors.AddRange(authorsList);
            Console.WriteLine($"Seeded {authorsList.Count} authors.");
        }

        if (!await context.Publishers.AnyAsync())
        {
            var publishersList = new List<PublisherModel>();
            for (int i = 1; i <= 50; i++)
            {
                publishersList.Add(new PublisherModel { Id = Guid.NewGuid().ToString(), Name = $"Publisher {i}" });
            }
            context.Publishers.AddRange(publishersList);
            Console.WriteLine($"Seeded {publishersList.Count} publishers.");
        }

        await context.SaveChangesAsync();

        byte[]? sharedCoverBytes = null;
        try
        {
            Console.WriteLine("Attempting to download shared seed image...");
            sharedCoverBytes = await httpClient.GetByteArrayAsync("https://picsum.photos/400/600");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to download seed image: {ex.Message}");
        }

        if (await context.Books.CountAsync() < 1000)
        {
            var authors = await context.Authors.ToListAsync();
            var publishers = await context.Publishers.ToListAsync();
            var categories = await context.Categories.ToListAsync();
            var random = new Random();
            var books = new List<BookModel>();
            var bookUnits = new List<BookUnitModel>();
            var images = new List<ImageModel>();

            Console.WriteLine("Seeding 2000 books with unique image IDs...");
            for (int i = 1; i <= 2000; i++)
            {
                var author = authors[random.Next(authors.Count)];
                var publisher = publishers[random.Next(publishers.Count)];
                var bookCategories = categories.OrderBy(x => random.Next()).Take(random.Next(1, 4)).Select(c => c.Id).ToList();

                var imageId = Guid.NewGuid().ToString();
                var extension = ".jpg";
                var key = $"covers/{imageId}{extension}";

                var book = new BookModel
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = $"Book Title {i}",
                    Description = $"Description for Book {i}. This is a seeded book for testing purposes.",
                    AuthorId = author.Id,
                    PublisherId = publisher.Id,
                    Language = random.Next(2) == 0 ? "English" : "Polish",
                    PublicationYear = random.Next(1900, 2025),
                    PagesCount = random.Next(100, 1000),
                    CategoryIds = bookCategories,
                    RepurchasePrice = (decimal)(random.NextDouble() * 100 + 10),
                    Popularity = random.Next(0, 500),
                    CoverImageId = imageId,
                    CreatedAt = DateTime.UtcNow
                };
                books.Add(book);

                images.Add(new ImageModel
                {
                    Id = imageId,
                    StorageKey = key,
                    ContentType = "image/jpeg"
                });

                if (i <= 10 && sharedCoverBytes != null)
                {
                    using var ms = new MemoryStream(sharedCoverBytes);
                    await storageService.UploadAsync(key, ms, "image/jpeg");
                }

                int unitsCount = random.Next(1, 6);
                for (int j = 0; j < unitsCount; j++)
                {
                    bookUnits.Add(new BookUnitModel { Id = Guid.NewGuid().ToString(), BookId = book.Id, IsArchived = false });
                }

                if (i % 500 == 0)
                {
                    context.Images.AddRange(images);
                    context.Books.AddRange(books);
                    context.BookUnits.AddRange(bookUnits);
                    await context.SaveChangesAsync();
                    images.Clear();
                    books.Clear();
                    bookUnits.Clear();
                    Console.WriteLine($"Seeded {i} books...");
                }
            }

            if (books.Count > 0)
            {
                context.Images.AddRange(images);
                context.Books.AddRange(books);
                context.BookUnits.AddRange(bookUnits);
                await context.SaveChangesAsync();
            }
        }
    }
}
