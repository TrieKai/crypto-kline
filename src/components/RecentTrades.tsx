"use client";

import { useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import dayjs from "dayjs";
import { BinanceService } from "@/services/binanceService";
import type { Trade, TradeData, OrderBookData } from "@/types/binance";

interface TradeRowProps {
  index: number;
  style: React.CSSProperties;
  data: Trade[];
}

interface RecentTradesProps {
  symbol: string;
}

const TradeRow = ({ index, style, data }: TradeRowProps) => {
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
  const [listHeight, setListHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const prevPriceRef = useRef<string>("");

  // Handle height calculation
  useEffect(() => {
    const calculateHeight = (): void => {
      if (containerRef.current) {
        const titleElement = containerRef.current.querySelector(".title");
        const headerElement = containerRef.current.querySelector(".header");

        const titleHeight = titleElement?.getBoundingClientRect().height ?? 0;
        const headerHeight = headerElement?.getBoundingClientRect().height ?? 0;
        const padding = 32; // Total padding

        const totalHeight = containerRef.current.clientHeight;
        const availableHeight =
          totalHeight - (titleHeight + headerHeight + padding);

        setListHeight(availableHeight);
      }
    };

    calculateHeight();
    const resizeObserver = new ResizeObserver(calculateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle trade data
  useEffect(() => {
    const service = BinanceService.getInstance();
    const handleTrade = (data: OrderBookData | TradeData): void => {
      if ("p" in data && "q" in data && "T" in data && "m" in data) {
        const newTrade: Trade = {
          price: data.p,
          quantity: data.q,
          time: data.T,
          isBuyerMaker: data.m,
        };
        setTrades((prev) => [newTrade, ...prev]);
        prevPriceRef.current = data.p;
      }
    };

    service.subscribe("trade", symbol, handleTrade);

    return () => {
      service.unsubscribe("trade", symbol, handleTrade);
    };
  }, [symbol]);

  return (
    <div className="bg-[#1E1E1E] p-4 h-screen flex flex-col" ref={containerRef}>
      {/* Title */}
      <div className="text-sm text-gray-300 font-medium mb-2 title">
        最新成交
      </div>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="grid grid-cols-3 text-xs text-gray-400 gap-2 py-2 border-b border-gray-800 header">
          <div>價格</div>
          <div className="text-right">數量</div>
          <div className="text-right">時間</div>
        </div>

        {/* Trade List */}
        <div className="flex-1 overflow-hidden min-h-0" ref={listContainerRef}>
          <List
            height={listHeight}
            itemCount={trades.length}
            itemSize={24}
            width="100%"
            itemData={trades}
          >
            {TradeRow}
          </List>
        </div>
      </div>
    </div>
  );
};
