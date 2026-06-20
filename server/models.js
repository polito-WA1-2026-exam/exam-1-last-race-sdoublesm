import dayjs from "dayjs";

function User(id, username, bestScore, totalGames) {
  this.id  = id;
  this.username = username;
  this.bestScore = bestScore;
  this.totalGames = totalGames;
}

function Station(id, name, lines = [], isInterchange = false) {
  this.id = id;
  this.name = name;
  this.lines = lines; 
  this.isInterchange = isInterchange; 
}

function Line(id, name, color, stops = []) {
  this.id = id;
  this.name = name;
  this.color = color;
  this.stops = stops; 
}

function Segment(id, stationAId, stationAName, stationBId, stationBName, lines = [], color) {
  this.id = id; // id segmento sarà del tipo stazA-stazB-lineId
  // TODO: rivedere, non ha senso 
  this.stationAId = stationAId;
  this.stationAName = stationAName;
  this.stationBId = stationBId;
  this.stationBName = stationBName;
  this.lines = lines;
  this.color = color;
}

function Event(id, description, effect) {
  this.id = id;
  this.description = description;
  this.effect = effect;
}

function Game(id, userId, username, startStationId, destinationStationId, score, status, startedAt) {
  this.id = id;
  this.user = new User(userId, username);
  this.startStationId = startStationId;
  this.destinationStationId = destinationStationId;
  this.score = score;
  this.status = status;
  this.startedAt = dayjs(startedAt + 'Z'); // per esplicitare che nel DB usiamo UTC
}

function StepResult(stationA, stationB, eventDescription, coinEffect, updatedTotal) {
  this.stationA = stationA;
  this.stationB = stationB;
  this.eventDescription = eventDescription;
  this.coinEffect = coinEffect;
  this.updatedTotal = updatedTotal;
}

export { User, Station, Line, Segment, Event, Game, StepResult };