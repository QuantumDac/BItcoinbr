import { createPublicClient, http, formatUnits } from "viem";
import { bsc } from "viem/chains";
import { tokenAbi } from "@/lib/tokenAbi";
import { stakingAbi } from "@/lib/stakingAbi";

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

export async function GET(request: Request) {
  const trendUrl = new URL("/api/trend", request.url).toString();
  let tvl = "N/A";
  let tier1 = "N/A";
  let tier2 = "N/A";

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
      tvl = formatUnits(tvlRaw as bigint, 18);
      tier1 = formatUnits((params as readonly unknown[])[1] as bigint, 18);
      tier2 = formatUnits((params as readonly unknown[])[2] as bigint, 18);
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
    activeStakers: "N/A",
    tierFloor: tier1,
    tierFloor2: tier2,
    signal: trend?.label || "Neutral",
    rpcUsed: tvl === "N/A" ? "none" : "ok",
  });
}
