import express from "express";
import morgan from "morgan";
import cors from "cors";
// import { getUser } from "./dao.js";
import { check, validationResult } from "express-validator";
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import dayjs from 'dayjs'
import { getUser, getNetwork, getEvents } from "./dao.js";

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

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  
  if(!user)
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
  if(req.isAuthenticated()) {
    return next();
  }
  console.log(req.user)
  return res.status(401).json({error: "Not authorized"});
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate("session"));


// -------------- ROUTES  --------------

// --- authentication

// POST /api/sessions
app.post("/api/sessions", passport.authenticate("local"), function(req, res) {
  return res.status(201).json(req.user);
});

// GET /api/sessions/current
app.get("/api/sessions/current", (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({error: "Not authenticated"});
  }
});

// DELETE /api/sessions/current
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// --- network

// GET /api/network
// Recupera la rete metropolitana (solo per utenti loggati)
app.get('/api/network', isLoggedIn, async (req, res) => {
  try {
    const network = await getNetwork();
    
    // Se per qualche motivo il db fosse vuoto
    if (!network || network.stations.length === 0) {
      return res.status(404).json({ error: "Rete metropolitana non trovata o vuota." });
    }
    
    res.json(network);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore del server durante il recupero della rete metropolitana." });
  }
});

// start the server
app.listen(port, () => {console.log(`API server started at http://localhost:${port}`)});