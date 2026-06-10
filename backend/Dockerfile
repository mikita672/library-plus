FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/LibraryPlus.csproj .
RUN dotnet restore

COPY backend/ .
RUN dotnet build -c Release --no-restore
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

EXPOSE 8080
CMD ["dotnet", "LibraryPlus.dll"]