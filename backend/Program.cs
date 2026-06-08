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
using Microsoft.EntityFrameworkCore;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

var mongoConnectionString =
    config.GetConnectionString("MongoDb")
    ?? config["MongoDbSettings:ConnectionString"];

if (string.IsNullOrWhiteSpace(mongoConnectionString))
{
    throw new InvalidOperationException(
        "MongoDB connection string is missing. Configure MongoDbSettings:ConnectionString or ConnectionStrings:MongoDb.");
}

var mongoClient = new MongoClient(mongoConnectionString);
var db = mongoClient.GetDatabase(config["MongoDbSettings:DatabaseName"]);

var pack = new ConventionPack { new CamelCaseElementNameConvention() };
ConventionRegistry.Register("camel case", pack, t => true);

var pgConnectionString = config.GetConnectionString("PostgreSql");
builder.Services.AddNpgsql<LibraryPlusContext>(pgConnectionString);

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
builder.Services.AddSingleton(db);

builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<JwtService>();
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

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<LibraryPlusContext>();
    context.Database.EnsureCreated();
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
