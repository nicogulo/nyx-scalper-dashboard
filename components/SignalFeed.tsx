"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SignalEntry {
  ts: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  price: number;
  confidence: string;
  reason: string;
  strategy: string;
  tp?: number;
  sl?: number;
  rsi_5?: number;
  vol_ratio?: number;
  dry_run?: boolean;
  event_type: string;
}

interface RejectionEntry {
  ts: string;
  symbol: string;
  trend_15m: string;
  rsi_5: number;
  rsi_15: number;
  vol_ratio: number;
  reasons: string[];
  event_type: string;
}

interface SignalFeedProps {
  signals: SignalEntry[];
  rejections: RejectionEntry[];
}

function formatTime(ts: string) {
  try {
    if (!ts) return "-";
    const normalized = ts.includes("T") ? ts : ts.replace(" ", "T");
    const d = new Date(normalized + "Z");
    if (isNaN(d.getTime())) return ts;
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin}m lalu`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}j lalu`;
    return (
      d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short" }) +
      " " +
      d.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return ts || "-";
  }
}

function isStale(ts: string): boolean {
  try {
    if (!ts) return true;
    const normalized = ts.includes("T") ? ts : ts.replace(" ", "T");
    const d = new Date(normalized + "Z");
    return (Date.now() - d.getTime()) / 3600000 > 4;
  } catch {
    return true;
  }
}

function formatPrice(p: number, sym: string) {
  if (!p) return "-";
  if (sym?.includes("BTC")) return `$${p.toLocaleString("en", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
  if (p < 1) return `$${p.toFixed(6)}`;
  if (p < 100) return `$${p.toFixed(4)}`;
  return `$${p.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const directionStyles = {
  LONG: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  SHORT: "text-red-400 bg-red-500/10 border-red-500/30",
};

const confidenceColors: Record<string, string> = {
  C2: "text-yellow-400",
  C3: "text-orange-400",
  C4: "text-red-400",
};

export default function SignalFeed({ signals, rejections }: SignalFeedProps) {
  const [activeTab, setActiveTab] = useState<"signals" | "rejections">("signals");
  const [showStale, setShowStale] = useState(false);

  const freshSignals = signals.filter((s) => !isStale(s.ts));
  const staleSignals = signals.filter((s) => isStale(s.ts));
  const displaySignals = showStale ? signals.slice(0, 30) : freshSignals.slice(0, 20);
  const displayRejections = rejections.slice(0, 15);
  const hasStale = staleSignals.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-700/50 bg-[#12122a] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="font-semibold text-slate-300">Signal Feed</span>
          {freshSignals.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              {freshSignals.length} baru
            </span>
          )}
          {hasStale && (
            <span className="px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-500 text-xs">
              +{staleSignals.length} lama
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("signals")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "signals"
                ? "bg-purple-500/30 text-purple-300 border border-purple-500/40"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            Signals
          </button>
          <button
            onClick={() => setActiveTab("rejections")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "rejections"
                ? "bg-orange-500/30 text-orange-300 border border-orange-500/40"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            Rejections
            {rejections.length > 0 && (
              <span className="ml-1 text-orange-400">({rejections.length})</span>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {activeTab === "signals" &&
            (displaySignals.length > 0 ? (
              <>
                {displaySignals.map((sig, i) => (
                  <motion.div
                    key={`sig-${sig.ts}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-lg border p-3 ${
                      sig.direction === "LONG"
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-red-500/20 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold border ${
                            directionStyles[sig.direction]
                          }`}
                        >
                          {sig.direction}
                        </span>
                        <span className="font-bold text-white text-sm">{sig.symbol}</span>
                        <span
                          className={`text-xs font-medium ${
                            confidenceColors[sig.confidence] || "text-slate-400"
                          }`}
                        >
                          {sig.confidence}
                        </span>
                        {sig.strategy && sig.strategy !== "Unknown" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/20">
                            {sig.strategy}
                          </span>
                        )}
                        {sig.dry_run && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            DRY
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{formatTime(sig.ts)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-300">
                        Entry:{" "}
                        <span className="text-white font-medium">
                          {formatPrice(sig.price, sig.symbol)}
                        </span>
                      </span>
                      {sig.tp && <span className="text-emerald-400">TP: {formatPrice(sig.tp, sig.symbol)}</span>}
                      {sig.sl && <span className="text-red-400">SL: {formatPrice(sig.sl, sig.symbol)}</span>}
                      {sig.rsi_5 != null && <span className="text-slate-400">RSI: {sig.rsi_5}</span>}
                      {sig.vol_ratio != null && (
                        <span className="text-slate-400">Vol: {sig.vol_ratio}x</span>
                      )}
                    </div>
                    {sig.reason && (
                      <div className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                        {sig.reason}
                      </div>
                    )}
                  </motion.div>
                ))}
                {/* Stale toggle */}
                {hasStale && !showStale && (
                  <button
                    onClick={() => setShowStale(true)}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 border border-dashed border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-colors"
                  >
                    📦 Tampilkan {staleSignals.length} signal lama (&gt;4 jam)
                  </button>
                )}
                {showStale && hasStale && (
                  <button
                    onClick={() => setShowStale(false)}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 border border-dashed border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-colors"
                  >
                    🔼 Sembunyikan signal lama
                  </button>
                )}
              </>
            ) : (
              <motion.div
                key="no-signals"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="text-3xl mb-2">🔇</div>
                <p className="text-slate-500 text-sm">No fresh signals (last 4 hours)</p>
                <p className="text-slate-600 text-xs mt-1">
                  {hasStale
                    ? `Ada ${staleSignals.length} signal lama — klik di bawah`
                    : "Signals will appear when a strategy triggers"}
                </p>
                {hasStale && (
                  <button
                    onClick={() => setShowStale(true)}
                    className="mt-3 px-3 py-1.5 text-xs text-slate-400 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-colors"
                  >
                    📦 Tampilkan signal lama
                  </button>
                )}
              </motion.div>
            ))}

          {activeTab === "rejections" &&
            (displayRejections.length > 0 ? (
              displayRejections.map((rej, i) => (
                <motion.div
                  key={`rej-${rej.ts}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.02 }}
                  className="rounded-lg border border-slate-700/30 bg-[#1a1a3a] p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">❌</span>
                      <span className="font-medium text-slate-300 text-sm">{rej.symbol}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                        {rej.trend_15m}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600">{formatTime(rej.ts)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mb-1.5">
                    <span className="text-slate-400">
                      RSI: <span className="text-slate-300">{rej.rsi_5}/{rej.rsi_15}</span>
                    </span>
                    <span className="text-slate-400">
                      Vol: <span className="text-slate-300">{rej.vol_ratio}x</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rej.reasons.slice(0, 4).map((r, ri) => (
                      <span
                        key={ri}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-500 border border-slate-700/30"
                      >
                        {r.length > 50 ? r.slice(0, 50) + "…" : r}
                      </span>
                    ))}
                    {rej.reasons.length > 4 && (
                      <span className="text-[10px] text-slate-600">+{rej.reasons.length - 4} more</span>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                key="no-rejections"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="text-3xl mb-2">📭</div>
                <p className="text-slate-500 text-sm">No rejection logs yet</p>
                <p className="text-slate-600 text-xs mt-1">
                  Waiting for candle closes to generate rejection data
                </p>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
