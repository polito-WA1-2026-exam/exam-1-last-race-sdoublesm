import express from "express";
import morgan from "morgan";
import cors from "cors";
import { check, validationResult } from "express-validator";
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import dayjs from 'dayjs'
import { getUser, getRanking, getNetwork, getEvents, createGame, getGame, updateGame } from "./dao.js";
import { StepResult } from "./models.js";

// init
const app = express();
const port = 3001;

// middlewares
app.use(express.json());
app.use(morgan("dev"));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200,
  credentials: true
};
app.use(cors(corsOptions))

// --- authentication
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);

  if (!user)
    //null -> no error, invalid credetials, message
    return cb(null, false, "Incorrect username or password."); // error message in the WWW-Authenticated header of the response

  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate("session"));

// --- game
/*
  funzione che implementa BFS (visita in ampiezza grafo) 
  che ritorna la distanza minima in segmenti tra due vertici
  la chiamo per verificare che la distanza minima 
  tra start e dest in segmenti sia >= 3

  BFS: dato un vertice, trovare il cammino minimo verso gli altri vertici
  esplora a parteire da un vertice, quelli a distanza 1, poi a distanza 2, poi 3..
*/
function getMinDistance(startId, destId, segments) {
  // queue: mantiene ordine dei nodi che devono essere esplorati
  // all'inizio c'è solo la stazione di partenza, poi ci saranno i vicini, poi vicini dei vicini..
  // fino a quando non arrivo alla distanza
  const queue = [{ id: startId, dist: 0 }];
  const visited = new Set([startId]); // set di nodi già esplorati

  while (queue.length > 0) {
    const current = queue.shift();

    // se il nodo in analisi e' la destinazione ritorna la distanza
    if (current.id === destId) return current.dist;

    // elaborazione di un nodo: prendo i suoi vicini dall'array di segmenti e li metto in neighbors
    const neighbors = segments.reduce((acc, seg) => {
      if (seg.stationAId === current.id) {
        acc.push(seg.stationBId);
      }
      if (seg.stationBId === current.id) {
        acc.push(seg.stationAId);
      }
      return acc;
    }, []);

    for (let n of neighbors) {
      // se il vicino NON è stato visitato, lo aggiungo a queue e incremento dist
      if (!visited.has(n)) {
        visited.add(n);
        queue.push({ id: n, dist: current.dist + 1 });
      }
    }
  }
  return -1;
}

// * -------------- ROUTES  --------------

// --- authentication

// ? POST /api/sessions
app.post("/api/sessions", passport.authenticate("local"), function (req, res) {
  return res.status(201).json(req.user);
});

// ? GET /api/sessions/current
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// ? DELETE /api/sessions/current
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// --- network

// ? GET /api/network
app.get('/api/network', isLoggedIn, async (req, res) => {
  try {
    const network = await getNetwork();

    // se per qualche motivo il db fosse vuoto
    if (!network || network.stations.length === 0) {
      return res.status(404).json({ error: "Underground network map not found or empty." });
    }

    res.json(network);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error: network map not succesfully retrivied." });
  }
});

// ? GET /api/ranking
app.get('/api/ranking', isLoggedIn, async (req, res) => {
  try {
    const ranking = await getRanking();

    if (!ranking || ranking.length === 0) {
      return res.status(404).json({ error: "Ranking not found or empty." });
    }

    res.json(ranking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error: ranking not succesfully retrivied." });
  }
});

// --- game
// ? GET /api/games/
app.get('/api/games/', isLoggedIn, async (req, res) => {
  try {
    const network = await getNetwork();

    // se per qualche motivo il db fosse vuoto
    if (!network || network.stations.length === 0) {
      return res.status(404).json({ error: "Underground network map not found or empty." });
    }

    res.json(network);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error: network map not succesfully retrivied." });
  }
});

// ? GET /api/games/:gameId
app.get("/api/games/:gameId", isLoggedIn, [
  check("gameId").isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const game = await getGame(req.params.gameId, req.user.id);
    if (game.error) return res.status(403).json(game);
    return res.json(game);
  } catch {
    res.status(500).end();
  }
});

