using System.Text.Json.Serialization;

namespace LibraryPlus.Responses.Misc;

public class OllamaMessage
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
}

public class OllamaResponse
{
    [JsonPropertyName("response")]
    public string? Response { get; set; }

    [JsonPropertyName("message")]
    public OllamaMessage? Message { get; set; }
}
