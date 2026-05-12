"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import BalanceCard from "@/components/BalanceCard";
import PositionCard from "@/components/PositionCard";
import TradeHistory from "@/components/TradeHistory";
import StatsGrid from "@/components/StatsGrid";

interface DashboardData {
  testnet: {
    daily_pnl: number;
    trades_today: number;
    wins: number;
    losses: number;
    balance_start: number;
    cooldown_until: string | null;
    last_reset: string;
  } | null;
  trades: Record<string, unknown>[];
  liveSignals: number;
  lastLiveSignal: string | null;
  testnetErrors: number;
  lastActivity: string;
  timestamp: string;
}

interface BalanceData {
  testnet: { wallet: number; available: number; unrealized: number; error?: boolean };
  live: { wallet: number; available: number; unrealized: number; error?: boolean };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [stateRes, balanceRes] = await Promise.all([
        fetch("/api/state"),
        fetch("/api/balance"),
      ]);
      const stateData = await stateRes.json();
      const balanceData = await balanceRes.json();
      setData(stateData);
      setBalance(balanceData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // refresh every 15s
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

  const state = data?.testnet;
  const trades = data?.trades || [];
  const completedTrades = trades.filter(
    (t) => t.result === "WIN" || t.result === "LOSS" || t.pnl
  );
  const openTrades = trades.filter((t) => t.status === "PLACED");
  const wins = completedTrades.filter((t) => (t.pnl as number) > 0).length;
  const losses = completedTrades.filter((t) => (t.pnl as number) < 0).length;

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
            <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            Daemon Running
          </div>
          <div className="text-xs text-slate-600">
            Updated: {lastUpdate.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <div className="mb-6">
        <StatsGrid
          dailyPnl={state?.daily_pnl || 0}
          tradesToday={state?.trades_today || 0}
          wins={wins}
          losses={losses}
          totalTrades={completedTrades.length}
          liveSignals={data?.liveSignals || 0}
          errors={data?.testnetErrors || 0}
          lastActivity={data?.lastActivity || ""}
        />
      </div>

      {/* Balance Cards */}
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

      {/* Positions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PositionCard positions={state?.daily_pnl !== undefined ? {} : {}} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-700/50 bg-[#12122a] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📡</span>
            <span className="font-semibold text-slate-300">
              Live Analyze (DRY RUN)
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400">Signals Detected</span>
              <span className="font-bold text-yellow-400">
                {data?.liveSignals || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400">Mode</span>
              <span className="text-sm text-cyan-400">DRY RUN (no execution)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400">Pair</span>
              <span className="font-medium text-white">BTCUSDT</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a3a]">
              <span className="text-slate-400">Errors</span>
              <span
                className={`font-bold ${
                  (data?.testnetErrors || 0) === 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {data?.testnetErrors || 0}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trade History */}
      <TradeHistory trades={trades as Parameters<typeof TradeHistory>[0]["trades"]} />

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-600">
        <p>
          Nyx Scalper V2 • Powered by Binance Futures •{" "}
          <span className="text-purple-500">ghost</span> mode
        </p>
      </footer>
    </div>
  );
}
