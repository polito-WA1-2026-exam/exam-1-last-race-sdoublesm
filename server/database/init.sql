DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS line_stops;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS lines;
DROP TABLE IF EXISTS users;

-- create tables

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    salt TEXT NOT NULL
);

CREATE TABLE stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT
);

CREATE TABLE line_stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    line_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL,
    stop_number INTEGER NOT NULL,
    FOREIGN KEY(line_id) REFERENCES lines(id) ON DELETE CASCADE,
    FOREIGN KEY(station_id) REFERENCES stations(id) ON DELETE CASCADE,
    UNIQUE(line_id, stop_number) -- non possono esserci due fermate con lo stesso numero sulla stessa linea
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    effect INTEGER NOT NULL,
    CHECK (effect >= -4 AND effect <= 4) -- vincolo richiesto dalle specifiche
);

CREATE TABLE games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    start_station_id INTEGER NOT NULL,
    destination_station_id INTEGER NOT NULL,
    score INTEGER NOT NULL DEFAULT 20,
    status TEXT NOT NULL DEFAULT 'playing',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(start_station_id) REFERENCES stations(id),
    FOREIGN KEY(destination_station_id) REFERENCES stations(id),
    CHECK (score >= 0),
    CHECK (status IN ('playing', 'completed', 'failed'))
);

--- populate db

INSERT INTO users (username, hashed_password, salt) VALUES 
    ('mirko33', '690adf3f82a98b1697b6318ea633acc0', '43c180fcc4008974'),
    ('luigi_verdi', '690adf3f82a98b1697b6318ea633acc0', '43c180fcc4008974'),
    ('giulia_neri', '690adf3f82a98b1697b6318ea633acc0', '43c180fcc4008974'),
    ('alice_villa', '690adf3f82a98b1697b6318ea633acc0', '43c180fcc4008974'),
    ('mario_rossi', '690adf3f82a98b1697b6318ea633acc0', '43c180fcc4008974'),
    ('filippo99', '690adf3f82a98b1697b6318ea633acc0', '43c180fcc4008974'),
    ('sara_bianchi', '690adf3f82a98b1697b6318ea633acc0', '43c180fcc4008974');

INSERT INTO lines (name, color) VALUES 
    ('Red Line', 'red'),
    ('Blue Line', 'blue'),
    ('Green Line', 'green'),
    ('Yellow Line', 'yellow');

INSERT INTO stations (name) VALUES 
    ('Castello di Nebbia'), ('Porta Velaria'), ('Darsena'), ('Giardini del Confine'), ('Crocetta'), ('Dogana Vecchia'),
    ('Fornace'), ('Viale dei Mosaici'), ('Centrale'), ('Cavalcavia'), ('Belvedere'),
    ('Piazza delle Lanterne'), ('Arsenale'), ('Bertola'),
    ('Fontana Oscura'), ('Porta Oriente');

