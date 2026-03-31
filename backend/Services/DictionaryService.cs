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

    public async Task<bool> ValidateWordAsync(string category, string word)
    {
        // 0. Turkish culture aware lowercasing
        string searchWord = word.Trim().ToLower(TrCulture);

        // 1. Yerel Sözlük Kontrolü
        var cat = _categories.ContainsKey(category) ? _categories[category] : _categories["Genel"];
        if (cat.Words.Contains(searchWord))
        {
            return true;
        }

        // 2. API Önbellek Kontrolü (Sadece geçerlilik durumunu sakla)
        if (_apiCache.ContainsKey(searchWord))
        {
            return true;
        }

        // 3. TDK API Kontrolü (Parallel Execution for Speed)
        var tasks = new List<Task<bool>>();
        tasks.Add(TryValidateWithTdk(searchWord));
        
        if (searchWord == "elalem") 
            tasks.Add(TryValidateWithTdk("el alem"));
        
        tasks.Add(TryValidateWithTdk(char.ToUpper(searchWord[0], TrCulture) + searchWord[1..]));

        var results = await Task.WhenAll(tasks);
        bool isValid = results.Any(v => v);

        if (isValid)
        {
            _apiCache[searchWord] = "Valid"; // Sadece varlığını işaretle
            return true;
        }

        return false;
    }

    private async Task<bool> TryValidateWithTdk(string word)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"https://sozluk.gov.tr/gts?ara={Uri.EscapeDataString(word)}");
            request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
            request.Headers.Add("Accept", "application/json, text/plain, */*");
            request.Headers.Add("Referer", "https://sozluk.gov.tr/");
            
            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                return doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"TDK API Error for '{word}': {ex.Message}");
        }
        return false;
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
