"use client";

import { useEffect, useRef, useState } from "react";

interface OrderBookEntry {
  price: string;
  quantity: string;
  total?: string;
}

interface OrderBookProps {
  symbol: string;
}

export const OrderBook = ({ symbol }: OrderBookProps) => {
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL("../workers/binanceWorker.ts", import.meta.url)
    );

    // Listen for worker messages
    workerRef.current.onmessage = (event) => {
      const data = event.data;
      if (data.asks && data.bids) {
        const processOrders = (orders: string[][]) =>
          orders.map(([price, quantity]) => ({
            price,
            quantity,
            total: (parseFloat(price) * parseFloat(quantity)).toFixed(2),
          }));

        setAsks(processOrders(data.asks));
        setBids(processOrders(data.bids));
      }
    };

    // Connect WebSocket
    workerRef.current.postMessage({ type: "connect", symbol });

    // Cleanup on component unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "disconnect" });
        workerRef.current.terminate();
      }
    };
  }, [symbol]);

  const renderOrders = (orders: OrderBookEntry[], isAsk: boolean) => (
    <div className="space-y-1">
      {orders.map((order, index) => (
        <div
          key={index}
          className="grid grid-cols-3 text-xs gap-2 hover:bg-gray-800"
        >
          <div className={isAsk ? "text-red-500" : "text-green-500"}>
            {parseFloat(order.price).toFixed(2)}
          </div>
          <div className="text-right">
            {parseFloat(order.quantity).toFixed(4)}
          </div>
          <div className="text-right">{order.total}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-[#1E1E1E] p-4 h-[calc(100vh-2rem)]">
      <div className="grid grid-cols-3 text-xs text-gray-400 gap-2 pb-2 border-b border-gray-800">
        <div>價格</div>
        <div className="text-right">數量</div>
        <div className="text-right">總計</div>
      </div>
      <div className="h-[calc(100%-2rem)] overflow-y-auto space-y-2">
        {renderOrders(asks.slice().reverse(), true)}
        <div className="border-t border-b border-gray-800 py-2 text-center text-sm">
          {parseFloat(bids[0]?.price || "0").toFixed(2)}
        </div>
        {renderOrders(bids, false)}
      </div>
    </div>
  );
};
