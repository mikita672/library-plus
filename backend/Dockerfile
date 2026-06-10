FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY LibraryPlus.csproj .
RUN dotnet restore LibraryPlus.csproj

COPY . .
RUN dotnet build LibraryPlus.csproj -c Release --no-restore
RUN dotnet publish LibraryPlus.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080

RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8080

CMD ["dotnet", "LibraryPlus.dll"]