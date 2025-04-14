"use client";

import { useEffect, useRef } from "react";

interface TradingViewWidgetConfig {
  width: string | number;
  height: number;
  symbol: string;
  interval: string;
  timezone: string;
  theme: "light" | "dark";
  style: string;
  locale: string;
  toolbar_bg: string;
  enable_publishing: boolean;
  allow_symbol_change: boolean;
  container_id: string;
}

declare global {
  interface Window {
    TradingView: {
      widget: new (config: TradingViewWidgetConfig) => void;
    };
  }
}

export const TradingViewWidget = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== "undefined" && container.current?.id) {
        new window.TradingView.widget({
          width: "100%",
          height: 600,
          symbol: "BINANCE:BTCUSDT",
          interval: "60",
          timezone: "Asia/Taipei",
          theme: "dark",
          style: "1",
          locale: "zh_TW",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: container.current.id,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <div id="tradingview_widget" ref={container} />;
};
