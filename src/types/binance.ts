export interface Trade {
  price: string;
  quantity: string;
  time: number;
  isBuyerMaker: boolean;
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
  total?: string;
}

export interface OrderBookData {
  asks: string[][];
  bids: string[][];
}

export interface TradeData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
  q: string; // Quantity
  b: number; // Buyer order ID
  a: number; // Seller order ID
  T: number; // Trade time
  m: boolean; // Is the buyer the market maker?
  M: boolean; // Ignore
}

export type BinanceEventType = "trade" | "orderbook";
