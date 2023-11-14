import Pool from "pg-pool";
import "dotenv/config";

const pool = new Pool({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: false,
    max: 20, // set pool max size to 20
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
    maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
});

pool.connect((err, client, done) => {
    if (err) {
      console.error('Fehler beim Verbinden zur Datenbank:', err.message);
    } else {
      console.log('Erfolgreich zur Datenbank verbunden');
      // Hier können Sie Ihre Anwendungslogik starten
      // Fügen Sie Ihre Routen, Middleware und andere Funktionen hier hinzu
      // Beispiel: app.use('/api', meineApiRouter);
    }
    done();
});

const client = await pool.connect();

export default client;