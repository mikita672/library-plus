# Dokumentacja Projektu: Library Plus

## 1. Cel projektu
Celem projektu jest stworzenie prostej, webowej aplikacji wspomagającej zarządzanie biblioteką. System umożliwia katalogowanie zbiorów bibliotecznych, obsługę procesu wypożyczania i zwracania książek, a także zarządzanie czytelnikami i pracownikami. Aplikacja ma na celu usprawnienie podstawowych procesów bibliotecznych oraz umożliwienie użytkownikom przeglądania dostępnych zasobów i rezerwacji wybranych pozycji.

## 2. Architektura systemu
System został zrealizowany w architekturze klient-serwer z podziałem na warstwę prezentacji oraz warstwę logiki biznesowej i dostępu do danych.

- **Warstwa frontendowa:** Zbudowana jako interaktywna aplikacja webowa renderowana po stronie serwera, komunikująca się z backendem za pomocą zapytań HTTP.
- **Warstwa backendowa:** Aplikacja serwerowa udostępniająca interfejs programistyczny. Odpowiada za autoryzację, walidację danych oraz realizację reguł biznesowych, takich jak naliczanie kar za przetrzymanie czy sprawdzanie dostępności książek.
- **Warstwa danych:** System bazodanowy przechowujący informacje o zbiorach, użytkownikach i operacjach wypożyczeń. W architekturze zastosowano relacyjną bazę danych do głównych encji biznesowych oraz nierelacyjną bazę danych do specyficznych zastosowań pobocznych.

## 3. Technologie i narzędzia
Projekt został zaimplementowany przy użyciu następującego stosu technologicznego:

- **Frontend:**
  - Framework: Next.js oparty na bibliotece React
  - Język: TypeScript
  - Komunikacja sieciowa: Fetch API

- **Backend:**
  - Framework: .NET w języku C#
  - Dostęp do danych: Entity Framework Core

- **Bazy danych:**
  - PostgreSQL – główna baza relacyjna przechowująca strukturalne dane aplikacji.
  - MongoDB – nierelacyjna baza danych wykorzystywana do przechowywania logów zdarzeń i danych niestrukturalnych.

- **Środowisko uruchomieniowe i wdrożenie:**
  - Docker i Docker Compose – konteneryzacja aplikacji i baz danych w celu ujednolicenia środowiska programistycznego i produkcyjnego.

## 4. Model danych
Logiczny model danych opiera się na relacyjnej strukturze głównych obiektów biznesowych. Poniżej przedstawiono kluczowe encje w systemie:

- **User:** Przechowuje dane uwierzytelniające i profilowe czytelników oraz pracowników biblioteki. Zawiera między innymi unikalny adres e-mail.
- **Book:** Centralna encja reprezentująca tytuł w katalogu. Powiązana jest z autorem, kategorią oraz wydawnictwem.
- **BookUnit:** Konkretny, fizyczny egzemplarz przypisany do danej książki. Pozwala na posiadanie w bibliotece wielu sztuk tego samego tytułu.
- **Author, Category, Publisher:** Słowniki kategoryzujące książki w systemie.
- **Reservation:** Rejestruje fakt przypisania egzemplarza książki do użytkownika. Przechowuje daty rozpoczęcia i zakończenia wypożyczenia.
- **Review:** Pozwala użytkownikom na dodawanie opinii o przeczytanych książkach. Relacja zapewnia unikalność opinii danego użytkownika dla konkretnej książki.
- **Notification i UserNotification:** Encje odpowiedzialne za komunikację z użytkownikiem wewnątrz systemu.

## 5. Główne funkcjonalności
System udostępnia zróżnicowane funkcje w zależności od przypisanej roli zalogowanego użytkownika.

**Dla czytelnika:**
- Przeglądanie katalogu książek oraz podstawowe wyszukiwanie i filtrowanie zbiorów.
- Rezerwowanie i wypożyczanie dostępnych egzemplarzy.
- Dodawanie opinii i ocen dla przeczytanych książek po ich zwrocie.
- Podgląd własnej historii wypożyczeń oraz naliczonych kar za opóźnienia.

**Dla administratora i bibliotekarza:**
- Zarządzanie katalogiem zasobów bibliotecznych (dodawanie, edycja i usuwanie książek, autorów, kategorii).
- Zarządzanie kontami użytkowników systemu.
- Obsługa procesu zwrotów i wydawania egzemplarzy.
- Dostęp do panelu administracyjnego podsumowującego aktualny stan biblioteki.

## 6. Uruchomienie projektu
Aplikacja została przygotowana do uruchomienia w środowisku izolowanym przy pomocy narzędzia Docker.

1. Wymagane jest posiadanie zainstalowanego środowiska Docker oraz Docker Compose.
2. Pliki konfiguracyjne należy uzupełnić w pliku `backend/appsettings.json`, utworzonym na podstawie dostarczonego wzorca `appsettings-example.json`.
3. Środowisko uruchamia się wykonując polecenie:
   `docker compose up --build -d`
4. Po poprawnym zbudowaniu i uruchomieniu kontenerów aplikacja kliencka dostępna jest w przeglądarce pod adresem `http://localhost:3000`, a interfejs serwera pod adresem `http://localhost:8080`.
