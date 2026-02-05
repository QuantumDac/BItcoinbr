import Parser from "rss-parser";

export const runtime = "nodejs";
export const revalidate = 300;

const sources = [
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml" },
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { name: "Bitcoin Magazine", url: "https://bitcoinmagazine.com/.rss" },
  { name: "Decrypt", url: "https://decrypt.co/feed" },
];

const sentimentWords = {
  bull: ["bull", "breakout", "surge", "rally", "soar", "ath", "pump", "uptrend"],
  bear: ["bear", "crash", "dump", "sell-off", "downtrend", "plunge", "fear", "capitulation"],
  neutral: ["steady", "flat", "range", "sideways", "consolidate"],
};

const categories = [
  { name: "ETF", keys: ["etf", "blackrock", "fidelity", "inflows", "outflows"] },
  { name: "Regulation", keys: ["sec", "regulation", "law", "compliance", "policy", "ban"] },
  { name: "Macro", keys: ["fed", "rates", "inflation", "cpi", "macro", "dollar"] },
  { name: "Mining", keys: ["mining", "hashrate", "miner", "difficulty", "halving"] },
  { name: "On-chain", keys: ["on-chain", "whale", "wallet", "exchange reserves", "fees"] },
  { name: "Markets", keys: ["price", "volume", "derivatives", "liquidation", "open interest"] },
];

function scoreSentiment(text: string) {
  let score = 0;
  sentimentWords.bull.forEach((w) => {
    if (text.includes(w)) score += 1;
  });
  sentimentWords.bear.forEach((w) => {
    if (text.includes(w)) score -= 1;
  });
  sentimentWords.neutral.forEach((w) => {
    if (text.includes(w)) score += 0;
  });
  let label = "Neutral";
  if (score >= 2) label = "Bullish";
  if (score <= -2) label = "Bearish";
  return { score, label };
}

function pickCategory(text: string) {
  for (const cat of categories) {
    if (cat.keys.some((k) => text.includes(k))) return cat.name;
  }
  return "General";
}

export async function GET() {
  const parser = new Parser();
  const items: {
    title: string;
    link: string;
    pubDate?: string;
    source?: string;
    sentiment: string;
    score: number;
    category: string;
    impact: number;
  }[] = [];

  await Promise.all(
    sources.map(async (src) => {
      try {
        const feed = await parser.parseURL(src.url);
        feed.items.slice(0, 8).forEach((item) => {
          if (!item.title || !item.link) return;
          const text = `${item.title} ${item.contentSnippet || ""}`.toLowerCase();
          const { score, label } = scoreSentiment(text);
          const category = pickCategory(text);
          const impact = Math.min(100, Math.max(10, Math.abs(score) * 15 + (item.title.length % 40)));
          items.push({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: src.name,
            sentiment: label,
            score,
            category,
            impact,
          });
        });
      } catch {
        // ignore source errors
      }
    })
  );

  items.sort((a, b) => {
    const aTime = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const bTime = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return bTime - aTime;
  });

  const sentimentCounts = items.reduce(
    (acc, i) => {
      if (i.sentiment === "Bullish") acc.bull += 1;
      else if (i.sentiment === "Bearish") acc.bear += 1;
      else acc.neutral += 1;
      return acc;
    },
    { bull: 0, bear: 0, neutral: 0 }
  );

  const topImpact = [...items].sort((a, b) => b.impact - a.impact).slice(0, 5);

  return Response.json({
    items: items.slice(0, 20),
    sentiment: sentimentCounts,
    topImpact,
  });
}
