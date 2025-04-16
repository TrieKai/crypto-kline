"use client";

import { useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import clsx from "clsx";
import { BinanceService } from "@/services/binanceService";
import type { OrderBookEntry, OrderBookData, TradeData } from "@/types/binance";

interface OrderRowData {
  order: OrderBookEntry;
  isAsk: boolean;
}

interface OrderRowProps {
  index: number;
  style: React.CSSProperties;
  data: OrderRowData[];
}

interface OrderBookProps {
  symbol: string;
}

const OrderRow = ({ index, style, data }: OrderRowProps) => {
  const { order, isAsk } = data[index];
  return (
    <div
      style={style}
      className="grid grid-cols-3 items-center text-xs gap-2 hover:bg-gray-800"
    >
      <div className={isAsk ? "text-red-500" : "text-green-500"}>
        {parseFloat(order.price).toFixed(2)}
      </div>
      <div className="text-right">{parseFloat(order.quantity).toFixed(4)}</div>
      <div className="text-right">{order.total}</div>
    </div>
  );
};

export const OrderBook = ({ symbol }: OrderBookProps) => {
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [lastPrice, setLastPrice] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPriceRef = useRef<string>("");

  const asksData = asks
    .slice()
    .reverse()
    .map((order) => ({ order, isAsk: true }));
  const bidsData = bids.map((order) => ({ order, isAsk: false }));
  const allData = [...asksData, ...bidsData];

  useEffect(() => {
    const service = BinanceService.getInstance();
    const handleOrderBook = (data: OrderBookData | TradeData): void => {
      if ("asks" in data && "bids" in data) {
        const processOrders = (orders: string[][]): OrderBookEntry[] =>
          orders.map(([price, quantity]) => ({
            price,
            quantity,
            total: (parseFloat(price) * parseFloat(quantity)).toFixed(2),
          }));

        setAsks(processOrders(data.asks));
        setBids(processOrders(data.bids));
      } else if ("p" in data && "q" in data) {
        const newPrice = data.p;
        setLastPrice(newPrice);

        prevPriceRef.current = newPrice;
      }
    };

    service.subscribe("orderbook", symbol, handleOrderBook);
    service.subscribe("trade", symbol, handleOrderBook);

    return () => {
      service.unsubscribe("orderbook", symbol, handleOrderBook);
      service.unsubscribe("trade", symbol, handleOrderBook);
    };
  }, [symbol]);

  return (
    <div className="bg-[#1E1E1E] p-4 h-screen flex flex-col" ref={containerRef}>
      {/* Title */}
      <div className="text-sm text-gray-300 font-medium mb-2">委託訂單</div>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="grid grid-cols-3 text-xs text-gray-400 gap-2 pb-2 border-b border-gray-800">
          <div>價格</div>
          <div className="text-right">數量</div>
          <div className="text-right">總計</div>
        </div>

        {/* Asks List */}
        <div className="flex-1 overflow-hidden min-h-0">
          <List
            height={Math.floor(
              (containerRef.current?.clientHeight ?? 800) * 0.4
            )}
            itemCount={asksData.length}
            itemSize={24}
            width="100%"
            itemData={asksData}
          >
            {OrderRow}
          </List>
        </div>

        {/* Last Price */}
        <div className="flex justify-center items-center py-2 border-y border-gray-800">
          <div
            className={clsx(
              "text-lg font-semibold",
              lastPrice > prevPriceRef.current
                ? "text-green-500"
                : "text-red-500"
            )}
          >
            {parseFloat(lastPrice || "0").toFixed(2)}
          </div>
        </div>

        {/* Bids List */}
        <div className="flex-1 overflow-hidden min-h-0">
          <List
            height={Math.floor(
              (containerRef.current?.clientHeight ?? 800) * 0.4
            )}
            itemCount={bidsData.length}
            itemSize={24}
            width="100%"
            itemData={bidsData}
          >
            {OrderRow}
          </List>
        </div>
      </div>
    </div>
  );
};
