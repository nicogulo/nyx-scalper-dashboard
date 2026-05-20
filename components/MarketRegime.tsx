"use client";

import { motion } from "framer-motion";

interface RegimeData {
  symbol: string;
  volatility: string;
  atr_pct: number;
  atr_percentile: number;
  trend: string;
  trend_strength: number;
  vol_ratio: number;
  rsi_5m: number;
  rsi_15m: number;
  ema_alignment: string;
  regime_summary: string;
  current_price?: number;
  params: {
    vol_ratio_min: number;
    tp_pct: number;
    sl_pct: number;
    risk_multiplier: number;
    allow_long: boolean;
    allow_short: boolean;
    confidence_min: string;
  };
  projected?: {
    entry: number;
    long: { tp: number; sl: number };
    short: { tp: number; sl: number };
  };
}

interface LearningSummary {
  completed_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
}

interface MarketRegimeProps {
  regimes: Record<string, RegimeData>;
  learning?: LearningSummary;
}

const volConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  LOW: { emoji: "🟢", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  MEDIUM: { emoji: "🟡", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  HIGH: { emoji: "🟠", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  EXTREME: { emoji: "🔴", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

const trendConfig: Record<string, { emoji: string; color: string }> = {
  STRONG_UP: { emoji: "🚀", color: "text-emerald-400" },
  UP: { emoji: "📈", color: "text-green-400" },
  RANGE: { emoji: "➡️", color: "text-slate-400" },
  DOWN: { emoji: "📉", color: "text-red-400" },
  STRONG_DOWN: { emoji: "⬇️", color: "text-red-500" },
};

function formatPrice(price: number, symbol: string): string {
  if (symbol.includes("BTC")) return price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (price < 1) return price.toFixed(6);
  if (price < 100) return price.toFixed(4);
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MarketRegime({ regimes, learning }: MarketRegimeProps) {
  const regimeList = Object.values(regimes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-700/50 bg-[#12122a] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <span className="font-semibold text-slate-300">Market Regime</span>
        </div>
        {learning && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              {learning.completed_trades} trades • WR {learning.win_rate}%
            </span>
            <span className={`font-bold ${learning.total_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ${learning.total_pnl >= 0 ? "+" : ""}{learning.total_pnl.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {regimeList.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-2xl mb-2">📡</div>
          <p className="text-xs text-slate-500">Awaiting candle data...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {regimeList.map((r) => {
            const vol = volConfig[r.volatility] || volConfig.MEDIUM;
            const trend = trendConfig[r.trend] || trendConfig.RANGE;
            const p = r.params;

            return (
              <div key={r.symbol} className={`rounded-lg border p-3 ${vol.bg}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{r.symbol}</span>
                    <span className={`text-xs ${vol.color}`}>{vol.emoji} {r.volatility}</span>
                    <span className={`text-xs ${trend.color}`}>{trend.emoji} {r.trend}</span>
                  </div>
                  <span className="text-[10px] text-slate-600">
                    ATR {r.atr_pct.toFixed(3)}% | P{r.atr_percentile.toFixed(0)}
                  </span>
                </div>

                {/* Indicators row */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="text-center p-1.5 rounded bg-black/20">
                    <div className="text-[10px] text-slate-500">RSI 5m</div>
                    <div className={`text-xs font-bold ${r.rsi_5m > 70 ? "text-red-400" : r.rsi_5m < 30 ? "text-emerald-400" : "text-white"}`}>
                      {r.rsi_5m.toFixed(0)}
                    </div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-black/20">
                    <div className="text-[10px] text-slate-500">RSI 15m</div>
                    <div className={`text-xs font-bold ${r.rsi_15m > 70 ? "text-red-400" : r.rsi_15m < 30 ? "text-emerald-400" : "text-white"}`}>
                      {r.rsi_15m.toFixed(0)}
                    </div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-black/20">
                    <div className="text-[10px] text-slate-500">Vol</div>
                    <div className="text-xs font-bold text-white">{r.vol_ratio.toFixed(1)}x</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-black/20">
                    <div className="text-[10px] text-slate-500">Strength</div>
                    <div className="text-xs font-bold text-white">{r.trend_strength.toFixed(0)}%</div>
                  </div>
                </div>

                {/* Price Levels */}
                {r.current_price && r.projected && (
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    <div className="text-center p-1.5 rounded bg-blue-500/10 border border-blue-500/20">
                      <div className="text-[10px] text-blue-400">Entry</div>
                      <div className="text-xs font-bold text-blue-300">{formatPrice(r.current_price, r.symbol)}</div>
                    </div>
                    {p.allow_long && (
                      <>
                        <div className="text-center p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          <div className="text-[10px] text-emerald-400">LONG TP</div>
                          <div className="text-xs font-bold text-emerald-300">{formatPrice(r.projected.long.tp, r.symbol)}</div>
                        </div>
                        <div className="text-center p-1.5 rounded bg-red-500/10 border border-red-500/20">
                          <div className="text-[10px] text-red-400">LONG SL</div>
                          <div className="text-xs font-bold text-red-300">{formatPrice(r.projected.long.sl, r.symbol)}</div>
                        </div>
                      </>
                    )}
                    {p.allow_short && (
                      <>
                        <div className="text-center p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          <div className="text-[10px] text-emerald-400">SHORT TP</div>
                          <div className="text-xs font-bold text-emerald-300">{formatPrice(r.projected.short.tp, r.symbol)}</div>
                        </div>
                        <div className="text-center p-1.5 rounded bg-red-500/10 border border-red-500/20">
                          <div className="text-[10px] text-red-400">SHORT SL</div>
                          <div className="text-xs font-bold text-red-300">{formatPrice(r.projected.short.sl, r.symbol)}</div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Adaptive params */}
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex gap-2">
                    <span>TP {(p.tp_pct * 100).toFixed(2)}%</span>
                    <span>SL {(p.sl_pct * 100).toFixed(2)}%</span>
                    <span>Risk {p.risk_multiplier}x</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={p.allow_long ? "text-emerald-400" : "text-red-400/50"}>
                      LONG {p.allow_long ? "✅" : "❌"}
                    </span>
                    <span className={p.allow_short ? "text-emerald-400" : "text-red-400/50"}>
                      SHORT {p.allow_short ? "✅" : "❌"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
