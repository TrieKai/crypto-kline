import { OrderBookData, TradeData } from "@/types/binance";

type EventMap = {
  trade: TradeData;
  orderbook: OrderBookData;
};

export class BinanceService {
  private static instance: BinanceService;
  private worker: Worker | null = null;
  private subscribers: Map<
    string,
    Set<(data: OrderBookData | TradeData) => void>
  > = new Map();

  private constructor() {
    this.initWorker();
  }

  static getInstance(): BinanceService {
    if (!BinanceService.instance) {
      BinanceService.instance = new BinanceService();
    }
    return BinanceService.instance;
  }

  private initWorker() {
    if (typeof window === "undefined") return;

    this.worker = new Worker(
      new URL("../workers/binanceWorker.ts", import.meta.url)
    );

    this.worker.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.e === "trade") {
        this.notifySubscribers("trade", data);
      } else if (data.asks && data.bids) {
        this.notifySubscribers("orderbook", data);
      }
    };
  }

  subscribe(
    type: keyof EventMap,
    symbol: string,
    callback: (data: OrderBookData | TradeData) => void
  ): void {
    const key = `${type}:${symbol}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
      this.worker?.postMessage({ type: "connect", symbol });
    }
    this.subscribers.get(key)?.add(callback);
  }

  unsubscribe(
    type: keyof EventMap,
    symbol: string,
    callback: (data: OrderBookData | TradeData) => void
  ): void {
    const key = `${type}:${symbol}`;
    this.subscribers.get(key)?.delete(callback);
    if (this.subscribers.get(key)?.size === 0) {
      this.subscribers.delete(key);
      this.worker?.postMessage({ type: "disconnect", symbol });
    }
  }

  private notifySubscribers(
    type: keyof EventMap,
    data: OrderBookData | TradeData
  ): void {
    const key = `${type}:`;
    for (const [subscriberKey, callbacks] of this.subscribers.entries()) {
      if (subscriberKey.startsWith(key)) {
        callbacks.forEach((callback) => callback(data));
      }
    }
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.subscribers.clear();
  }
}
