import Parser from "rss-parser";

export const runtime = "nodejs";
export const revalidate = 300;

const sources = [
  "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml",
  "https://cointelegraph.com/rss",
  "https://bitcoinmagazine.com/.rss",
  "https://decrypt.co/feed",
];

const bullWords = [
  "bull",
  "breakout",
  "surge",
  "rally",
  "soar",
  "ath",
  "pump",
  "uptrend",
  "accumulate",
];

const bearWords = [
  "bear",
  "crash",
  "dump",
  "sell-off",
  "downtrend",
  "plunge",
  "fear",
  "capitulation",
];

export async function GET() {
  const parser = new Parser();
  let score = 0;

  await Promise.all(
    sources.map(async (url) => {
      try {
        const feed = await parser.parseURL(url);
        feed.items.slice(0, 10).forEach((item) => {
          const text = `${item.title || ""} ${item.contentSnippet || ""}`.toLowerCase();
          bullWords.forEach((w) => {
            if (text.includes(w)) score += 1;
          });
          bearWords.forEach((w) => {
            if (text.includes(w)) score -= 1;
          });
        });
      } catch {
        // ignore source errors
      }
    })
  );

  let label = "Neutral";
  if (score >= 4) label = "Bullish";
  if (score <= -4) label = "Bearish";

  const momentum = Math.min(100, Math.max(0, 50 + score * 7));
  let phase = "Accumulation";
  if (label === "Bullish" && momentum > 65) phase = "Expansion";
  if (label === "Neutral" && momentum >= 45 && momentum <= 65) phase = "Range";
  if (label === "Bearish" && momentum < 40) phase = "Contraction";

  return Response.json({
    score,
    label,
    momentum,
    phase,
    updatedAt: new Date().toISOString(),
  });
}