// ? POST /api/games
app.post("/api/games", isLoggedIn, async (req, res) => {
  try {
    const network = await getNetwork();
    const stations = network.stations;
    let startStation, destStation;
    let validDistance = false;

    while (!validDistance) {
      startStation = stations[Math.floor(Math.random() * stations.length)];
      destStation = stations[Math.floor(Math.random() * stations.length)];
      if (startStation.id !== destStation.id) {
        const dist = getMinDistance(startStation.id, destStation.id, network.segments);
        if (dist >= 3) validDistance = true;
      }
    }

    const gameId = await createGame(req.user.id, startStation.id, destStation.id);

    setTimeout(async () => {
      try {
        const game = await getGame(gameId, req.user.id);
        if (game && game.status === "playing") await updateGame(gameId, 0, "failed");
      } catch (err) { }
    }, 98000);

    res.status(201).json({
      gameId: gameId,
      startStationId: startStation.id,
      destinationStationId: destStation.id,
      startedAt: dayjs().toISOString()
    });
  } catch (e) {
    res.status(503).json({ error: "Error while starting a new game." });
  }
});

// ? POST /api/games/:gameId/submit
app.post("/api/games/:gameId/submit", isLoggedIn, [
  check("gameId").isInt(),
  check("segments").isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const gameId = req.params.gameId;
  const userId = req.user.id;
  const { segments: submittedIds } = req.body;

  try {
    const game = await getGame(gameId, userId);
    if (game.error) return res.status(404).json({ error: "Game not available." });
    if (game.status !== "playing") return res.status(400).json({ error: "Game already closed." });

    const now = dayjs();
    const elapsed = now.diff(game.startedAt, "second");

    if (elapsed > 95) {
      await updateGame(gameId, 0, "failed");
      return res.json({ status: "failed", reason: "Time expired", journey: [], finalScore: 0 });
    }

    // check for duplicate segments in the submitted route
    const uniqueSegments = new Set(submittedIds);
    if (uniqueSegments.size !== submittedIds.length) {
      await updateGame(gameId, 0, "failed");
      return res.json({ status: "failed", reason: "Invalid route: segment used more than once", journey: [], finalScore: 0 });
    }

    const network = await getNetwork();
    const allSegments = network.segments;
    const allEvents = await getEvents();

    let currentStation = game.startStationId;
    const validRouteIds = [currentStation];

    let finalScore = 20;
    const journey = [];

    for (const segId of submittedIds) {
      // per ogni segmento avrò uno 
      // StepResult {stationA, stationB, eventDescription, coinEffect, updatedTotal}
      const currentSegment = allSegments.find(s => s.id === segId); // recupero segmento
      if (!currentSegment) {
        await updateGame(gameId, 0, "failed");
        return res.json({ status: "failed", reason: `Invalid route: segment ${segId} does not exist`, journey: [], finalScore: 0 });
      }

      let startName, destName, nextStationId;

      // capisco direzione segmento
      if (currentSegment.stationAId === currentStation) {
        nextStationId = currentSegment.stationBId;
        startName = currentSegment.stationAName;
        destName = currentSegment.stationBName;
      } else if (currentSegment.stationBId === currentStation) {
        nextStationId = currentSegment.stationAId;
        startName = currentSegment.stationBName;
        destName = currentSegment.stationAName;
      } else {
        // break -> percorso non valio
        await updateGame(gameId, 0, "failed");
        return res.json({ status: "failed", reason: "Invalid route: segments not connected", journey: [], finalScore: 0 });
      }

      const randomEvent = allEvents[Math.floor(Math.random() * allEvents.length)];
      finalScore += randomEvent.effect;

      journey.push(new StepResult(
        startName,
        destName,
        randomEvent.description,
        randomEvent.effect,
        finalScore
      ));

      currentStation = nextStationId;
      validRouteIds.push(currentStation);
    }

    if (currentStation !== game.destinationStationId) {
      await updateGame(gameId, 0, "failed");
      return res.json({ status: "failed", reason: "Invalid route: Destination not reached", journey: [], finalScore: 0 });
    }

    if (finalScore < 0) {
      finalScore = 0;
    }

    await updateGame(gameId, finalScore, "completed");
    return res.json({ status: "completed", finalScore, journey });

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ! start the server
app.listen(port, () => { console.log(`API server started at http://localhost:${port}`) });