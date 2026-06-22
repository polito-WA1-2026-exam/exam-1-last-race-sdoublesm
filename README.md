# Exam #1: "Last Race"
### Student: s358543 TENORE MIRKO

## Database Tables

### Table `users`
Contains: `id`, `username`, `hashed_password`, `salt`

Stores the registered users' credentials and information. 



### Table `stations`
Contains: `id`, `name`

Stores the available stations in the network.


### Table `lines`
Contains: `id`, `name`, `color`

Stores the metro lines. 


### Table `line_stops`
Contains: `id`, `line_id`, `station_id`, `stop_number` (the index of the station in the line)

Maps the sequence of stations for each line. 



### Table `events`
Contains: `id`, `description`, `effect`

Stores the random events that can occur during the game, with their coin effects. 



### Table `games`
Contains: `id`, `user_id`, `start_station_id`, `destination_station_id`, `score`, `status`, `started_at`

Stores the history and status of all games played by the users. 



## Data Models

### User

```js
function User(id, username) {
  this.id = id;
  this.username = username;
}
```

### Station

```js
function Station(id, name, lines = [], isInterchange = false) {
  this.id = id;
  this.name = name;
  this.lines = lines; 
  this.isInterchange = isInterchange; 
}
```

### Line

```js
function Line(id, name, color, stops = []) {
  this.id = id;
  this.name = name;
  this.color = color;
  this.stops = stops; 
}
```

### Segment

```js
function Segment(id, stationAId, stationAName, stationBId, stationBName) {
  this.id = id; 
  this.stationAId = stationAId;
  this.stationAName = stationAName;
  this.stationBId = stationBId;
  this.stationBName = stationBName;
}
```

### Event

```js
function Event(id, description, effect) {
  this.id = id;
  this.description = description;
  this.effect = effect;
}
```

### Game

```js
function Game(id, userId, username, startStationId, destinationStationId, score, status, startedAt) {
  this.id = id;
  this.user = new User(userId, username);
  this.startStationId = startStationId;
  this.destinationStationId = destinationStationId;
  this.score = score;
  this.status = status;
  this.startedAt = dayjs(startedAt);
}
```

### StepResult

```js
function StepResult(stationA, stationB, eventDescription, coinEffect, updatedTotal) {
  this.stationA = stationA;
  this.stationB = stationB;
  this.eventDescription = eventDescription;
  this.coinEffect = coinEffect;
  this.updatedTotal = updatedTotal;
}
```


## API Server

### Authentication

#### `POST /api/sessions`
- Request body: `{ "username": "player1", "password": "password" }`
- Response body:
```json
{
  "id": 1,
  "username": "player1"
}
```
- Status codes: `201 Created`, `401 Unauthorized`

#### `GET /api/sessions/current`
- Request parameters and body: none
- Response body:
```json
{
  "id": 1,
  "username": "player1"
}
```
- Status codes: `200 OK`, `401 Unauthorized`

#### `DELETE /api/sessions/current`
- Request parameters and body: none
- Response body: none
- Status codes: `200 OK`

### Network

#### `GET /api/network`
- Request parameters and body: none
- Auth: user identified via passport session
- Response body:
```json
{
  "stations": [...],
  "segments": [...]
}
```
- Status codes: `200 OK`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

### Game

#### `GET /api/ranking`
- Request parameters and body: none
- Auth: user identified via passport session
- Response body:
```json
[
  {
    "id": 3,
    "username": "player3",
    "bestScore": 28,
    "totalGames": 1,
    "position": 1
  }, ...
]
```
- Status codes: `200 OK`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

#### `POST /api/games`
- Request parameters and body: none
- Auth: user identified via passport session
- Response body:
```json
{
  "gameId": 12,
  "startStationId": 5,
  "destinationStationId": 14,
  "startedAt": "2026-06-22T10:00:00.000Z"
}
```
- Status codes: `201 Created`, `401 Unauthorized`, `503 Service Unavailable`

#### `GET /api/games/:gameId`
- Request parameters: `gameId` (integer)
- Auth: user identified via passport session
- Response body:
```json
{
  "id": 12,
  "user": { "id": 1, "username": "player1" },
  "startStationId": 5,
  "destinationStationId": 14,
  "score": 20,
  "status": "playing",
  "startedAt": "2026-06-22T10:00:00.000Z"
}
```
- Status codes: `200 OK`, `401 Unauthorized`, `403 Forbidden`, `422 Unprocessable Entity`, `500 Internal Server Error`

#### `POST /api/games/:gameId/submit`
- Request parameters: `gameId` (integer)
- Request body: `{ "segments": ["5-2", "2-8", ...] }`
- Auth: user identified via passport session
- Response body (Success):
```json
{
  "status": "completed",
  "finalScore": 23,
  "journey": [
    {
      "stationA": "Crocetta",
      "stationB": "Porta Velaria",
      "eventDescription": "Quiet journey",
      "coinEffect": 0,
      "updatedTotal": 20
    }
  ]
}
```
- Status codes: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `422 Unprocessable Entity`, `500 Internal Server Error`


## React Client Application Routes
- Route `/`: Homepage
- Route `/login`: Authentication page
- Route `/error`: Generic error page

### For authenticated users only:
- Route `/ranking`: General ranking
- Route `/play`: Setup phase
- Route `/play/:gameId`: Planning phase
- Route `/play/:gameId/result`: Execution phase

## Main React Components

- `HomeView` (in `HomeView.jsx`): contains a welcome message and the game rules. Unauthenticated users can log in, and authenticated users can start a new game or access the ranking view.
- `SetupView` (in `SetupView.jsx`): shows the complete map to the user and contains a button to strat a new game, calling the corresponding API, then redirects to the planning page.
- `PlanningView` (in `PlanningView.jsx`): contains the core game logic, where users select the segments to build the route within the 90 seconds timeout and contains the autosubmit logic.
- `ExecutionView` (in `ExecutionView.jsx`): gets the game results and renders the player's step-by-step journey using a timer if the route is valid, showing the steps and the final score. In case of an invalid route, just displays the result.
- `RankingView` (in `RankingView.jsx`): contains the leaderboard showing all players sorted by their best score + their number of total games played in a table.
- `Header` (in `Header.jsx`): navbar with user info and and logout button.

## Screenshots

![General Ranking Page](./img/ranking.jpg)
![During a Game](./img/game.jpg)

## Users Credentials

- username: `player1`, password: `password123`
- username: `player2`, password: `password123`
- username: `player3`, password: `password123`
- ...

## Use of AI Tools

I mainly used Google Gemini to ask for clarifications about React-Bootstrap classes, CSS and styling in general, to generate sentences to put in the game pages, some entries in the database like the events (plus the script `seed.js`), and to get help refining SQL queries inside the DAO. I also used it for implementing side functions such as the randomization of segments and to generate backend error codes and related messages.