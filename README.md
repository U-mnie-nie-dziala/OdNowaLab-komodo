# OdNowaLab-komodo — Wołomiński Program Partnerski

System lojalnościowy dla lokalnych sklepów i usług. Mieszkańcy zbierają punkty
za zakupy u lokalnych przedsiębiorców, a następnie wymieniają je na benefity —
zniżki w sklepach objętych programem oraz nagrody rzeczowe zapewniane przez
urząd miasta.

## Jak to działa

1. **Zbieranie punktów** — użytkownik robi zakupy w sklepie lub korzysta z usługi
   objętej programem i otrzymuje punkty lojalnościowe.
2. **Identyfikacja przy kasie** — użytkownik skanuje kod QR w sklepie albo podaje
   obsłudze swój numer telefonu.
3. **Realizacja kuponu** — obsługa sklepu, przez dedykowaną stronę internetową,
   realizuje kupon zakupiony wcześniej przez użytkownika.
4. **Wymiana punktów** — w aplikacji mobilnej użytkownik wymienia punkty na
   benefity oraz przegląda listę i mapę biznesów zarejestrowanych w programie.

## Komponenty repozytorium

| Katalog | Opis | Technologia |
|---|---|---|
| [`backend`](backend) | API: konta użytkowników, rejestracja i logowanie, punkty lojalnościowe, profile biznesów | Spring Boot (Java), PostgreSQL |
| [`business-frontend`](business-frontend) | Panel właściciela biznesu i kasjera — naliczanie punktów i realizacja kuponów | Next.js, React |
| [`client-mobile`](client-mobile) | Aplikacja mobilna dla mieszkańców — zbieranie i wymiana punktów, lista i mapa biznesów | Expo (React Native) |
| [`database`](database) | Obraz i konfiguracja bazy danych | PostgreSQL |
| [`terraform`](terraform) | Infrastruktura (AWS) jako kod | Terraform |

## Autentykacja i autoryzacja

Uwierzytelnianie oraz autoryzacja obsługiwane są przez **AWS Cognito**.

## Dokumentacja API

Dokumentacja REST API (Swagger UI):
**http://3.121.224.169:8080/swagger-ui/index.html**

## Uruchomienie lokalne

Wymagania: Docker + Docker Compose.

```bash
# Backend + baza danych
docker compose up -d --build database backend
```

Backend wystawia API na porcie `8080`. Konfigurację (dane bazy, klucze AWS,
Cognito) przekazuje się przez plik `.env` w katalogu głównym.

### Frontend biznesowy

```bash
cd business-frontend
npm install
npm run dev            # http://localhost:3000
```

Frontend korzysta z proxy `/api/*` do backendu — adres backendu ustawia zmienna
`BACKEND_ORIGIN` (domyślnie `http://localhost:8888`; można nadpisać w
`business-frontend/.env.local`).

### Aplikacja mobilna

```bash
cd client-mobile
npm install
npx expo start
```