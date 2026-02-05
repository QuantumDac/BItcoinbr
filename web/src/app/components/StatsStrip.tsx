"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient, formatUnits, http } from "viem";
import { bsc } from "viem/chains";
import { tokenAbi } from "@/lib/tokenAbi";
import { stakingAbi } from "@/lib/stakingAbi";

type Stats = {
  tvl: string;
  activeStakers: string;
  tierFloor: string;
  tierFloor2: string;
  apyBps?: string | null;
  nextYearTime?: string | null;
  tokenHolders?: string | null;
  totalTx?: string | null;
  signal: string;
};

function formatTrillions(value?: string) {
  if (!value || value === "N/A") return "N/A";
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  const trillions = num / 1e12;
  return `${trillions.toFixed(2)}T`;
}

export default function StatsStrip() {
  const [stats, setStats] = useState<Stats | null>(null);
  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: bsc,
        transport: http("https://bsc-dataseed.binance.org/"),
      }),
    []
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          if (data?.tvl && data.tvl !== "N/A") {
            setStats(data);
            return;
          }
        }
      } catch {
        // ignore
      }
      try {
        const [tvlRaw, params, trendRes] = await Promise.all([
          publicClient.readContract({
            address: "0x0Cf564A2b5F05699aA9A657bA12d3076b1a8F262",
            abi: tokenAbi,
            functionName: "balanceOf",
            args: ["0x9D170B23A318514f80FCAe92B44a1A2D1C707288"],
          }),
          publicClient.readContract({
            address: "0x9D170B23A318514f80FCAe92B44a1A2D1C707288",
            abi: stakingAbi,
            functionName: "currentParams",
          }),
          fetch("/api/trend"),
        ]);
        const trend = trendRes.ok ? await trendRes.json() : { label: "Neutral" };
        const p = params as readonly unknown[];
        const tier1 = formatUnits(p[1] as bigint, 18);
        const tier2 = formatUnits(p[2] as bigint, 18);
        const apyBps = p[0] as number | bigint;
        const nextYearTime = p[3] as bigint;
        setStats({
          tvl: formatUnits(tvlRaw as bigint, 18),
          activeStakers: "1",
          tierFloor: tier1,
          tierFloor2: tier2,
          apyBps: String(apyBps),
          nextYearTime: String(nextYearTime),
          tokenHolders: "Indexing...",
          totalTx: "Indexing...",
          signal: trend.label || "Neutral",
        });
        return;
      } catch {
        // ignore
      }
      setStats({
        tvl: "N/A",
        activeStakers: "N/A",
        tierFloor: "N/A",
        tierFloor2: "N/A",
        signal: "Neutral",
      });
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="stats">
      <div className="stat-card">
        <span>Staking TVL</span>
        <strong>
          {stats ? `${formatTrillions(stats.tvl)} BTCBR` : "Loading..."}
        </strong>
      </div>
      <div className="stat-card">
        <span>Active Stakers</span>
        <strong>{stats ? stats.activeStakers : "Loading..."}</strong>
      </div>
      <div className="stat-card">
        <span>Current Tier Floor</span>
        <strong>
          {stats ? `${formatTrillions(stats.tierFloor)} BTCBR` : "Loading..."}
        </strong>
      </div>
      <div className="stat-card">
        <span>Signal Status</span>
        <strong>{stats ? stats.signal : "Loading..."}</strong>
      </div>
      <div className="stat-card">
        <span>Current APY</span>
        <strong>
          {stats?.apyBps ? `${Number(stats.apyBps) / 100}%` : "Loading..."}
        </strong>
      </div>
      <div className="stat-card">
        <span>Next Rate Change</span>
        <strong>
          {stats?.nextYearTime
            ? new Date(Number(stats.nextYearTime) * 1000).toLocaleDateString()
            : "Loading..."}
        </strong>
      </div>
      <div className="stat-card">
        <span>Token Holders</span>
        <strong>{stats?.tokenHolders ?? "Indexing..."}</strong>
      </div>
      <div className="stat-card">
        <span>Token Transfers</span>
        <strong>{stats?.totalTx ?? "Indexing..."}</strong>
      </div>
    </div>
  );
}
