using Caterpillar.Api.Models;

namespace Caterpillar.Api.Services;

public class DictionaryService
{
    private readonly Dictionary<string, (HashSet<string> Words, Dictionary<string, string> Definitions)> _categories = new()
    {
        { "Genel", (
            new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "elma", "armut", "araba", "ayna", "ayakkabı", "balık", "bardak", "bilgisayar", "ceket", "çanta", "deniz", "defter", "ekmek", "ev", "fare", "fincan", "güneş", "gözlük", "halı", "hastane", "ışık", "ırmak", "iğne", "incir", "jilet", "jeton", "kalem", "kapı", "limon", "lamba", "masa", "minder", "nar", "nehir", "okul", "orman", "para", "pencere", "radyo", "resim", "saat", "sandalye", "tabak", "telefon", "uçak", "uyku" },
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
                { "elma", "Gülgillerden, çiçekleri pembe veya beyaz bir ağacın meyvesi." },
                { "araba", "Tekerlekli, motorlu veya motorsuz kara taşıtı." },
                { "deniz", "Yer kabuğunun çukur bölümlerini kaplayan büyük tuzlu su kütlesi." },
                { "okul", "Her türlü eğitim ve öğretimin toplu olarak yapıldığı yer." }
            }
        ) },
        { "Hayvanlar", (
            new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "aslan", "ayı", "at", "balina", "buzağı", "ceylan", "çita", "deve", "domuz", "eşek", "fare", "fil", "geyik", "güvercin", "horoz", "inek", "istakoz", "jaguar", "kaplan", "kedi", "köpek", "leylek", "maymun", "panda", "penguen", "rakun", "sincap", "tavşan", "timsah", "zebra" },
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
                { "aslan", "Kedigillerden, Afrika ve Asya'da yaşayan çok güçlü memeli hayvan." },
                { "kedi", "Evcilleştirilmiş, küçük ve çevik bir memeli hayvan." }
            }
        ) }
    };

    public (bool Valid, string? Definition) ValidateAndGetDefinition(string category, string word)
    {
        var cat = _categories.ContainsKey(category) ? _categories[category] : _categories["Genel"];
        bool isValid = cat.Words.Contains(word);
        cat.Definitions.TryGetValue(word, out string? definition);
        return (isValid, definition);
    }

    public List<string> GetCategories() => _categories.Keys.ToList();
}
