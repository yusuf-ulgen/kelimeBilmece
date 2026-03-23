namespace Caterpillar.Api.Models;

public class GameSession
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Category { get; set; } = "General";
    public string Difficulty { get; set; } = "Easy";
    public List<string> UsedWords { get; set; } = new();
    public int Score { get; set; }
    public DateTime LastActivity { get; set; } = DateTime.UtcNow;
}

public class WordValidationRequest
{
    public string SessionId { get; set; } = string.Empty;
    public string Word { get; set; } = string.Empty;
    public string PreviousWord { get; set; } = string.Empty;
}

public class WordValidationResponse
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public int NewScore { get; set; }
    public string? Definition { get; set; }
    public bool IsCombo { get; set; }
    public int BonusPoints { get; set; }
}
