"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
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

const StatsCtx = createContext<Stats | null>(null);

export function useStats() {
  return useContext(StatsCtx);
}

export function StatsProvider({ children }: { children: React.ReactNode }) {
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
  }, [publicClient]);

  return <StatsCtx.Provider value={stats}>{children}</StatsCtx.Provider>;
}
