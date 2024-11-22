const express = require("express");
const server = require("http").createServer();
const app = express();

app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000, function () {
  console.log("Server started on port 3000");
});

// Begin websocket
const webSocketServer = require("ws").Server;

const wss = new webSocketServer({ server: server });

process.on("SIGINT", () => {
  console.log("sigint");

  wss.clients.forEach(function each(client) {
    client.close();
  });
  console.log("sigint db");

  server.close(() => {
    shutdownDB();
  });
});

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("Clients connected: ", numClients);

  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send("Welcom to my server");
  }

  db.run(`INSERT INTO visitors (count, time)
    VALUES (${numClients}, datetime('now'))
    `);

  ws.on("close", function close() {
    wss.broadcast("A client has disconnected");
    console.log("A client has disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

// End websockets
// Start DB

const sql = require("sqlite3");

const db = new sql.Database(":memory:");

db.serialize(() => {
  db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `);
});

function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  console.log("Shutting down DB");
  getCounts();
  db.close();
}
