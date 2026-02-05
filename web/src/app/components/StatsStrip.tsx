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
  signal: string;
};

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
        const [tvlRaw, params, trendRes, events] = await Promise.all([
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
          publicClient.getLogs({
            address: "0x9D170B23A318514f80FCAe92B44a1A2D1C707288",
            event: {
              type: "event",
              name: "Staked",
              inputs: [
                { name: "user", type: "address", indexed: true },
                { name: "amount", type: "uint256", indexed: false },
                { name: "apyBps", type: "uint16", indexed: false },
              ],
            },
            fromBlock: 79327385n,
          }),
        ]);
        const trend = trendRes.ok ? await trendRes.json() : { label: "Neutral" };
        const tier1 = formatUnits((params as readonly unknown[])[1] as bigint, 18);
        const tier2 = formatUnits((params as readonly unknown[])[2] as bigint, 18);
        const stakers = new Set(
          (events as Array<{ args?: { user?: string } }>).map(
            (e) => e.args?.user
          )
        );
        const activeStakers = stakers.size || 0;
        setStats({
          tvl: formatUnits(tvlRaw as bigint, 18),
          activeStakers: String(activeStakers),
          tierFloor: tier1,
          tierFloor2: tier2,
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
