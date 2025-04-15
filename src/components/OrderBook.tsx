"use client";

import { useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { OrderBookEntry, OrderBookData } from "@/types/binance";
import { BinanceService } from "@/services/binanceService";

interface OrderBookProps {
  symbol: string;
}

const OrderRow = ({ index, style, data }: any) => {
  const { order, isAsk } = data[index];
  return (
    <div
      style={style}
      className="grid grid-cols-3 text-xs gap-2 hover:bg-gray-800"
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const service = BinanceService.getInstance();
    const handleOrderBook = (data: OrderBookData) => {
      const processOrders = (orders: string[][]) =>
        orders.map(([price, quantity]) => ({
          price,
          quantity,
          total: (parseFloat(price) * parseFloat(quantity)).toFixed(2),
        }));

      setAsks(processOrders(data.asks));
      setBids(processOrders(data.bids));
    };

    service.subscribe("orderbook", symbol, handleOrderBook);
    return () => service.unsubscribe("orderbook", symbol, handleOrderBook);
  }, [symbol]);

  const asksData = asks
    .slice()
    .reverse()
    .map((order) => ({ order, isAsk: true }));
  const bidsData = bids.map((order) => ({ order, isAsk: false }));
  const allData = [...asksData, ...bidsData];

  return (
    <div className="bg-[#1E1E1E] p-4 h-screen" ref={containerRef}>
      <div className="grid grid-cols-3 text-xs text-gray-400 gap-2 pb-2 border-b border-gray-800">
        <div>價格</div>
        <div className="text-right">數量</div>
        <div className="text-right">總計</div>
      </div>
      <div className="h-[calc(100%-2.5rem)]">
        <List
          height={containerRef.current?.clientHeight ?? 400}
          itemCount={allData.length}
          itemSize={24}
          width="100%"
          itemData={allData}
        >
          {OrderRow}
        </List>
      </div>
    </div>
  );
};
