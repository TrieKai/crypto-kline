"use client";

import { useState } from "react";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { OrderBook } from "@/components/OrderBook";
import { RecentTrades } from "@/components/RecentTrades";

export default function Home() {
  const [symbol] = useState("BTCUSDT");

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <div className="w-full h-full">
        <div className="grid grid-cols-12">
          {/* 委託訂單 */}
          <div className="col-span-2">
            <OrderBook symbol={symbol} />
          </div>

          {/* TradingView 圖表 */}
          <div className="col-span-8">
            <TradingViewWidget />
          </div>

          {/* 最新成交 */}
          <div className="col-span-2">
            <RecentTrades symbol={symbol} />
          </div>
        </div>
      </div>
    </div>
  );
}
