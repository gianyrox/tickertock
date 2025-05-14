# TickerTock

A real-time stock and cryptocurrency price tracking application built with Next.js.

## Features

- Real-time stock and cryptocurrency price tracking
- Interactive price charts for visualizing trends 
- Custom column selection for personalized data views
- Time range selection to view data over different periods
- Search functionality for stocks and cryptocurrencies
- API request tracking and rate limit management
- Custom API key support - use your own Finnhub API key
- Responsive design for desktop and mobile use

## Technologies Used

- **Next.js** - React framework for the front-end
- **TypeScript** - For type-safe code
- **Finnhub API** - For real-time stock and cryptocurrency data
- **CSS** - For styling components without external dependencies

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Using Your Own API Key

TickerTock comes with a default API key for demo purposes, but you can use your own Finnhub API key:

1. Create a free account at [Finnhub.io](https://finnhub.io/register)
2. Get your API key from the Finnhub dashboard
3. In the TickerTock app, click on "Use Your API Key" button in the header
4. Enter your API key in the modal and save

Your API key will be stored in your browser's localStorage and will be used for all subsequent requests. You can change or remove your API key at any time.

## API Usage Notes

The application uses the Finnhub API with the following limitations:
- Free tier allows 60 API calls per minute
- The application tracks API usage to prevent hitting rate limits
- Data is cached to minimize redundant API calls

### Free Tier Limitations

The free tier of Finnhub API has some limitations:
- No access to historical candle data for certain resolutions/timeframes
- Limited data types and symbols
- For historical charts, the application generates synthetic data based on current prices when candlestick data is not available

To access full historical data, candlestick patterns, and other advanced features, you would need to upgrade to a paid tier on [Finnhub's website](https://finnhub.io/pricing).

## Development Notes

### Code Structure

- `src/components/` - React components
- `src/lib/` - Utility functions and API integrations
- `src/app/` - Next.js app router pages and layouts

### Key Files

- `src/lib/finnhub.ts` - Finnhub API integration with free tier adaptations
- `src/lib/config.ts` - Configuration and API request tracking
- `src/lib/storage.ts` - LocalStorage utilities for API key management
- `src/components/DataTable.tsx` - Main data display component
- `src/components/PriceChart.tsx` - Interactive price chart component
- `src/components/TickerSearch.tsx` - Search component for finding tickers
- `src/components/APIKeyModal.tsx` - Modal for custom API key management

## License

MIT 