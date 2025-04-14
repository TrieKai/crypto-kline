let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
const RECONNECT_DELAY = 5000;
const HEARTBEAT_INTERVAL = 30000;

function connect(symbol: string) {
  try {
    if (ws) {
      ws.close();
    }

    ws = new WebSocket("wss://stream.binance.com:9443/ws");

    ws.onopen = () => {
      if (!ws) {
        return;
      }

      // Subscribe to depth and trade data
      ws.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [
            `${symbol.toLowerCase()}@depth20@100ms`,
            `${symbol.toLowerCase()}@trade`,
          ],
          id: 1,
        })
      );

      // Clean up old heartbeat
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }

      // Send heartbeat
      heartbeatInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ ping: Date.now() }));
        }
      }, HEARTBEAT_INTERVAL);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      self.postMessage(data);
    };

    ws.onclose = () => {
      // Try to reconnect
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      reconnectTimeout = setTimeout(() => connect(symbol), RECONNECT_DELAY);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (ws) {
        ws.close();
      }
    };
  } catch (error) {
    console.error("Connection error:", error);
    reconnectTimeout = setTimeout(() => connect(symbol), RECONNECT_DELAY);
  }
}

self.onmessage = (event: MessageEvent) => {
  const { type, symbol } = event.data;

  switch (type) {
    case "connect":
      connect(symbol);
      break;
    case "disconnect":
      if (ws) {
        ws.close();
        ws = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      break;
  }
};
