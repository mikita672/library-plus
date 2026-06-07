using System.Security.Claims;
using LibraryPlus.Filters;
using LibraryPlus.Requests.Misc;
using LibraryPlus.Services.User;
using Microsoft.AspNetCore.Authorization;

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

    }
}