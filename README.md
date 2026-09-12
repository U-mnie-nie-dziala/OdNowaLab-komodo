# OdNowaLab-komodo

System pozwala na zbieranie punktów lojalnościowych, robiąc zakupy w lokalnych sklepach i korzystając z 
lokalnych usług.

Backend w Spring Boot'cie odpowiada za zarządzanie kontami urzytkowników, rejestracją, logowaniem, a także zarządzaniem.
Link do dokumentacji w swaggerze: http://3.121.224.169:8080/swagger-ui/index.html
punktami lojalnościowymi i profilami biznesów.

Punkty można potem wymienić w aplikacji mobilnej na benefity: proponujemy zniżki w sklepach objętych programem, oraz
nagrody rzeczowe, zapewniane przez urząd miasta. 

Użytkownicy, mogą zeskanować kod qr w sklepie, albo podać obsłudze swój numer telefonu. Obsługa sklepu ma do swojej
dyspozycji stronę internetową w której mają możliwość zrealizowanie kuponu, zakupionego przez użytkownika.

W aplikacji mobilnej, wyświetlana jest lista oraz mapa biznesów zarejestrowanych w programie.

Autentykacja i autoryzacja obsługiwane są przez AWS Cognito.
