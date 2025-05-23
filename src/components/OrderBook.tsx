"use client";

import { useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import clsx from "clsx";
import { BinanceService } from "@/services/binanceService";
import { useMarketStore } from "@/store/marketStore";
import type { OrderBookEntry } from "@/types/binance";

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
  const [listHeight, setListHeight] = useState<number>(0);
  const asks = useMarketStore((state) => state.asks);
  const bids = useMarketStore((state) => state.bids);
  const lastPrice = useMarketStore((state) => state.lastPrice);
  const containerRef = useRef<HTMLDivElement>(null);
  const asksContainerRef = useRef<HTMLDivElement>(null);
  const bidsContainerRef = useRef<HTMLDivElement>(null);

  // Sort asks and bids by price
  const asksData = [...asks]
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    .map((order) => ({ order, isAsk: true }));
  const bidsData = [...bids]
    .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    .map((order) => ({ order, isAsk: false }));

  // Handle height calculation
  useEffect(() => {
    const calculateHeight = (): void => {
      if (containerRef.current) {
        const titleElement = containerRef.current.querySelector(".title");
        const headerElement = containerRef.current.querySelector(".header");
        const priceElement = containerRef.current.querySelector(".last-price");

        const titleHeight = titleElement?.getBoundingClientRect().height ?? 0;
        const headerHeight = headerElement?.getBoundingClientRect().height ?? 0;
        const priceHeight = priceElement?.getBoundingClientRect().height ?? 0;
        const padding = 32; // Total padding

        const totalHeight = containerRef.current.clientHeight;
        const availableHeight =
          totalHeight - (titleHeight + headerHeight + priceHeight + padding);
        const singleListHeight = Math.floor(availableHeight / 2);

        setListHeight(singleListHeight);
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

  // Subscribe to WebSocket
  useEffect(() => {
    const service = BinanceService.getInstance();
    service.subscribe(symbol);

    return () => {
      service.unsubscribe();
    };
  }, [symbol]);

  return (
    <div className="bg-[#1E1E1E] p-4 h-screen flex flex-col" ref={containerRef}>
      {/* Title */}
      <div className="text-sm text-gray-300 font-medium mb-2 title">
        委託訂單
      </div>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="grid grid-cols-3 text-xs text-gray-400 gap-2 pb-2 border-b border-gray-800 header">
          <div>價格</div>
          <div className="text-right">數量</div>
          <div className="text-right">總計</div>
        </div>

        {/* Asks List */}
        <div className="flex-1 overflow-hidden min-h-0" ref={asksContainerRef}>
          <List
            height={listHeight}
            itemCount={asksData.length}
            itemSize={24}
            width="100%"
            itemData={asksData}
          >
            {OrderRow}
          </List>
        </div>

        {/* Last Price */}
        <div className="flex justify-center items-center py-2 border-y border-gray-800 last-price">
          <div
            className={clsx(
              "text-lg font-semibold",
              parseFloat(lastPrice || "0") > 0
                ? "text-green-500"
                : "text-red-500"
            )}
          >
            {parseFloat(lastPrice || "0").toFixed(2)}
          </div>
        </div>

        {/* Bids List */}
        <div className="flex-1 overflow-hidden min-h-0" ref={bidsContainerRef}>
          <List
            height={listHeight}
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
