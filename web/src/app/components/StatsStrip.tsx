"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient, formatUnits, http } from "viem";
import { bsc } from "viem/chains";
import { tokenAbi } from "@/lib/tokenAbi";
import { stakingAbi } from "@/lib/stakingAbi";

const STAKING_ADDRESS =
  process.env.NEXT_PUBLIC_STAKING_ADDRESS ||
  "0x9D170B23A318514f80FCAe92B44a1A2D1C707288";
const TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
  "0x0Cf564A2b5F05699aA657bA12d3076b1a8F262";

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
        transport: http(
          process.env.NEXT_PUBLIC_BSC_RPC_URL ||
            "https://bsc-dataseed.binance.org/"
        ),
      }),
    []
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/trend");
        const trend = res.ok ? await res.json() : { label: "Neutral" };
        const [tvlRaw, params] = await Promise.all([
          publicClient.readContract({
            address: TOKEN_ADDRESS as `0x${string}`,
            abi: tokenAbi,
            functionName: "balanceOf",
            args: [STAKING_ADDRESS as `0x${string}`],
          }),
          publicClient.readContract({
            address: STAKING_ADDRESS as `0x${string}`,
            abi: stakingAbi,
            functionName: "currentParams",
          }),
        ]);
        const tier1 = formatUnits((params as readonly unknown[])[1] as bigint, 18);
        setStats({
          tvl: formatUnits(tvlRaw as bigint, 18),
          activeStakers: "N/A",
          tierFloor: tier1,
          tierFloor2: formatUnits((params as readonly unknown[])[2] as bigint, 18),
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
