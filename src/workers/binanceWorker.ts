let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let isConnecting = false;
let currentSymbol: string | null = null;
let lastTradeTime = 0;
let isClosing = false;

const RECONNECT_DELAY = 1000;
const HEARTBEAT_INTERVAL = 30000;
const TRADE_THROTTLE = 10; // 10ms throttle for trade updates
const MAX_RETRIES = 3;
let retryCount = 0;

function cleanupConnection(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (ws) {
    ws.onclose = null; // Remove event listener to avoid multiple triggers
    ws.onerror = null;
    ws.onmessage = null;
    ws.onopen = null;
    if (ws.readyState === WebSocket.OPEN) {
      isClosing = true;
      ws.close();
    }
    ws = null;
  }
  isConnecting = false;
  isClosing = false;
}

function connect(symbol: string): void {
  if (isConnecting) {
    return;
  }

  try {
    cleanupConnection();
    isConnecting = true;
    currentSymbol = symbol;
    retryCount = 0;

    ws = new WebSocket("wss://stream.binance.com:9443/ws");

    ws.onopen = (): void => {
      isConnecting = false;
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
      heartbeatInterval = setInterval((): void => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ ping: Date.now() }));
        }
      }, HEARTBEAT_INTERVAL);
    };

    ws.onmessage = (event: MessageEvent): void => {
      const data = JSON.parse(event.data);

      // Handle different types of messages
      if (data.e === "trade") {
        const now = Date.now();
        if (now - lastTradeTime >= TRADE_THROTTLE) {
          self.postMessage({
            type: "trade",
            data: {
              price: data.p,
              quantity: data.q,
              time: data.T,
              isBuyerMaker: data.m,
            },
          });
          lastTradeTime = now;
        }
      } else if (data.asks && data.bids) {
        // Process order book data
        self.postMessage({
          type: "orderbook",
          data: {
            asks: data.asks.map(([price, quantity]: string[]) => ({
              price,
              quantity,
              total: (parseFloat(price) * parseFloat(quantity)).toFixed(2),
            })),
            bids: data.bids.map(([price, quantity]: string[]) => ({
              price,
              quantity,
              total: (parseFloat(price) * parseFloat(quantity)).toFixed(2),
            })),
          },
        });
      }
    };

    ws.onclose = (): void => {
      if (isClosing) {
        return;
      }

      if (retryCount < MAX_RETRIES) {
        retryCount++;
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(
          `Connection closed. Retrying in ${delay}ms... (Attempt ${retryCount}/${MAX_RETRIES})`
        );

        reconnectTimeout = setTimeout((): void => {
          if (currentSymbol) {
            connect(currentSymbol);
          }
        }, delay);
      } else {
        console.error("Max retries reached. Please check your connection.");
      }
    };

    ws.onerror = (error): void => {
      console.error("WebSocket error:", error);
      cleanupConnection();
    };
  } catch (error) {
    console.error("Connection error:", error);
    reconnectTimeout = setTimeout((): void => {
      connect(symbol);
    }, RECONNECT_DELAY);
  }
}

self.onmessage = (event: MessageEvent): void => {
  const { type, symbol } = event.data;

  switch (type) {
    case "connect":
      connect(symbol);
      break;
    case "disconnect":
      cleanupConnection();
      break;
  }
};
