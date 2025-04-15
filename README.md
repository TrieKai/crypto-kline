# Crypto Kline

A real-time cryptocurrency trading view application built with Next.js, featuring live price updates, order book visualization, and recent trades tracking. The application is also available as a Progressive Web App (PWA) for enhanced mobile experience.

## Features

### Core Features
- 📊 Real-time cryptocurrency price charts using TradingView
- 📚 Live order book updates
- 💹 Real-time trade history

### Technical Highlights

#### 🚀 Performance Optimizations
- **Virtual List Implementation**: Using `react-window` for efficient rendering of large datasets
  - Optimized order book display with thousands of price levels
  - Smooth scrolling for trade history with minimal memory usage
  - Constant memory footprint regardless of data size

#### 🔄 WebSocket Architecture
- **Web Worker Integration**: Dedicated worker for WebSocket connections
  - Offloads WebSocket processing from the main thread
  - Improves UI responsiveness
  - Handles automatic reconnection
  - Manages multiple data stream subscriptions

#### 📱 Progressive Web App (PWA)
- **Native-like Experience**:
  - Installable on desktop and mobile devices
  - Works offline with service worker caching
  - Fast loading with app-shell architecture
  - Push notification support (coming soon)
- **Cross-platform Compatibility**:
  - Runs on desktop browsers
  - Mobile-responsive design
  - Native-like gestures and interactions

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Lightweight Charts™](https://www.tradingview.com/lightweight-charts/)
- **Data Source**: [Binance WebSocket API](https://binance-docs.github.io/apidocs/spot/en/)
- **PWA**: [next-pwa](https://www.npmjs.com/package/next-pwa)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/TrieKai/crypto-kline.git
   cd crypto-kline
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Build

To create a production build:

```bash
pnpm build
pnpm start
```

## PWA Installation

The application can be installed as a PWA on supported devices:

1. Visit the deployed application using a supported browser (e.g., Chrome)
2. Look for the install prompt in the address bar or browser menu
3. Follow the installation instructions