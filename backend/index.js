const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");

const routes = require("./routes");
const { setUpWebSocket } = require("./websocket");

const app = express();
const server = http.createServer(app);

const PORT = 3001;
const WS_PORT = 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(routes);

// Add this to handle the WebSocket upgrade request
server.on("upgrade", (req, socket, head) => {
  if (req.url === "/test-actions/ws") {
    setUpWebSocket(server, req, socket, head);
  } else {
    socket.destroy();
  }
});

server.listen(WS_PORT, () => {
  console.log(`Server has started on http://localhost:${WS_PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
