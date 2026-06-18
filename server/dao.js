import sqlite from "sqlite3";
import crypto from "crypto";
import { Station, Line, Segment, Event, Game } from "./models.js";
import { User } from "../client/src/models.js";

const db = new sqlite.Database("database.sqlite", (err) => {
  if (err) throw err;
});

// ** USER DAO **
export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    // calcoliamo il MAX score e il COUNT delle partite completate.
    // usiamo una LEFT JOIN per prendere anche gli utenti che non hanno ancora giocato
    const sql = `
    SELECT users.*, 
             MAX(games.score) as best_score,
             COUNT(games.id) as total_games
      FROM users
      LEFT JOIN games ON users.id = games.user_id AND games.status = 'completed'
      WHERE users.username = ?
      GROUP BY users.id`;
    
    db.get(sql, [username], (err, row) => {
      if (err) reject(err); 
      else if (row === undefined) resolve(false); 
      else {
        const user = new User(
          row.id, 
          row.username, 
          row.best_score || 0, 
          row.total_games || 0);
        
        crypto.scrypt(password, row.salt, 16, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.hashed_password, "hex"), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

// ** NETWORK DAO **
export const getStations = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM stations";
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getLines = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM lines";
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getLineStops = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM line_stops ORDER BY line_id, stop_number";
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// network: {stations: [], lines: [], segments: []}
export const getNetwork = async () => {
  try {
    const [stationsRaw, linesRaw, lineStopsRaw] = await Promise.all([
      getStations(),
      getLines(),
      getLineStops()
    ]);

    const stationsMap = {};
    stationsRaw.forEach(s => stationsMap[s.id] = new Station(s.id, s.name, [], false));
    const linesMap = {};
    linesRaw.forEach(l => linesMap[l.id] = new Line(l.id, l.name, l.color, []));

    const stopsByLine = {};
    
    lineStopsRaw.forEach(stop => {
      const line = linesMap[stop.line_id];
      const station = stationsMap[stop.station_id];

      if (!station.lines.includes(line.name)) station.lines.push(line.name);
      if (station.lines.length > 1) station.isInterchange = true;

      line.stops.push(station.id);

      if (!stopsByLine[stop.line_id]) stopsByLine[stop.line_id] = [];
      stopsByLine[stop.line_id].push({
        stationId: station.id,
        stationName: station.name,
        stopNumber: stop.stop_number
      });
    });

    const segments = [];
    for (const lineId in stopsByLine) {
      const stops = stopsByLine[lineId];
      const line = linesMap[lineId];
      
      for (let i = 0; i < stops.length - 1; i++) {
        const current = stops[i];
        const next = stops[i + 1];
        
        segments.push(new Segment(
          `${current.stationId}-${next.stationId}-${line.id}`,
          current.stationId, current.stationName,
          next.stationId, next.stationName,
          line.id, line.name, line.color
        ));
      }
    }

    return {
      stations: Object.values(stationsMap),
      lines: Object.values(linesMap),
      segments: segments
    };
  } catch (err) {
    throw err;
  }
};


// ** GAME DAO **

export const getEvents = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM events", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map((r) => new Event(r.id, r.description, r.effect)));
    });
  });
};

export const createGame = (userId, startStationId, destinationStationId) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO games(user_id, start_station_id, destination_station_id, score, status) VALUES (?, ?, ?, 20, 'playing')";
    db.run(sql, [userId, startStationId, destinationStationId], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

export const getGame = (gameId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT games.*, users.username 
      FROM games JOIN users ON games.user_id = users.id 
      WHERE games.id = ? AND games.user_id = ?`;
    db.get(sql, [gameId, userId], (err, row) => {
      if (err) reject(err);
      else if (row !== undefined)
        resolve(new Game(row.id, row.user_id, row.username, row.start_station_id, row.destination_station_id, row.score, row.status, row.started_at));
      else
        resolve({ error: "Game not found." });
    });
  });
};

export const updateGame = (gameId, finalScore, finalStatus) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE games SET score = ?, status = ? WHERE id = ?";
    db.run(sql, [finalScore, finalStatus, gameId], function(err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

export const getRanking = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        users.id, 
        users.username, 
        MAX(games.score) as best_score,
        RANK() OVER (ORDER BY MAX(games.score) DESC) as position
      FROM games 
      JOIN users ON games.user_id = users.id 
      WHERE games.status = 'completed' 
      GROUP BY users.id 
      ORDER BY best_score DESC
    `;
    
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};