INSERT INTO line_stops (line_id, station_id, stop_number) VALUES 
    -- BLUE Line
    ((SELECT id FROM lines WHERE name='Blue Line'), (SELECT id FROM stations WHERE name='Castello di Nebbia'), 1),
    ((SELECT id FROM lines WHERE name='Blue Line'), (SELECT id FROM stations WHERE name='Porta Velaria'), 2),
    ((SELECT id FROM lines WHERE name='Blue Line'), (SELECT id FROM stations WHERE name='Darsena'), 3),
    ((SELECT id FROM lines WHERE name='Blue Line'), (SELECT id FROM stations WHERE name='Giardini del Confine'), 4),
    ((SELECT id FROM lines WHERE name='Blue Line'), (SELECT id FROM stations WHERE name='Crocetta'), 5),
    ((SELECT id FROM lines WHERE name='Blue Line'), (SELECT id FROM stations WHERE name='Dogana Vecchia'), 6),

    -- GREEN Line
    ((SELECT id FROM lines WHERE name='Green Line'), (SELECT id FROM stations WHERE name='Porta Velaria'), 1),
    ((SELECT id FROM lines WHERE name='Green Line'), (SELECT id FROM stations WHERE name='Fornace'), 2),
    ((SELECT id FROM lines WHERE name='Green Line'), (SELECT id FROM stations WHERE name='Viale dei Mosaici'), 3),
    ((SELECT id FROM lines WHERE name='Green Line'), (SELECT id FROM stations WHERE name='Centrale'), 4),
    ((SELECT id FROM lines WHERE name='Green Line'), (SELECT id FROM stations WHERE name='Cavalcavia'), 5),
    ((SELECT id FROM lines WHERE name='Green Line'), (SELECT id FROM stations WHERE name='Belvedere'), 6),

    -- RED Line
    ((SELECT id FROM lines WHERE name='Red Line'), (SELECT id FROM stations WHERE name='Piazza delle Lanterne'), 1),
    ((SELECT id FROM lines WHERE name='Red Line'), (SELECT id FROM stations WHERE name='Crocetta'), 2),
    ((SELECT id FROM lines WHERE name='Red Line'), (SELECT id FROM stations WHERE name='Centrale'), 3),
    ((SELECT id FROM lines WHERE name='Red Line'), (SELECT id FROM stations WHERE name='Arsenale'), 4),
    ((SELECT id FROM lines WHERE name='Red Line'), (SELECT id FROM stations WHERE name='Bertola'), 5),

    -- YELLOW Line
    ((SELECT id FROM lines WHERE name='Yellow Line'), (SELECT id FROM stations WHERE name='Fontana Oscura'), 1),
    ((SELECT id FROM lines WHERE name='Yellow Line'), (SELECT id FROM stations WHERE name='Viale dei Mosaici'), 2),
    ((SELECT id FROM lines WHERE name='Yellow Line'), (SELECT id FROM stations WHERE name='Centrale'), 3),
    ((SELECT id FROM lines WHERE name='Yellow Line'), (SELECT id FROM stations WHERE name='Cavalcavia'), 4),
    ((SELECT id FROM lines WHERE name='Yellow Line'), (SELECT id FROM stations WHERE name='Porta Oriente'), 5);

INSERT INTO events (description, effect) VALUES 
    ('Quiet journey', 0),
    ('Wrong platform', -2),
    ('Kind passenger', 1),
    ('Broken escalator', -1),
    ('Found a coin', 2),
    ('Pickpocket', -4),
    ('Shortcut found', 3),
    ('Train delayed', -3);

INSERT INTO games (user_id, start_station_id, destination_station_id, score, status, started_at) VALUES 
    (1, (SELECT id FROM stations WHERE name='Centrale'), (SELECT id FROM stations WHERE name='Fontana Oscura'), 15, 'completed', '2026-05-29 10:00:00'),
    (1, (SELECT id FROM stations WHERE name='Giardini del Confine'), (SELECT id FROM stations WHERE name='Bertola'), 22, 'completed', '2026-05-28 15:30:00'),
    (2, (SELECT id FROM stations WHERE name='Belvedere'), (SELECT id FROM stations WHERE name='Darsena'), 8, 'completed', '2026-05-30 14:00:00'),
    (2, (SELECT id FROM stations WHERE name='Fornace'), (SELECT id FROM stations WHERE name='Dogana Vecchia'), 12, 'completed', '2026-06-01 09:15:00'),
    (3, (SELECT id FROM stations WHERE name='Centrale'), (SELECT id FROM stations WHERE name='Arsenale'), 28, 'completed', '2026-06-05 11:45:00'),
    (4, (SELECT id FROM stations WHERE name='Porta Velaria'), (SELECT id FROM stations WHERE name='Piazza delle Lanterne'), 5, 'failed', '2026-06-10 18:20:00'),
    (5, (SELECT id FROM stations WHERE name='Cavalcavia'), (SELECT id FROM stations WHERE name='Crocetta'), 19, 'completed', '2026-06-12 08:30:00'),
    (1, (SELECT id FROM stations WHERE name='Castello di Nebbia'), (SELECT id FROM stations WHERE name='Belvedere'), 0, 'failed', '2026-06-15 16:40:00'),
    (6, (SELECT id FROM stations WHERE name='Bertola'), (SELECT id FROM stations WHERE name='Darsena'), 25, 'completed', '2026-06-18 13:10:00'),
    (7, (SELECT id FROM stations WHERE name='Dogana Vecchia'), (SELECT id FROM stations WHERE name='Fontana Oscura'), 14, 'completed', '2026-06-19 20:00:00');