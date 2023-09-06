const { WebSocketServer, WebSocket } = require("ws");

let wsClient;

function setUpWebSocket(server, req, socket, head) {
  const wss = new WebSocketServer({ noServer: true });

  wss.handleUpgrade(req, socket, head, function done(ws) {
    wsClient = ws;

    ws.on("message", (message) => {
      console.log("received:", message);
    });

    ws.on("close", () => {
      wsClient = null;
    });
  });
}

function wsSend(message) {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(message);
  }
}

function closeConnection() {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.close();
  }
}

module.exports = {
  setUpWebSocket,
  wsSend,
  closeConnection,
};
