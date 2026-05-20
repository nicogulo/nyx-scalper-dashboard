"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import BalanceCard from "@/components/BalanceCard";
import PositionCard from "@/components/PositionCard";
import TradeHistory from "@/components/TradeHistory";
import StatsGrid from "@/components/StatsGrid";
import ErrorLog from "@/components/ErrorLog";
import MarketRegime from "@/components/MarketRegime";
import ConnectivityStatus from "@/components/ConnectivityStatus";

interface TradeEntry {
  ts?: string;
  symbol?: string;
  direction?: string;
  side?: string;
  entry?: number;
  exit?: number;
  qty?: number;
  pnl?: number;
  pnl_pct?: number;
  sl?: number;
  tp?: number;
  rr?: number;
  confidence?: string;
  reason?: string;
  status?: string;
  result?: string;
  close_reason?: string;
  mode?: string;
}

interface StateData {
  testnet: {
    daily_pnl: number;
    daily_fees: number;
    daily_net: number;
    trades_today: number;
    wins: number;
    losses: number;
    balance_start: number;
    cooldown_until: string | null;
    last_reset_date: string;
  } | null;
  trades: TradeEntry[];
  overall: {
    total_pnl: number;
    total_fees: number;
    total_net: number;
    total_wins: number;
    total_losses: number;
    total_trades: number;
    live: { pnl: number; fees: number; net: number; wins: number; losses: number; trades: number };
    testnet: { pnl: number; fees: number; net: number; wins: number; losses: number; trades: number };
  };
  liveSignals: number;
  lastLiveSignal: string | null;
  errors: number;
  lastActivity: string;
  timestamp: number;
}

interface BalanceData {
  testnet: { wallet: number; available: number; unrealized: number; error?: boolean };
  live: { wallet: number; available: number; unrealized: number; error?: boolean };
}

interface PositionsData {
  testnet: Record<string, unknown>[] | { error: string };
  live: Record<string, unknown>[] | { error: string };
}

interface ErrorData {
  errors: { ts: string; msg: string }[];
  total: number;
}

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
  params: {
    vol_ratio_min: number;
    tp_pct: number;
    sl_pct: number;
    risk_multiplier: number;
    allow_long: boolean;
    allow_short: boolean;
    confidence_min: string;
  };
}

interface HealthTest {
  name: string;
  status: "ok" | "warn" | "fail";
  detail: string;
}

interface HealthData {
  tests: HealthTest[];
  summary: { passed: number; total: number; all_ok: boolean };
  error?: string;
}

interface ConfigData {
  mode: string;
  dryRun: boolean;
  isTestnet: boolean;
  isLive: boolean;
  canTrade: boolean;
  pairs: string[];
  serviceStarted: string;
}

