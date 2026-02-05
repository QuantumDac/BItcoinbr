# BTCBR Web

Brand: **BTCBR — Bitcoin Bear & Bull Run**  
Tagline: **Earn the edge on Bitcoin’s next run.**

## Key Info
- Token (BTCBR): `0x0Cf564A2b5F05699aA9A657bA12d3076b1a8F262`
- Staking Contract: `0x9D170B23A318514f80FCAe92B44a1A2D1C707288`
- Network: BSC Mainnet

## Required Env
Create `.env.local` with:
```
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_STAKING_ADDRESS=0x9D170B23A318514f80FCAe92B44a1A2D1C707288
NEXT_PUBLIC_TOKEN_ADDRESS=0x0Cf564A2b5F05699aA657bA12d3076b1a8F262
```

## Staking Rules
- APY fixed at stake time based on contract year
- Simple interest (no compounding)
- No lockup (unstake anytime, full withdrawal only)
- Claim rewards anytime
- Tier thresholds double each year for 7 years
  - Year 1: 1T (Insights) / 2T (Insights + Trend)

## APY Schedule
1. Year 1: 25%
2. Year 2: 20%
3. Year 3: 15%
4. Year 4: 10%
5. Year 5: 5%
6. Year 6: 2%
7. Year 7+: 1%

## Development
```bash
npm install
npm run dev
```

Open http://localhost:3000
