"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient, formatUnits, http, parseUnits } from "viem";
import { bsc } from "viem/chains";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { stakingAbi } from "@/lib/stakingAbi";
import { tokenAbi } from "@/lib/tokenAbi";
import ConnectStatusButton from "../components/ConnectStatusButton";

const STAKING_ADDRESS =
  process.env.NEXT_PUBLIC_STAKING_ADDRESS ||
  "0x9D170B23A318514f80FCAe92B44a1A2D1C707288";
const TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
  "0x0Cf564A2b5F05699aA9A657bA12d3076b1a8F262";
const STAKING_ADDRESS_HEX = STAKING_ADDRESS as `0x${string}`;
const TOKEN_ADDRESS_HEX = TOKEN_ADDRESS as `0x${string}`;

type NewsItem = {
  title: string;
  link: string;
  pubDate?: string;
  source?: string;
  sentiment?: string;
  category?: string;
  impact?: number;
};

type Trend = {
  score: number;
  label: string;
  momentum?: number;
  phase?: string;
  updatedAt: string;
};

export default function DashboardClient() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [amount, setAmount] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sentiment, setSentiment] = useState({ bull: 0, bear: 0, neutral: 0 });
  const [topImpact, setTopImpact] = useState<NewsItem[]>([]);
  const [trend, setTrend] = useState<Trend | null>(null);
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);
  const [manualStake, setManualStake] = useState<readonly unknown[] | null>(
    null
  );
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const {
    data: stakeInfo,
    error: stakeError,
    refetch: refetchStake,
  } = useReadContract({
    address: STAKING_ADDRESS_HEX,
    abi: stakingAbi,
    functionName: "stakes",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 10000 },
  });

  const {
    data: tier,
    error: tierError,
    refetch: refetchTier,
  } = useReadContract({
    address: STAKING_ADDRESS_HEX,
    abi: stakingAbi,
    functionName: "getTier",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 10000 },
  });

  const {
    data: pending,
    error: pendingError,
    refetch: refetchPending,
  } = useReadContract({
    address: STAKING_ADDRESS_HEX,
    abi: stakingAbi,
    functionName: "pendingReward",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 10000 },
  });

  const stakedAmount = useMemo(() => {
    const info = stakeInfo ?? manualStake;
    if (!info) return "0";
    if (Array.isArray(info)) {
      const amount = info[0];
      return typeof amount === "bigint" ? formatUnits(amount, 18) : "0";
    }
    if (typeof info === "object" && info && "amount" in info) {
      const amount = (info as { amount?: bigint }).amount;
      return typeof amount === "bigint" ? formatUnits(amount, 18) : "0";
    }
    return "0";
  }, [stakeInfo, manualStake]);

  const pendingRewards = useMemo(() => {
    if (!pending) return "0";
    return formatUnits(pending as bigint, 18);
  }, [pending]);

  const numericTier = Number(tier ?? 0);
  const [manualTier, setManualTier] = useState<number | null>(null);
  const effectiveTier = manualTier ?? numericTier;
  const hasStake = Number(stakedAmount) > 0;

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
    if (!address) return;
    if (stakeInfo) return;
    const load = async () => {
      try {
        const data = await publicClient.readContract({
          address: STAKING_ADDRESS_HEX,
          abi: stakingAbi,
          functionName: "stakes",
          args: [address],
        });
        setManualStake(data as readonly unknown[]);
      } catch {
        // ignore
      }
    };
    load();
  }, [address, stakeInfo, publicClient]);

  useEffect(() => {
    if (!address) return;
    const loadTier = async () => {
      try {
        const data = await publicClient.readContract({
          address: STAKING_ADDRESS_HEX,
          abi: stakingAbi,
          functionName: "getTier",
          args: [address],
        });
        setManualTier(Number(data));
      } catch {
        // ignore
      }
    };
    if (tier === undefined || Number(tier) === 0) {
      loadTier();
    }
  }, [address, tier, publicClient]);

  const {
    data: walletBalance,
    error: balanceError,
    refetch: refetchBalance,
  } = useReadContract({
    address: TOKEN_ADDRESS_HEX,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 10000 },
  });

  const walletBalanceFmt = useMemo(() => {
    if (!walletBalance) return "0";
    return formatUnits(walletBalance as bigint, 18);
  }, [walletBalance]);

  const handleApprove = async () => {
    if (!amount) return;
    const wei = parseUnits(amount, 18);
    const hash = await writeContractAsync({
      address: TOKEN_ADDRESS_HEX,
      abi: tokenAbi,
      functionName: "approve",
      args: [STAKING_ADDRESS_HEX, wei],
    });
    setLastTx(hash);
  };

  const handleStake = async () => {
    if (!amount) return;
    const wei = parseUnits(amount, 18);
    const hash = await writeContractAsync({
      address: STAKING_ADDRESS_HEX,
      abi: stakingAbi,
      functionName: "stake",
      args: [wei],
    });
    setLastTx(hash);
  };

  const handleClaim = async () => {
    const hash = await writeContractAsync({
      address: STAKING_ADDRESS_HEX,
      abi: stakingAbi,
      functionName: "claim",
      args: [],
    });
    setLastTx(hash);
  };

  const handleUnstake = async () => {
    const hash = await writeContractAsync({
      address: STAKING_ADDRESS_HEX,
      abi: stakingAbi,
      functionName: "unstake",
      args: [],
    });
    setLastTx(hash);
  };

  useWaitForTransactionReceipt({
    hash: lastTx ?? undefined,
    onSuccess: async () => {
      await Promise.all([
        refetchStake(),
        refetchTier(),
        refetchPending(),
        refetchBalance(),
      ]);
    },
  });

  useEffect(() => {
    if (!isConnected || !hasStake) return;
    const load = async () => {
      const [newsRes, trendRes] = await Promise.all([
        fetch("/api/news"),
        fetch("/api/trend"),
      ]);
      const newsJson = await newsRes.json();
      const trendJson = await trendRes.json();
      setNews(newsJson.items || []);
      setSentiment(newsJson.sentiment || { bull: 0, bear: 0, neutral: 0 });
      setTopImpact(newsJson.topImpact || []);
      setTrend(trendJson);
    };
    load();
  }, [isConnected, hasStake]);

  if (!isConnected) {
    return (
      <section className="section">
        <div className="card card-outline">
          <h3>Connect to Unlock</h3>
          <p className="section-sub">
            Connect your wallet to verify staking status and unlock the
            dashboard.
          </p>
          <ConnectStatusButton className="btn btn-primary" />
        </div>
      </section>
    );
  }

  if (!hasStake) {
    return (
      <section className="section">
        <div className="card card-outline">
          <h3>Stake BTCBR to Access</h3>
          <p className="section-sub">
            Your wallet is connected, but no BTCBR stake was found. Stake to
            unlock the intelligence hub.
          </p>
          <div className="section-sub">Connected: {address}</div>
          <div className="section-sub">Chain ID: {chainId}</div>
          <div className="section-sub">
            Staking Addr: {STAKING_ADDRESS}
          </div>
          <div className="section-sub">Wallet Balance: {walletBalanceFmt}</div>
          <div className="disclaimer">
            stakeInfo: {stakeInfo ? JSON.stringify(stakeInfo) : "null"}{" "}
            manual: {manualStake ? JSON.stringify(manualStake) : "null"}
          </div>
          {stakeError && (
            <div className="disclaimer">stake error: {stakeError.message}</div>
          )}
          {tierError && (
            <div className="disclaimer">tier error: {tierError.message}</div>
          )}
          {pendingError && (
            <div className="disclaimer">pending error: {pendingError.message}</div>
          )}
          {balanceError && (
            <div className="disclaimer">balance error: {balanceError.message}</div>
          )}
          <div className="disclaimer">
            Note: staking must be done via the Stake button. Direct token
            transfers won’t register as a stake.
          </div>
          <div className="hero-actions">
            <input
              className="btn btn-ghost"
              placeholder="Amount to stake"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button className="btn btn-outline" onClick={handleApprove} disabled={isWriting}>
              Approve
            </button>
            <button className="btn btn-primary" onClick={handleStake} disabled={isWriting}>
              Stake Now
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                refetchStake();
                refetchTier();
                refetchPending();
                refetchBalance();
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section">
        <div className="dashboard-row">
          <div className="card card-outline">
            <h3>Wallet Snapshot</h3>
            <strong>Connected</strong>
            <div className="stat">
              <span>Staked</span>
              <span>{stakedAmount} BTCBR</span>
            </div>
            <div className="stat">
              <span>Pending Rewards</span>
              <span>{pendingRewards} BTCBR</span>
            </div>
            <div className="stat">
              <span>Tier</span>
              <span>{effectiveTier}</span>
            </div>
            <div className="hero-actions">
              <button className="btn btn-outline" onClick={handleClaim} disabled={isWriting}>
                Claim
              </button>
              <button className="btn btn-ghost" onClick={handleUnstake} disabled={isWriting}>
                Unstake All
              </button>
            </div>
          </div>

          <div className="card card-outline">
            <h3>Trend Phase</h3>
            <strong>Cycle Scanner</strong>
            {effectiveTier >= 2 ? (
              <>
                <p className="section-sub">
                  Trend engine shows current market posture and momentum shifts.
                </p>
                <div className="trend-gauge">
                  <div className="stat">
                    <span>Phase</span>
                    <span>{trend?.phase || "Loading..."}</span>
                  </div>
                  <div className="stat">
                    <span>Momentum</span>
                    <span>{trend?.momentum ?? 0}%</span>
                  </div>
                  <div className="trend-meter">
                    <span
                      className="trend-pointer"
                      style={{ left: `${trend?.momentum ?? 50}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="section-sub">
                  Trend signals are unlocked at Tier 2.
                </p>
                <div className="tag">Locked: Tier 2</div>
              </>
            )}
          </div>
        </div>
        <div className="dashboard-full">
          <div className="card card-outline">
            <h3>Insights Feed</h3>
            <strong>Market Impact Radar</strong>
            {effectiveTier >= 1 ? (
              <>
                <div className="sentiment-row">
                  <div className="card card-outline">
                    <h3>Bullish</h3>
                    <strong>{sentiment.bull}</strong>
                    <div className="chip bull">Bull</div>
                  </div>
                  <div className="card card-outline">
                    <h3>Neutral</h3>
                    <strong>{sentiment.neutral}</strong>
                    <div className="chip neutral">Neutral</div>
                  </div>
                  <div className="card card-outline">
                    <h3>Bearish</h3>
                    <strong>{sentiment.bear}</strong>
                    <div className="chip bear">Bear</div>
                  </div>
                </div>
                <div className="impact-row">
                  <div className="card card-outline">
                    <h3>Top Impact</h3>
                    <div className="news-list">
                      {topImpact.length === 0 ? (
                        <div className="section-sub">Loading...</div>
                      ) : (
                        topImpact.map((item) => (
                          <div key={item.link} className="news-item">
                            <div className="news-top">
                              <div className="news-thumb">
                                {item.sentiment === "Bullish" ? (
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 48 48"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <rect width="48" height="48" rx="14" fill="#1A2028" />
                                    <circle cx="24" cy="24" r="16" fill="#FFD37A" opacity="0.2" />
                                    <path d="M16 28c2.5-5 13.5-5 16 0" stroke="#FFD37A" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M18 20c1.5-2 3-3 6-3 3 0 4.5 1 6 3" stroke="#FFD37A" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M14 18l4-2M34 18l-4-2" stroke="#FFD37A" strokeWidth="2" strokeLinecap="round" />
                                  </svg>
                                ) : item.sentiment === "Bearish" ? (
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 48 48"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <rect width="48" height="48" rx="14" fill="#1A2028" />
                                    <circle cx="24" cy="24" r="16" fill="#FF4A4A" opacity="0.2" />
                                    <path d="M16 30c2.5-2.5 13.5-2.5 16 0" stroke="#FF4A4A" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M20 18h8" stroke="#FF4A4A" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M17 14l3 3M31 14l-3 3" stroke="#FF4A4A" strokeWidth="2" strokeLinecap="round" />
                                  </svg>
                                ) : (
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 48 48"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <rect width="48" height="48" rx="14" fill="#1A2028" />
                                    <circle cx="24" cy="24" r="16" fill="#9AA4B2" opacity="0.2" />
                                    <path d="M18 26h12" stroke="#9AA4B2" strokeWidth="2" strokeLinecap="round" />
                                    <circle cx="19" cy="20" r="2" fill="#9AA4B2" />
                                    <circle cx="29" cy="20" r="2" fill="#9AA4B2" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {item.title}
                                </a>
                                <div className="news-meta">
                                  <span className="chip">{item.source}</span>
                                  <span className="chip neutral">
                                    {item.category}
                                  </span>
                                  <span
                                    className={`chip ${
                                      item.sentiment === "Bullish"
                                        ? "bull"
                                        : item.sentiment === "Bearish"
                                        ? "bear"
                                        : "neutral"
                                    }`}
                                  >
                                    {item.sentiment}
                                  </span>
                                </div>
                                <div className="impact-bar">
                                  <span
                                    style={{ width: `${item.impact ?? 40}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="news-list">
                  {news.length === 0 ? (
                    <p className="section-sub">Loading latest BTC headlines...</p>
                  ) : (
                    news.slice(0, 8).map((item) => (
                      <div key={item.link} className="news-item">
                        <a href={item.link} target="_blank" rel="noreferrer">
                          {item.title}
                        </a>
                        <div className="news-meta">
                          <span className="chip">{item.source}</span>
                          <span className="chip neutral">{item.category}</span>
                          <span
                            className={`chip ${
                              item.sentiment === "Bullish"
                                ? "bull"
                                : item.sentiment === "Bearish"
                                ? "bear"
                                : "neutral"
                            }`}
                          >
                            {item.sentiment}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="section-sub">
                  Insights unlock at Tier 1.
                </p>
                <div className="tag">Locked: Tier 1</div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
