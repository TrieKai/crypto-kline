import { create } from "zustand";
import type { OrderBookEntry, Trade } from "@/types/binance";

interface MarketState {
  symbol: string;
  trades: Trade[];
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  lastPrice: string;
  setSymbol: (symbol: string) => void;
  addTrade: (trade: Trade) => void;
  updateOrderBook: (asks: OrderBookEntry[], bids: OrderBookEntry[]) => void;
  updateLastPrice: (price: string) => void;
}

const MAX_TRADES = 1000;

export const useMarketStore = create<MarketState>((set) => ({
  symbol: "BTCUSDT",
  trades: [],
  asks: [],
  bids: [],
  lastPrice: "",

  setSymbol: (symbol: string): void => {
    set({ symbol });
  },

  addTrade: (trade: Trade): void => {
    set((state) => ({
      trades: [trade, ...state.trades].slice(0, MAX_TRADES),
      lastPrice: trade.price,
    }));
  },

  updateOrderBook: (asks: OrderBookEntry[], bids: OrderBookEntry[]): void => {
    set({
      asks: asks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
      bids: bids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)),
    });
  },

  updateLastPrice: (price: string): void => {
    set({ lastPrice: price });
  },
}));
