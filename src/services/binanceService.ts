import { useMarketStore } from "@/store/marketStore";

export class BinanceService {
  private static instance: BinanceService;
  private worker: Worker | null = null;

  private constructor() {
    if (typeof window !== "undefined") {
      this.worker = new Worker(
        new URL("../workers/binanceWorker.ts", import.meta.url)
      );

      this.worker.onmessage = (event: MessageEvent): void => {
        const { type, data } = event.data;
        const store = useMarketStore.getState();

        switch (type) {
          case "trade":
            store.addTrade(data);
            break;
          case "orderbook":
            store.updateOrderBook(data.asks, data.bids);
            break;
        }
      };
    }
  }

  static getInstance(): BinanceService {
    if (!BinanceService.instance) {
      BinanceService.instance = new BinanceService();
    }
    return BinanceService.instance;
  }

  subscribe(symbol: string): void {
    if (this.worker) {
      useMarketStore.getState().setSymbol(symbol);
      this.worker.postMessage({ type: "connect", symbol });
    }
  }

  unsubscribe(): void {
    if (this.worker) {
      this.worker.postMessage({ type: "disconnect" });
    }
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
