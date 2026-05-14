"use client";

import { motion } from "framer-motion";

interface HealthTest {
  name: string;
  status: "ok" | "warn" | "fail";
  detail: string;
}

interface HealthSummary {
  passed: number;
  total: number;
  all_ok: boolean;
}

interface ConnectivityStatusProps {
  tests: HealthTest[];
  summary: HealthSummary;
  error?: string;
}

const statusIcon = {
  ok: "✅",
  warn: "⚠️",
  fail: "❌",
};

const statusColor = {
  ok: "text-emerald-400",
  warn: "text-yellow-400",
  fail: "text-red-400",
};

const statusBg = {
  ok: "bg-emerald-500/10 border-emerald-500/20",
  warn: "bg-yellow-500/10 border-yellow-500/20",
  fail: "bg-red-500/10 border-red-500/20",
};

function categorize(tests: HealthTest[]) {
  const categories: Record<string, { label: string; icon: string; tests: HealthTest[] }> = {
    live_rest: { label: "LIVE — REST API", icon: "📡", tests: [] },
    testnet_rest: { label: "TESTNET — REST API", icon: "🧪", tests: [] },
    bot: { label: "Bot & Services", icon: "🤖", tests: [] },
  };

  for (const t of tests) {
    if (t.name.startsWith("LIVE REST")) {
      categories.live_rest.tests.push(t);
    } else if (t.name.startsWith("TESTNET REST")) {
      categories.testnet_rest.tests.push(t);
    } else {
      categories.bot.tests.push(t);
    }
  }

  return Object.values(categories).filter((c) => c.tests.length > 0);
}

export default function ConnectivityStatus({ tests, summary, error }: ConnectivityStatusProps) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-red-500/30 bg-red-500/5 p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔌</span>
          <span className="font-semibold text-slate-300">Connectivity Status</span>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">❌ Cannot reach API server: {error}</p>
        </div>
      </motion.div>
    );
  }

  const categories = categorize(tests);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-700/50 bg-[#12122a] p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔌</span>
          <span className="font-semibold text-slate-300">Connectivity Status</span>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            summary.all_ok
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {summary.all_ok ? `✅ ${summary.passed}/${summary.total} PASS` : `⚠️ ${summary.passed}/${summary.total} PASS`}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const catOk = cat.tests.every((t) => t.status === "ok");
          return (
            <div key={cat.label}>
              <div className="flex items-center gap-2 mb-2">
                <span>{cat.icon}</span>
                <span className="text-sm font-medium text-slate-400">{cat.label}</span>
                <span className={`text-xs ${catOk ? "text-emerald-400" : "text-yellow-400"}`}>
                  {catOk ? "ALL OK" : "ISSUES"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.tests.map((test) => (
                  <div
                    key={test.name}
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${statusBg[test.status]}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm flex-shrink-0">{statusIcon[test.status]}</span>
                      <span className="text-xs text-slate-300 truncate">
                        {test.name.replace("LIVE REST ", "").replace("TESTNET REST ", "").replace("Service ", "")}
                      </span>
                    </div>
                    {test.detail && (
                      <span className={`text-xs ml-2 flex-shrink-0 ${statusColor[test.status]}`}>
                        {test.detail}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
