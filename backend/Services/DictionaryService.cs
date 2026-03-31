using Caterpillar.Api.Models;
using System.Text.Json;
using System.Net.Http;

namespace Caterpillar.Api.Services;

public class DictionaryService
{
    private readonly Dictionary<string, (HashSet<string> Words, Dictionary<string, string> Definitions)> _categories = new();
    private readonly Dictionary<string, string> _apiCache = new(StringComparer.OrdinalIgnoreCase);
    private readonly HttpClient _httpClient = new();

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
        // 1. Yerel Sözlük Kontrolü
        var cat = _categories.ContainsKey(category) ? _categories[category] : _categories["Genel"];
        if (cat.Words.Contains(word))
        {
            cat.Definitions.TryGetValue(word, out string? localDef);
            return (true, localDef);
        }

        // 2. API Önbellek Kontrolü
        if (_apiCache.TryGetValue(word, out string? cachedDef))
        {
            return (true, cachedDef);
        }

        // 3. TDK API Kontrolü (Sadece Genel veya Fallback olarak diğerleri)
        try
        {
            var response = await _httpClient.GetAsync($"https://sozluk.gov.tr/gts?ara={Uri.EscapeDataString(word.ToLower())}");
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                
                // TDK API kelime bulunamadığında error döner veya boş dizi döner
                if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
                {
                    var firstMatch = doc.RootElement[0];
                    string? definition = null;
                    
                    if (firstMatch.TryGetProperty("anlamlarListe", out var anlamlar) && anlamlar.GetArrayLength() > 0)
                    {
                        definition = anlamlar[0].GetProperty("anlam").GetString();
                    }

                    // Önbelleğe al (Kelime geçerli)
                    _apiCache[word] = definition ?? "Tanım bulunamadı.";
                    return (true, definition);
                }
            }
        }
        catch (Exception ex)
        {
            // API hatası durumunda yerel sonuca güven (zaten yukarıda kontrol ettik)
            Console.WriteLine($"TDK API Error: {ex.Message}");
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
