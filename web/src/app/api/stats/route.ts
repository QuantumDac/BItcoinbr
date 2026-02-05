import { createPublicClient, http, formatUnits, getAddress } from "viem";
import { bsc } from "viem/chains";
import { tokenAbi } from "@/lib/tokenAbi";
import { stakingAbi } from "@/lib/stakingAbi";
import { readFile, writeFile } from "fs/promises";

export const runtime = "nodejs";
export const revalidate = 300;

const STAKING_ADDRESS =
  process.env.STAKING_ADDRESS ||
  process.env.NEXT_PUBLIC_STAKING_ADDRESS ||
  "0x9D170B23A318514f80FCAe92B44a1A2D1C707288";
const TOKEN_ADDRESS =
  process.env.TOKEN_ADDRESS ||
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
  "0x0Cf564A2b5F05699aA657bA12d3076b1a8F262";
const RPCS = [
  process.env.BSC_RPC_URL,
  process.env.NEXT_PUBLIC_BSC_RPC_URL,
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.binance.org/",
  "https://bsc-dataseed2.binance.org/",
].filter(Boolean) as string[];

const START_BLOCK = 79327385n;
const CACHE_PATH = "/tmp/btcbr_stakers.json";
const HOLDERS_CACHE = "/tmp/btcbr_holders.json";
const CHUNK = 2000n;
const MAX_CHUNKS = 6n;
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

async function loadCache() {
  try {
    const raw = await readFile(CACHE_PATH, "utf8");
    return JSON.parse(raw) as {
      lastBlock: string;
      stakers: string[];
    };
  } catch {
    return { lastBlock: START_BLOCK.toString(), stakers: [] as string[] };
  }
}

async function saveCache(lastBlock: bigint, stakers: Set<string>) {
  const payload = {
    lastBlock: lastBlock.toString(),
    stakers: Array.from(stakers),
  };
  await writeFile(CACHE_PATH, JSON.stringify(payload));
}

async function loadHolders() {
  try {
    const raw = await readFile(HOLDERS_CACHE, "utf8");
    return JSON.parse(raw) as {
      lastBlock: string;
      holders: string[];
      txCount: number;
    };
  } catch {
    return {
      lastBlock: START_BLOCK.toString(),
      holders: [] as string[],
      txCount: 0,
    };
  }
}

async function saveHolders(lastBlock: bigint, holders: Set<string>, txCount: number) {
  const payload = {
    lastBlock: lastBlock.toString(),
    holders: Array.from(holders),
    txCount,
  };
  await writeFile(HOLDERS_CACHE, JSON.stringify(payload));
}

function decodeAddress(topic: string) {
  return getAddress(`0x${topic.slice(26)}`);
}

export async function GET(request: Request) {
  const trendUrl = new URL("/api/trend", request.url).toString();
  let tvl = "N/A";
  let tier1 = "N/A";
  let tier2 = "N/A";
  let activeStakers = "N/A";
  let apyBps: string | null = null;
  let nextYearTime: string | null = null;
  let tokenHolders: string | null = null;
  let totalTx: string | null = null;

  for (const rpc of RPCS) {
    try {
      const client = createPublicClient({
        chain: bsc,
        transport: http(rpc),
      });
      const [tvlRaw, params] = await Promise.all([
        client.readContract({
          address: TOKEN_ADDRESS as `0x${string}`,
          abi: tokenAbi,
          functionName: "balanceOf",
          args: [STAKING_ADDRESS as `0x${string}`],
        }),
        client.readContract({
          address: STAKING_ADDRESS as `0x${string}`,
          abi: stakingAbi,
          functionName: "currentParams",
        }),
      ]);
      // Incremental staker scan with small batches to avoid RPC limits.
      const latest = await client.getBlockNumber();
      const cache = await loadCache();
      let lastBlock = BigInt(cache.lastBlock);
      const stakers = new Set(cache.stakers.map((s) => getAddress(s)));
      let chunks = 0n;
      while (lastBlock <= latest && chunks < MAX_CHUNKS) {
        const toBlock = lastBlock + CHUNK - 1n > latest ? latest : lastBlock + CHUNK - 1n;
        const logs = await client.getLogs({
          address: STAKING_ADDRESS as `0x${string}`,
          event: {
            type: "event",
            name: "Staked",
            inputs: [
              { name: "user", type: "address", indexed: true },
              { name: "amount", type: "uint256", indexed: false },
              { name: "apyBps", type: "uint16", indexed: false },
            ],
          },
          fromBlock: lastBlock,
          toBlock,
        });
        for (const log of logs) {
          const addr = log.args?.user;
          if (addr) stakers.add(getAddress(addr));
        }
        lastBlock = toBlock + 1n;
        chunks += 1n;
      }
      await saveCache(lastBlock, stakers);
      activeStakers = String(stakers.size);

      // Token holders + total tx (incremental).
      const holdersCache = await loadHolders();
      let holdersBlock = BigInt(holdersCache.lastBlock);
      const holders = new Set(holdersCache.holders.map((s) => getAddress(s)));
      let txCount = holdersCache.txCount || 0;
      let hChunks = 0n;
      while (holdersBlock <= latest && hChunks < MAX_CHUNKS) {
        const toBlock =
          holdersBlock + CHUNK - 1n > latest
            ? latest
            : holdersBlock + CHUNK - 1n;
        const logs = await client.getLogs({
          address: TOKEN_ADDRESS as `0x${string}`,
          topics: [TRANSFER_TOPIC],
          fromBlock: holdersBlock,
          toBlock,
        });
        for (const log of logs) {
          txCount += 1;
          const from = decodeAddress(log.topics[1] as string);
          const to = decodeAddress(log.topics[2] as string);
          if (to !== ZERO_ADDR) holders.add(to);
          if (from !== ZERO_ADDR) holders.add(from);
        }
        holdersBlock = toBlock + 1n;
        hChunks += 1n;
      }
      await saveHolders(holdersBlock, holders, txCount);
      tokenHolders = String(holders.size);
      totalTx = String(txCount);

      tvl = formatUnits(tvlRaw as bigint, 18);
      const p = params as readonly unknown[];
      apyBps = String(p[0] as number | bigint);
      tier1 = formatUnits(p[1] as bigint, 18);
      tier2 = formatUnits(p[2] as bigint, 18);
      nextYearTime = String(p[3] as bigint);
      break;
    } catch {
      // try next rpc
    }
  }

  const trend = await fetch(trendUrl).then((r) =>
    r.ok ? r.json() : { label: "Neutral" }
  );

  return Response.json({
    tvl,
    activeStakers,
    tierFloor: tier1,
    tierFloor2: tier2,
    apyBps,
    nextYearTime,
    tokenHolders,
    totalTx,
    signal: trend?.label || "Neutral",
    rpcUsed: tvl === "N/A" ? "none" : "ok",
  });
}
