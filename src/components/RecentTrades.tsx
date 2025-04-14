"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [`${symbol.toLowerCase()}@trade`],
          id: 1,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.p && data.q) {
        const newTrade: Trade = {
          price: data.p,
          quantity: data.q,
          time: data.T,
          isBuyerMaker: data.m,
        };
        setTrades((prev) => [newTrade, ...prev].slice(0, 50));
      }
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  return (
    <div className="bg-[#1E1E1E] p-4 h-full">
      <div className="grid grid-cols-3 text-xs text-gray-400 gap-2 pb-2 border-b border-gray-800">
        <div>價格</div>
        <div className="text-right">數量</div>
        <div className="text-right">時間</div>
      </div>
      <div className="h-[600px] overflow-y-auto">
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
              {new Date(trade.time).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
