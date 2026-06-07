using System.Security.Claims;
using LibraryPlus.Filters;
using LibraryPlus.Requests.Misc;
using LibraryPlus.Services.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryPlus.Endpoints.Misc;

public static class MiscEndpoints
{
    public static void MapMiscEndpoints(this WebApplication app)
    {
        var group = app
            .MapGroup("/api/v1/misc")
            .AddEndpointFilter<ActiveUserFilter>();

        group.MapPost("/contact", [Authorize] async (
            NotificationService notificationService,
            ClaimsPrincipal claims,
            ContactRequest contactRequest
        ) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            await notificationService.SendAdminNotification(userId, contactRequest.Message);
        });

        group.MapPost("/ask-ai", [Authorize] async (
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            IWebHostEnvironment env,
            AskAiRequest request
        ) =>
        {
            var manifestoPath = Path.Combine(env.ContentRootPath, "manifesto.txt");
            var manifesto = await File.ReadAllTextAsync(manifestoPath);

            var systemPrompt = $@"You are a strict library assistant. Answer questions using ONLY the Library Policies below.
Keep your answer extremely short. Do not use conversational filler. Do not be polite. If you do not know the answer, say ""I don't know"".

Library Policies:
{manifesto}";

            var httpClient = httpClientFactory.CreateClient();
            var endpoint = config["Ai:Endpoint"] ?? "http://ai:11434/api/chat";
            if (endpoint.EndsWith("/api/generate")) {
                endpoint = endpoint.Replace("/api/generate", "/api/chat");
            }
            
            var model = config["Ai:Model"] ?? "qwen2.5:1.5b";
            
            var response = await httpClient.PostAsJsonAsync(endpoint, new
            {
                model = model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = request.Question }
                },
                stream = false,
                options = new
                {
                    num_predict = 150,
                    temperature = 0.0
                }
            });

            if (!response.IsSuccessStatusCode)
            {
                var errorText = await response.Content.ReadAsStringAsync();
                return Results.Ok(new { answer = "API Error: " + errorText });
            }

            var result = await response.Content.ReadFromJsonAsync<LibraryPlus.Responses.Misc.OllamaResponse>();
            var answerText = result?.Message?.Content ?? result?.Response ?? "Empty response from AI";
            return Results.Ok(new { answer = answerText });
        });

        group.MapPost("/seed", [Authorize] async (
            LibraryPlus.Data.ApplicationDbContext db,
            UserService userService,
            ClaimsPrincipal claims
        ) =>
        {
            var userId = claims.FindFirstValue("sub")!;
            if (!await userService.IsAdmin(userId)) return Results.Unauthorized();

            var categories = new List<LibraryPlus.Models.Book.CategoryModel>
            {
                new() { Name = "Science Fiction" },
                new() { Name = "Fantasy" },
                new() { Name = "Mystery" },
                new() { Name = "Biography" },
                new() { Name = "History" },
                new() { Name = "Technology" },
                new() { Name = "Philosophy" },
                new() { Name = "Horror" },
                new() { Name = "Romance" },
                new() { Name = "Classic" }
            };
            db.Categories.AddRange(categories);

            var authors = new List<LibraryPlus.Models.Book.AuthorModel>();
            for (int i = 1; i <= 20; i++)
            {
                authors.Add(new LibraryPlus.Models.Book.AuthorModel { Name = $"Author {i}" });
            }
            db.Authors.AddRange(authors);

            var publishers = new List<LibraryPlus.Models.Book.PublisherModel>();
            for (int i = 1; i <= 10; i++)
            {
                publishers.Add(new LibraryPlus.Models.Book.PublisherModel { Name = $"Publisher {i}" });
            }
            db.Publishers.AddRange(publishers);

            await db.SaveChangesAsync();

            var random = new Random();
            var books = new List<LibraryPlus.Models.Book.BookModel>();
            for (int i = 1; i <= 200; i++)
            {
                var author = authors[random.Next(authors.Count)];
                var publisher = publishers[random.Next(publishers.Count)];
                var bookCategories = categories.OrderBy(x => random.Next()).Take(random.Next(1, 4)).Select(c => c.Id).ToList();

                var book = new LibraryPlus.Models.Book.BookModel
                {
                    Title = $"Awesome Book {i}",
                    Description = $"This is a detailed description for Awesome Book {i}. It covers many interesting topics and provides deep insights.",
                    AuthorId = author.Id,
                    PublisherId = publisher.Id,
                    Language = random.Next(2) == 0 ? "English" : "Polish",
                    PublicationYear = random.Next(1950, 2026),
                    PagesCount = random.Next(100, 1000),
                    CategoryIds = bookCategories,
                    RepurchasePrice = (decimal)(random.NextDouble() * 100 + 10),
                    Popularity = random.Next(0, 1000),
                    CreatedAt = DateTime.UtcNow
                };
                books.Add(book);
            }
            db.Books.AddRange(books);
            await db.SaveChangesAsync();

            var units = new List<LibraryPlus.Models.Book.BookUnitModel>();
            foreach (var b in books)
            {
                int copies = random.Next(1, 6);
                for (int j = 0; j < copies; j++)
                {
                    units.Add(new LibraryPlus.Models.Book.BookUnitModel { BookId = b.Id });
                }
            }
            db.BookUnits.AddRange(units);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Database seeded successfully with 200 books, 20 authors, 10 publishers, and 10 categories." });
        }).AddEndpointFilter<AdminUserFilter>();

    }
}