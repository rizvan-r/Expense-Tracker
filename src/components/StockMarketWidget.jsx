import React, { useState, useEffect } from 'react';
import { fetchMultipleStockQuotes, fetchFinnhubStockQuote } from '../services/apiService';
import { Card } from './UI/Card';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Zap,
  Activity,
  DollarSign,
  IndianRupee,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';

const DEFAULT_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'AMZN', 'TSLA'];

export const StockMarketWidget = () => {
  const [stockQuotes, setStockQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const USD_TO_INR = 83.50; // Conversion rate for INR display

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMultipleStockQuotes(DEFAULT_SYMBOLS);
      setStockQuotes(data);
    } catch (err) {
      console.warn('Error loading Finnhub stock quotes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const handleSearchStock = async (e) => {
    e.preventDefault();
    if (!searchSymbol.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const quote = await fetchFinnhubStockQuote(searchSymbol.trim());
      if (quote && quote.currentPrice) {
        setStockQuotes(prev => {
          const exists = prev.some(q => q.symbol === quote.symbol);
          if (exists) {
            return prev.map(q => q.symbol === quote.symbol ? quote : q);
          }
          return [quote, ...prev];
        });
        setSearchSymbol('');
      } else {
        setSearchError(`Symbol "${searchSymbol.toUpperCase()}" not found or inactive.`);
      }
    } catch (err) {
      setSearchError('Error fetching stock quote. Please verify symbol.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="p-6 space-y-5">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-heading">Real-Time Stock Market Ticker</h3>
              <Badge variant="emerald" className="animate-pulse flex items-center gap-1 text-[10px]">
                <Sparkles className="w-3 h-3" /> Powered by Finnhub API
              </Badge>
            </div>
            <p className="text-xs text-slate-400">Live global market quotes, daily price movements, and investment trends</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Symbol Lookup Form */}
          <form onSubmit={handleSearchStock} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Lookup (e.g. NVDA, AAPL)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                className="w-36 sm:w-44 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
            <Button type="submit" size="sm" variant="secondary" isLoading={isSearching} icon={Plus}>
              Add
            </Button>
          </form>

          <button
            onClick={loadQuotes}
            disabled={isLoading}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-all"
            title="Refresh Live Stock Quotes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {searchError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
          {searchError}
        </div>
      )}

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockQuotes.map((stock) => {
          const isPositive = (stock.change || 0) >= 0;
          const priceInINR = (stock.currentPrice || 0) * USD_TO_INR;
          const changeInINR = (stock.change || 0) * USD_TO_INR;

          return (
            <div
              key={stock.symbol}
              className="p-4 bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 rounded-2xl space-y-3 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors font-heading">
                    {stock.symbol}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate max-w-[120px]">
                    {stock.name || `${stock.symbol} Corp`}
                  </span>
                </div>

                <Badge variant={isPositive ? 'emerald' : 'rose'} className="flex items-center gap-1 font-bold">
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isPositive ? '+' : ''}{(stock.percentChange || 0).toFixed(2)}%
                </Badge>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xl font-black text-white font-heading">
                    ${(stock.currentPrice || 0).toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    ≈ ₹{priceInINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}${(stock.change || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">24h Change</span>
                </div>
              </div>

              {/* Day High / Low Range bar */}
              {stock.high && stock.low && (
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Low: ${stock.low.toFixed(1)}</span>
                    <span className="font-semibold text-slate-300">Daily Range</span>
                    <span>High: ${stock.high.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{
                        width: `${Math.min(100, Math.max(10, ((stock.currentPrice - stock.low) / (stock.high - stock.low || 1)) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
