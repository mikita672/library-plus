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

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

var pack = new ConventionPack { new CamelCaseElementNameConvention() };
ConventionRegistry.Register("camel case", pack, t => true);
var connectionString =
    builder.Configuration.GetConnectionString("MongoDb")
    ?? builder.Configuration["MongoDbSettings:ConnectionString"];

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "MongoDB connection string is missing. Configure MongoDbSettings:ConnectionString or ConnectionStrings:MongoDb.");
}

var mongoClient = new MongoClient(connectionString);
var db = mongoClient.GetDatabase(builder.Configuration["MongoDbSettings:DatabaseName"]);

builder.Services.AddHealthChecks();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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

builder.Services.AddJwtAuthentication(builder.Configuration);

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

app.Run();
