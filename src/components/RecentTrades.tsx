"use client";

import { useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import dayjs from "dayjs";
import { Trade, TradeData } from "@/types/binance";
import { BinanceService } from "@/services/binanceService";

interface RecentTradesProps {
  symbol: string;
}

const TradeRow = ({ index, style, data }: any) => {
  const trade = data[index];
  return (
    <div
      style={style}
      className="grid grid-cols-3 text-xs gap-2 hover:bg-gray-800 py-1"
    >
      <div className={trade.isBuyerMaker ? "text-red-500" : "text-green-500"}>
        {parseFloat(trade.price).toFixed(2)}
      </div>
      <div className="text-right">{parseFloat(trade.quantity).toFixed(4)}</div>
      <div className="text-right">{dayjs(trade.time).format("HH:mm:ss")}</div>
    </div>
  );
};

export const RecentTrades = ({ symbol }: RecentTradesProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const service = BinanceService.getInstance();
    const handleTrade = (data: TradeData) => {
      const newTrade: Trade = {
        price: data.p,
        quantity: data.q,
        time: data.T,
        isBuyerMaker: data.m,
      };
      setTrades((prev) => [newTrade, ...prev]);
    };

    service.subscribe("trade", symbol, handleTrade);
    return () => service.unsubscribe("trade", symbol, handleTrade);
  }, [symbol]);

  return (
    <div className="bg-[#1E1E1E] p-4 h-screen" ref={containerRef}>
      <div className="grid grid-cols-3 text-xs text-gray-400 gap-2 pb-2 border-b border-gray-800">
        <div>價格</div>
        <div className="text-right">數量</div>
        <div className="text-right">時間</div>
      </div>
      <div className="h-[calc(100%-2.5rem)]">
        <List
          height={containerRef.current?.clientHeight ?? 400}
          itemCount={trades.length}
          itemSize={24}
          width="100%"
          itemData={trades}
        >
          {TradeRow}
        </List>
      </div>
    </div>
  );
};
