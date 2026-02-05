"use client";

import { useEffect, useState } from "react";

type Stats = {
  tvl: string;
  activeStakers: string;
  tierFloor: string;
  tierFloor2: string;
  signal: string;
};

export default function StatsStrip() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          return;
        }
      } catch {
        // ignore
      }
      try {
        const res = await fetch("/api/trend");
        const trend = res.ok ? await res.json() : { label: "Neutral" };
        setStats({
          tvl: "N/A",
          activeStakers: "N/A",
          tierFloor: "N/A",
          tierFloor2: "N/A",
          signal: trend.label || "Neutral",
        });
      } catch {
        setStats({
          tvl: "N/A",
          activeStakers: "N/A",
          tierFloor: "N/A",
          tierFloor2: "N/A",
          signal: "Neutral",
        });
      }
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="stats">
      <div className="stat-card">
        <span>Staking TVL</span>
        <strong>{stats ? `${stats.tvl} BTCBR` : "Loading..."}</strong>
      </div>
      <div className="stat-card">
        <span>Active Stakers</span>
        <strong>{stats ? stats.activeStakers : "Loading..."}</strong>
      </div>
      <div className="stat-card">
        <span>Current Tier Floor</span>
        <strong>{stats ? `${stats.tierFloor} BTCBR` : "Loading..."}</strong>
      </div>
      <div className="stat-card">
        <span>Signal Status</span>
        <strong>{stats ? stats.signal : "Loading..."}</strong>
      </div>
    </div>
  );
}