export default function Dashboard() {
  const [state, setState] = useState<StateData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [positions, setPositions] = useState<PositionsData | null>(null);
  const [errorLog, setErrorLog] = useState<ErrorData | null>(null);
  const [regimeData, setRegimeData] = useState<{ regimes: Record<string, RegimeData>; learning?: { summary: { completed_trades: number; wins: number; losses: number; win_rate: number; total_pnl: number } } } | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [stateRes, balanceRes, positionsRes, errorsRes, regimeRes, healthRes, configRes] = await Promise.all([
        fetch("/api/state"),
        fetch("/api/balance"),
        fetch("/api/positions"),
        fetch("/api/errors"),
        fetch("/api/regime"),
        fetch("/api/health"),
        fetch("/api/config"),
      ]);
      setState(await stateRes.json());
      setBalance(await balanceRes.json());
      setPositions(await positionsRes.json());
      setErrorLog(await errorsRes.json());
      setRegimeData(await regimeRes.json());
      try { setHealthData(await healthRes.json()); } catch { /* health may fail */ }
      try { setConfig(await configRes.json()); } catch { /* config may fail */ }
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRegime = useCallback(async () => {
    try {
      const res = await fetch("/api/regime");
      setRegimeData(await res.json());
    } catch (err) {
      console.error("Regime fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const s = state?.testnet;
  const overall = state?.overall;
  const trades = state?.trades || [];
  const completedTrades = trades.filter(
    (t) => t.result === "WIN" || t.result === "LOSS" || t.pnl
  );
  const wins = completedTrades.filter((t) => (t.pnl ?? 0) > 0).length;
  const losses = completedTrades.filter((t) => (t.pnl ?? 0) < 0).length;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">👻</div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Nyx Scalper
            </h1>
            <p className="text-sm text-slate-500">
              Binance Futures • Real-time Monitor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 md:mt-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            Daemon Running
          </div>
          <div className="text-xs text-slate-600">
            {lastUpdate.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </motion.header>

      {/* Stats */}
      <div className="mb-6">
        <StatsGrid
          dailyPnl={s?.daily_pnl || 0}
          dailyFees={s?.daily_fees || 0}
          dailyNet={s?.daily_net || 0}
          tradesToday={s?.trades_today || 0}
          wins={wins}
          losses={losses}
          totalTrades={completedTrades.length}
          liveSignals={state?.liveSignals || 0}
          errors={state?.errors || 0}
          lastActivity={state?.lastActivity || ""}
          overallNet={overall?.total_net || 0}
          overallPnl={overall?.total_pnl || 0}
          overallFees={overall?.total_fees || 0}
          overallTrades={overall?.total_trades || 0}
          overallWins={overall?.total_wins || 0}
          overallLosses={overall?.total_losses || 0}
        />
      </div>

      {/* Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <BalanceCard
          label="Testnet"
          icon="🧪"
          color="cyan"
          wallet={balance?.testnet?.wallet || 0}
          available={balance?.testnet?.available || 0}
          unrealized={balance?.testnet?.unrealized || 0}
          error={balance?.testnet?.error}
        />
        <BalanceCard
          label="Live"
          icon="🔴"
          color="purple"
          wallet={balance?.live?.wallet || 0}
          available={balance?.live?.available || 0}
          unrealized={balance?.live?.unrealized || 0}
          error={balance?.live?.error}
        />
      </div>

      {/* Positions + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PositionCard
          testnet={(positions?.testnet || []) as Parameters<typeof PositionCard>[0]["testnet"]}
          live={(positions?.live || []) as Parameters<typeof PositionCard>[0]["live"]}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-700/50 bg-[#12122a] p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📡</span>
            <span className="font-semibold text-slate-300">Bot Configuration</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400 text-sm">Network</span>
              <span className={`font-bold text-sm ${config?.isTestnet ? "text-cyan-400" : "text-red-400"}`}>
                {config?.isTestnet ? "🧪 TESTNET" : "🔴 LIVE"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400 text-sm">Mode</span>
              <span className={`font-bold text-sm ${config?.dryRun ? "text-yellow-400" : "text-emerald-400"}`}>
                {config?.dryRun ? "⚠️ DRY RUN" : "✅ ACTIVE TRADING"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400 text-sm">Can Trade</span>
              <span className={`font-bold text-sm ${config?.canTrade ? "text-emerald-400" : "text-yellow-400"}`}>
                {config?.canTrade ? "✅ Yes" : "❌ No"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400 text-sm">Pairs</span>
              <span className="text-xs text-slate-300">{(config?.pairs || []).join(", ")}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400 text-sm">Signals Detected</span>
              <span className="font-bold text-yellow-400">{state?.liveSignals || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400 text-sm">Errors</span>
              <span className={`font-bold ${(state?.errors || 0) === 0 ? "text-emerald-400" : "text-red-400"}`}>
                {state?.errors || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400 text-sm">Started</span>
              <span className="text-xs text-slate-300">{config?.serviceStarted || "-"}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Market Regime */}
      <div className="mb-6">
        <MarketRegime 
          regimes={regimeData?.regimes || {}} 
          learning={regimeData?.learning?.summary}
          onRefresh={fetchRegime}
        />
      </div>

      {/* Connectivity Status */}
      {healthData && (
        <div className="mb-6">
          <ConnectivityStatus
            tests={healthData.tests || []}
            summary={healthData.summary || { passed: 0, total: 0, all_ok: false }}
            error={healthData.error}
          />
        </div>
      )}

      {/* Trade History + Error Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TradeHistory trades={trades} />
        <ErrorLog errors={errorLog?.errors || []} total={errorLog?.total || 0} />
      </div>

      <footer className="mt-8 text-center text-xs text-slate-600">
        Nyx Scalper V2 • Binance Futures • <span className="text-purple-500">ghost</span> mode
      </footer>
    </div>
  );
}
