using Microsoft.AspNetCore.Mvc;
using Caterpillar.Api.Models;
using Caterpillar.Api.Services;

namespace Caterpillar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly DictionaryService _dictionaryService;
    private static readonly Dictionary<string, GameSession> _sessions = new();

    public GameController(DictionaryService dictionaryService)
    {
        _dictionaryService = dictionaryService;
    }

    [HttpGet("categories")]
    public IActionResult GetCategories() => Ok(_dictionaryService.GetCategories());

    [HttpPost("start")]
    public IActionResult StartGame([FromQuery] string category = "Genel", [FromQuery] string difficulty = "Easy")
    {
        var session = new GameSession { Category = category, Difficulty = difficulty };
        
        // İlk kelimeyi uygulamadan ver
        var startWord = _dictionaryService.GetRandomWord(category);
        session.UsedWords.Add(startWord);
        
        _sessions[session.Id] = session;
        return Ok(session);
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateWord([FromBody] WordValidationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Word))
            return BadRequest(new WordValidationResponse { IsValid = false, Message = "Boş kelime girilemez." });

        if (!_sessions.TryGetValue(request.SessionId, out var session))
            return NotFound(new WordValidationResponse { IsValid = false, Message = "Oturum bulunamadı." });

        // Kelime zinciri kuralı (Ilk kelime değilse)
        if (!string.IsNullOrEmpty(request.PreviousWord))
        {
            var lastChar = request.PreviousWord.ToLower().Last();
            var firstChar = request.Word.ToLower().First();

            if (lastChar != firstChar)
                return Ok(new WordValidationResponse { IsValid = false, Message = $"Kelime '{lastChar}' harfi ile başlamalı!" });
        }

        // Tekrar kuralı
        if (session.UsedWords.Contains(request.Word.ToLower()))
            return Ok(new WordValidationResponse { IsValid = false, Message = "Bu kelime daha önce kullanıldı." });

        // Sözlük kontrolü ve Anlam alma
        var (isValid, definition) = await _dictionaryService.ValidateAndGetDefinitionAsync(session.Category, request.Word);
        if (!isValid)
            return Ok(new WordValidationResponse { IsValid = false, Message = "Bu kelime sözlükte yok." });

        // Kombo ve Bonus Hesaplama
        var timePassed = (DateTime.UtcNow - session.LastActivity).TotalSeconds;
        int basePoints = 10;
        int bonusPoints = 0;
        bool isCombo = timePassed < 2.5; // 2.5 saniyeden kısa sürede girildiyse kombo

        if (isCombo) bonusPoints += 5;

        // Nadir harf bonusu (J, Ğ, F, V, P)
        char[] rareChars = { 'j', 'ğ', 'f', 'v', 'p' };
        foreach (var c in request.Word.ToLower())
        {
            if (rareChars.Contains(c)) bonusPoints += 3;
        }

        // Başarılı
        session.UsedWords.Add(request.Word.ToLower());
        session.Score += (basePoints + bonusPoints);
        session.LastActivity = DateTime.UtcNow;

        return Ok(new WordValidationResponse 
        { 
            IsValid = true, 
            Message = isCombo ? "PERFECT! +KOMBO" : "Başarılı!", 
            NewScore = session.Score,
            Definition = definition,
            IsCombo = isCombo,
            BonusPoints = bonusPoints
        });
    }

    [HttpGet("hint/{sessionId}")]
    public IActionResult GetHint(string sessionId)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
            return NotFound("Oturum bulunamadı.");

        if (session.UsedWords.Count == 0)
            return BadRequest("Henüz kelime girilmemiş.");

        char lastLetter = session.UsedWords.Last().Last();
        var hint = _dictionaryService.GetHintWord(session.Category, lastLetter, session.UsedWords);

        if (hint == null)
            return NotFound("Bu harf ile başlayan yeni kelime kalmadı!");

        return Ok(new { word = hint });
    }
}
