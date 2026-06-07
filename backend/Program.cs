using LibraryPlus.Endpoints;
using LibraryPlus.Endpoints.User;
using LibraryPlus.Extensions;
using LibraryPlus.Services.User;
using LibraryPlus.Services.Auth;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using LibraryPlus.Services.Book;
using LibraryPlus.Endpoints.Book;
using LibraryPlus.Endpoints.Reservation;
using LibraryPlus.Services.Reservation;
using LibraryPlus.Services.Mail;
using LibraryPlus.Services.Storage;
using LibraryPlus.Services.Statistics;
using LibraryPlus.Models;
using LibraryPlus.Endpoints.Misc;
using LibraryPlus.Data;
using Microsoft.EntityFrameworkCore;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

var pack = new ConventionPack { new CamelCaseElementNameConvention() };
ConventionRegistry.Register("camel case", pack, t => true);

var mongoConnectionString = config.GetConnectionString("MongoDb") ?? config["MongoDbSettings:ConnectionString"];
if (!string.IsNullOrWhiteSpace(mongoConnectionString))
{
    var mongoClient = new MongoClient(mongoConnectionString);
    var mongoDb = mongoClient.GetDatabase(config["MongoDbSettings:DatabaseName"]);
    builder.Services.AddSingleton(mongoDb);
}

var postgresConnectionString = config.GetConnectionString("Postgres") ?? config["ConnectionStrings:Postgres"];
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(postgresConnectionString));

IMailService mailService;
try
{
    mailService = new GoogleMailService(
        config["Mail:SmtpServer"]!,
        int.Parse(config["Mail:Port"]!),
        config["Mail:Username"]!,
        config["Mail:Password"]!
    );
}
catch
{
    mailService = new DummyMailService();
}

builder.Services.AddHealthChecks();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

builder.Services.AddScoped<UserService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddScoped<RefreshTokenService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<AuthorService>();
builder.Services.AddScoped<PublisherService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<BookService>();
builder.Services.AddScoped<ReservationService>();
builder.Services.AddScoped<StatisticsService>();
builder.Services.AddSingleton<IMailService>(mailService);

builder.Services.Configure<StorageOptions>(config.GetSection(StorageOptions.Storage));
builder.Services.AddSingleton<IObjectStorageService, MinioObjectStorageService>();

builder.Services.AddJwtAuthentication(config);

var app = builder.Build();

for (int i = 0; i < 10; i++)
{
    try
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.EnsureCreatedAsync();
        break;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database connection failed. Attempt {i + 1}/10. Error: {ex.Message}");
        await Task.Delay(2000);
    }
}

app.UseAuthentication();
app.UseAuthorization();
app.UseSwagger();
app.UseSwaggerUI();

app.MapHealthChecks("/healthz");
app.MapAuthEndpoints();
app.MapUserEndpoints();
app.MapNotificationEndpoints();
app.MapAuthorEndpoints();
app.MapPublisherEndpoints();
app.MapCategoryEndpoints();
app.MapBookEndpoints();
app.MapReservationEndpoints();
app.MapMediaEndpoints();
app.MapStatisticsEndpoints();
app.MapMiscEndpoints();

app.Run();
