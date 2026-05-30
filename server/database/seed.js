import sqlite3 from 'sqlite3';
import fs from 'fs';

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error("Errore di connessione:", err.message);
        return;
    }
    console.log("Connesso al database SQLite.");
});

let initSQL;
try {
    initSQL = fs.readFileSync('./database/init.sql', 'utf8');
} catch (err) {
    console.error("Errore nella lettura del file init.sql:", err.message);
    process.exit(1);
}

db.exec(initSQL, (err) => {
    if (err) {
        console.error("Errore durante l'esecuzione dello script SQL:", err.message);
    } else {
        console.log("Database popolato con successo tramite init.sql!");
    }
    
    db.close();
});