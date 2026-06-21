# Exam #1: "Last Race"

## Student: s358543 TENORE MIRKO

# TODO

- [x] Rimuovere colore da segmento!!!!!
- [x] Refactor DB di test!
- [x] Non ha senso tenere l'id del segmento come stazA-stazB-lineID perché c'è il caso in cui per un segmento passano piu linee

- [x] Aggiungere 404 per tutte le route inesistenti
- [x] Randomizzare ordine di visualizzazione segmenti
- [x] Automatic submit dopo 90 secondi!
- [x] Adattare tutti gli oggetti di ritorno delle chiamate a modelli sia server che client
- [x] Aggiungere validazione percorso
- [x] La partita deve terminare anche quando non ci sono segmenti inseriti
- [x] Fixare aggiornamento dettagli utente dopo ogni partita!
- [X] Gestione errori!
- [x] Aggiungere validazione backend con express-validator
- [x] !!! Gestire il fatto che quando un utente accede a play/GAMEID che non gli appartiene compare specifico messaggio di errore

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/something`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

## Database Tables

- Table `users` - contains id, username, hashed_password, salt
- Table `stations` - contains id, name
- Table `lines` - contains id, name, color
- Table `line_stops` - contains id, line_id, station_id, stop_number
- Table `games` - contains id, user_id, start_station_id, destination_station_id, score, status, started_at
- Table `events` - contains id, description, effect
- ...

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username, password (plus any other requested info)
- username, password (plus any other requested info)

## Use of AI Tools

Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.

bootstrap classnames, css, generate sentences + error codes messages inside index.js + some mock database entries like the events