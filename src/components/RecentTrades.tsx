"use client";

import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";

interface Trade {
  price: string;
  quantity: string;
  time: number;
  isBuyerMaker: boolean;
}

interface RecentTradesProps {
  symbol: string;
}

export const RecentTrades = ({ symbol }: RecentTradesProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL("../workers/binanceWorker.ts", import.meta.url)
    );

    // Listen for worker messages
    workerRef.current.onmessage = (event) => {
      const data = event.data;
      if (data.e === "trade") {
        const newTrade: Trade = {
          price: data.p,
          quantity: data.q,
          time: data.T,
          isBuyerMaker: data.m,
        };
        setTrades((prev) => [newTrade, ...prev].slice(0, 50));
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

  return (
    <div className="bg-[#1E1E1E] p-4 h-[calc(100vh-2rem)]">
      <div className="grid grid-cols-3 text-xs text-gray-400 gap-2 pb-2 border-b border-gray-800">
        <div>價格</div>
        <div className="text-right">數量</div>
        <div className="text-right">時間</div>
      </div>
      <div className="h-[calc(100%-2rem)] overflow-y-auto">
        {trades.map((trade, index) => (
          <div
            key={index}
            className="grid grid-cols-3 text-xs gap-2 hover:bg-gray-800 py-1"
          >
            <div
              className={trade.isBuyerMaker ? "text-red-500" : "text-green-500"}
            >
              {parseFloat(trade.price).toFixed(2)}
            </div>
            <div className="text-right">
              {parseFloat(trade.quantity).toFixed(4)}
            </div>
            <div className="text-right">
              {dayjs(trade.time).format("HH:mm:ss")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
