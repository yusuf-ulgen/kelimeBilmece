# Çalışma Zamanı (Runtime) için hafif ASP.NET Core 8 tabanı
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 8080

# Projeyi derlemek (Build) için .NET SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Caterpillar.Api.csproj", "./"]
RUN dotnet restore "Caterpillar.Api.csproj"
COPY . .
WORKDIR "/src/"
RUN dotnet build "Caterpillar.Api.csproj" -c Release -o /app/build

# Yayınlamak (Publish) için derlenmiş koddan kopya alınır
FROM build AS publish
RUN dotnet publish "Caterpillar.Api.csproj" -c Release -o /app/publish

# Final Aşama
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Caterpillar.Api.dll"]
