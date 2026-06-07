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

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

var pack = new ConventionPack { new CamelCaseElementNameConvention() };
ConventionRegistry.Register("camel case", pack, t => true);
var connectionString =
    config.GetConnectionString("MongoDb")
    ?? config["MongoDbSettings:ConnectionString"];

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "MongoDB connection string is missing. Configure MongoDbSettings:ConnectionString or ConnectionStrings:MongoDb.");
}

var mongoClient = new MongoClient(connectionString);
var db = mongoClient.GetDatabase(config["MongoDbSettings:DatabaseName"]);

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
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<RefreshTokenService>();
builder.Services.AddSingleton<AuthService>();
builder.Services.AddSingleton<NotificationService>();
builder.Services.AddSingleton<AuthorService>();
builder.Services.AddSingleton<PublisherService>();
builder.Services.AddSingleton<CategoryService>();
builder.Services.AddSingleton<BookService>();
builder.Services.AddSingleton<ReservationService>();
builder.Services.AddSingleton<StatisticsService>();
builder.Services.AddSingleton<IMailService>(mailService);

builder.Services.Configure<StorageOptions>(config.GetSection(StorageOptions.Storage));
builder.Services.AddSingleton<IObjectStorageService, MinioObjectStorageService>();

builder.Services.AddJwtAuthentication(config);

var app = builder.Build();

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
