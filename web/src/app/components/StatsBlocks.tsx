"use client";

import { useStats } from "./StatsContext";

function formatTrillions(value?: string) {
  if (!value || value === "N/A") return "N/A";
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  const trillions = num / 1e12;
  return `${trillions.toFixed(2)}T`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function StatsLeft() {
  const stats = useStats();
  return (
    <div className="stats-half">
      <StatCard
        label="Staking TVL"
        value={stats ? `${formatTrillions(stats.tvl)} BTCBR` : "Loading..."}
      />
      <StatCard
        label="Active Stakers"
        value={stats ? stats.activeStakers : "Loading..."}
      />
      <StatCard
        label="Current Tier Floor"
        value={stats ? `${formatTrillions(stats.tierFloor)} BTCBR` : "Loading..."}
      />
      <StatCard
        label="Signal Status"
        value={stats ? stats.signal : "Loading..."}
      />
    </div>
  );
}

export function StatsRight() {
  const stats = useStats();
  const apy =
    stats?.apyBps ? `${Number(stats.apyBps) / 100}%` : "Loading...";
  const nextRate =
    stats?.nextYearTime
      ? new Date(Number(stats.nextYearTime) * 1000).toLocaleDateString()
      : "Loading...";
  return (
    <div className="stats-half">
      <StatCard label="Current APY" value={apy} />
      <StatCard label="Next Rate Change" value={nextRate} />
      <StatCard
        label="Token Holders"
        value={stats?.tokenHolders ?? "Indexing..."}
      />
      <StatCard
        label="Token Transfers"
        value={stats?.totalTx ?? "Indexing..."}
      />
    </div>
  );
}
