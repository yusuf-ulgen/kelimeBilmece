using Caterpillar.Api.Models;
using System.Text.Json;
using System.Net.Http;
using System.Globalization;

namespace Caterpillar.Api.Services;

public class DictionaryService
{
    private readonly Dictionary<string, (HashSet<string> Words, Dictionary<string, string> Definitions)> _categories = new();
    private readonly Dictionary<string, string> _apiCache = new(StringComparer.OrdinalIgnoreCase);
    private readonly HttpClient _httpClient = new();
    private static readonly CultureInfo TrCulture = new("tr-TR");

    public DictionaryService()
    {
        InitializeDictionary();
    }

    private void InitializeDictionary()
    {
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "dictionary.json");
        if (File.Exists(filePath))
        {
            var json = File.ReadAllText(filePath);
            var parsedData = JsonSerializer.Deserialize<Dictionary<string, List<string>>>(json);

            if (parsedData != null)
            {
                foreach (var kvp in parsedData)
                {
                    _categories[kvp.Key] = (
                        new HashSet<string>(kvp.Value, StringComparer.OrdinalIgnoreCase),
                        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                    );
                }
            }
        }
    }

    public async Task<(bool Valid, string? Definition)> ValidateAndGetDefinitionAsync(string category, string word)
    {
        // 0. Turkish culture aware lowercasing
        string searchWord = word.Trim().ToLower(TrCulture);

        // 1. Yerel Sözlük Kontrolü
        var cat = _categories.ContainsKey(category) ? _categories[category] : _categories["Genel"];
        if (cat.Words.Contains(searchWord))
        {
            cat.Definitions.TryGetValue(searchWord, out string? localDef);
            return (true, localDef);
        }

        // 2. API Önbellek Kontrolü
        if (_apiCache.TryGetValue(searchWord, out string? cachedDef))
        {
            return (true, cachedDef);
        }

        // 3. TDK API Kontrolü
        var result = await TryFetchFromTdk(searchWord);
        
        // 4. Fallbacks for common failures
        if (!result.Valid)
        {
            // Case 1: Split words (e.g., elalem -> el alem)
            if (searchWord == "elalem") 
                result = await TryFetchFromTdk("el alem");
            
            // Case 2: Proper nouns or TDK specific capitalization
            if (!result.Valid)
                result = await TryFetchFromTdk(char.ToUpper(searchWord[0], TrCulture) + searchWord[1..]);
        }

        if (result.Valid)
        {
            _apiCache[searchWord] = result.Definition ?? "Tanım bulunamadı.";
        }

        return result;
    }

    private async Task<(bool Valid, string? Definition)> TryFetchFromTdk(string word)
    {
        try
        {
            // Standard headers to avoid 403 Forbidden
            using var request = new HttpRequestMessage(HttpMethod.Get, $"https://sozluk.gov.tr/gts?ara={Uri.EscapeDataString(word)}");
            request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
            request.Headers.Add("Accept", "application/json, text/plain, */*");
            request.Headers.Add("Referer", "https://sozluk.gov.tr/");
            
            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                
                // TDK returns an array on success, but might return non-array JSON for error
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
                {
                    var firstMatch = doc.RootElement[0];
                    string? definition = null;
                    
                    if (firstMatch.TryGetProperty("anlamlarListe", out var anlamlar) && anlamlar.GetArrayLength() > 0)
                    {
                        var firstAnlam = anlamlar[0];
                        if (firstAnlam.TryGetProperty("anlam", out var anlamProp))
                        {
                            definition = anlamProp.GetString();
                        }
                    }

                    return (true, definition);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"TDK API Error for '{word}': {ex.Message}");
        }
        return (false, null);
    }

    public List<string> GetCategories() => _categories.Keys.ToList();

    public string GetRandomWord(string category)
    {
        var cat = _categories.ContainsKey(category) ? _categories[category] : _categories["Genel"];
        var rnd = new Random();
        return cat.Words.ElementAt(rnd.Next(cat.Words.Count));
    }

    public string? GetHintWord(string category, char startingLetter, List<string> usedWords)
    {
        var cat = _categories.ContainsKey(category) ? _categories[category] : _categories["Genel"];
        var available = cat.Words.Where(w => 
            w.StartsWith(startingLetter.ToString(), StringComparison.OrdinalIgnoreCase) && 
            !usedWords.Contains(w, StringComparer.OrdinalIgnoreCase)
        ).ToList();

        if (available.Count == 0) return null;
        
        return available[new Random().Next(available.Count)];
    }
}
