# Tırtıl (Caterpillar) Word Game - Kurulum Kılavuzu

Bu proje, bir Next.js (Frontend) ve bir .NET 8 Web API (Backend) uygulamasından oluşmaktadır.

## 1. Backend Kurulumu (C#)

1. `backend` klasörüne gidin.
2. Terminalde şu komutları çalıştırın:
   ```bash
   dotnet restore
   dotnet run
   ```
3. API varsayılan olarak `http://localhost:5000` adresinde çalışacaktır.

## 2. Frontend Kurulumu (Next.js)

1. `frontend` klasörüne gidin.
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Uygulamayı başlatın:
   ```bash
   npm run dev
   ```
4. Tarayıcınızda `http://localhost:3000` adresini açın.

## Oyun Özellikleri

- **Premium B&W Tema**: Minimalist ve yüksek kontrastlı tasarım.
- **Tırtıl Mekaniği**: Kelimeler yatay bir zincir oluşturur.
- **Dinamik Sesler**: Web Audio API ile sentezlenmiş minimalist ses efektleri.
- **Zorluk Seviyeleri**: Kelime başına 10sn, 7sn ve 5sn süreleri.
- **Akıllı Doğrulama**: C# tarafında harf eşleşmesi, tekrar kontrolü ve kategori bazlı sözlük doğrulaması.
