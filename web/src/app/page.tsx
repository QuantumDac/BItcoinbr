import ConnectStatusButton from "./components/ConnectStatusButton";

export default function Home() {
  const apySchedule = [
    { year: "Year 1", apy: "25%" },
    { year: "Year 2", apy: "20%" },
    { year: "Year 3", apy: "15%" },
    { year: "Year 4", apy: "10%" },
    { year: "Year 5", apy: "5%" },
    { year: "Year 6", apy: "2%" },
    { year: "Year 7+", apy: "1%" },
  ];

  const tiers = [
    {
      name: "Insights",
      threshold: "1T BTCBR (doubles yearly)",
      perks: "News intelligence, market recaps, signal summaries.",
    },
    {
      name: "Insights + Trend",
      threshold: "2T BTCBR (doubles yearly)",
      perks: "Bull/Bear phase signals, momentum alerts, cycle dashboard.",
    },
  ];

  const faq = [
    {
      q: "Is staking locked?",
      a: "No. You can claim rewards anytime and unstake fully whenever you want.",
    },
    {
      q: "How is APY calculated?",
      a: "APY is fixed at the moment you stake based on the contract year.",
    },
    {
      q: "Do rewards compound automatically?",
      a: "No. Rewards are simple interest. Claiming does not restake unless you do it.",
    },
    {
      q: "Is this financial advice?",
      a: "No. This is an analytics and rewards product. Always do your own research.",
    },
  ];

  return (
    <div className="page" id="top">
      <div className="glow-orb" />
      <div className="glow-orb orb-right" />
      <div className="container">
        <nav className="nav">
          <div className="logo">
            <div className="logo-badge">
              <img src="/btclogo.png" alt="BTC logo" width={28} height={28} />
            </div>
            BTCBR
          </div>
          <div className="nav-links">
            <a href="#top">Home</a>
            <a href="#staking">Staking</a>
            <a href="#insights">Insights</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#faq">FAQ</a>
          </div>
          <ConnectStatusButton className="btn btn-primary" />
        </nav>

        <section className="hero">
          <div>
            <div className="badge">Bitcoin Bear & Bull Run</div>
            <div className="hero-subtitle">Cycle intelligence for bold traders</div>
            <h1>Earn the edge on Bitcoin’s next run.</h1>
            <p>
              Stake BTCBR to unlock premium market insights and bull/bear trend
              signals. Built for gamers, traders, and newcomers who want clarity
              before the next cycle move.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary">Start Staking</button>
              <a className="btn btn-outline" href="/dashboard">
                View Dashboard
              </a>
            </div>
            <div className="ticker">
              <div className="tag">BSC Mainnet</div>
              <div className="tag">Token: 0x0Cf5...F262</div>
              <div className="tag">Staking: 0x9D17...7288</div>
            </div>
            <div className="stats">
              <div className="stat-card">
                <span>Staking TVL</span>
                <strong>Loading...</strong>
              </div>
              <div className="stat-card">
                <span>Active Stakers</span>
                <strong>Loading...</strong>
              </div>
              <div className="stat-card">
                <span>Current Tier Floor</span>
                <strong>1T BTCBR</strong>
              </div>
              <div className="stat-card">
                <span>Signal Status</span>
                <strong>Standby</strong>
              </div>
            </div>
            <div className="ticker-strip">
              <div className="ticker-move">
                {[
                  "BTCBR staking live",
                  "Bull/Bear phase signals incoming",
                  "APY locked on stake",
                  "Insights tiers doubling yearly",
                  "BSC mainnet",
                  "Claim rewards anytime",
                  "No lockup",
                  "Dashboard preview available",
                ].map((item) => (
                  <div key={item} className="ticker-item">
                    <span className="dot" />
                    {item}
                  </div>
                ))}
                {[
                  "BTCBR staking live",
                  "Bull/Bear phase signals incoming",
                  "APY locked on stake",
                  "Insights tiers doubling yearly",
                  "BSC mainnet",
                  "Claim rewards anytime",
                  "No lockup",
                  "Dashboard preview available",
                ].map((item) => (
                  <div key={`${item}-repeat`} className="ticker-item">
                    <span className="dot" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="hero-cards">
            <div className="card card-hero">
              <h3>Current Phase</h3>
              <strong>Bull/Bear Pulse</strong>
              <p className="section-sub">
                Dynamic trend signals and momentum snapshots updated with live
                market data.
              </p>
            </div>
            <div className="card hero-graph">
              <svg viewBox="0 0 600 240" preserveAspectRatio="none">
                <path
                  d="M0,190 C90,120 160,160 230,110 C300,60 360,100 430,70 C510,30 560,40 600,20"
                  fill="none"
                  stroke="rgba(255, 211, 122, 0.85)"
                  strokeWidth="3"
                />
                <path
                  d="M0,210 C90,160 160,190 230,140 C300,90 360,120 430,95 C510,60 560,60 600,45"
                  fill="none"
                  stroke="rgba(255, 74, 74, 0.65)"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="card card-outline">
              <h3>Rewards Engine</h3>
              <strong>APY Locked at Stake</strong>
              <div className="stat">
                <span>Year 1 APY</span>
                <span>25%</span>
              </div>
              <div className="stat">
                <span>Claim Anytime</span>
                <span>Simple Interest</span>
              </div>
            </div>
          </div>
        </section>

        <section id="staking" className="section">
          <h2 className="section-title">Stake. Signal. Win.</h2>
          <p className="section-sub">
            Your APY is fixed when you stake based on the contract year. If you
            unstake and stake again later, your APY updates to the new year’s
            rate.
          </p>
          <div className="divider" />
          <div className="grid-3">
            <div className="card">
              <h3>Step 1</h3>
              <strong>Stake BTCBR</strong>
              <p className="section-sub">
                Stake any amount (no lockup). Rewards start accruing immediately.
              </p>
            </div>
            <div className="card">
              <h3>Step 2</h3>
              <strong>Unlock Insights</strong>
              <p className="section-sub">
                Reach tier thresholds for premium insights and trend modules.
              </p>
            </div>
            <div className="card">
              <h3>Step 3</h3>
              <strong>Claim Anytime</strong>
              <p className="section-sub">
                Simple-interest rewards can be claimed anytime. No compounding.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">APY Schedule</h2>
          <p className="section-sub">
            Rates are tied to the year the contract is in when you stake.
          </p>
          <div className="apy-grid">
            {apySchedule.map((row) => (
              <div key={row.year} className="apy-card">
                <span>{row.year}</span>
                <strong>{row.apy}</strong>
              </div>
            ))}
          </div>
          <div className="table-card apy-gap">
            <table className="table">
              <thead>
                <tr>
                  <th>Contract Year</th>
                  <th>APY</th>
                  <th>Signal Strength</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {apySchedule.map((row, idx) => (
                  <tr key={row.year} className="apy-row">
                    <td>
                      <div className="apy-icon">
                        <span className="apy-badge">{idx < 3 ? "🐂" : "🐻"}</span>
                        <div className="apy-year">{row.year}</div>
                      </div>
                    </td>
                    <td>
                      <span className="apy-pill">{row.apy}</span>
                      <div className="apy-bar">
                        <span style={{ width: `${100 - idx * 12}%` }} />
                      </div>
                    </td>
                    <td className="apy-note">Momentum tier {Math.max(1, 7 - idx)}</td>
                    <td className="apy-note">APY locked at stake time</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="apy-legend">
              <span>
                <i /> Signal strength scales down each year
              </span>
              <span>🐂 Early-cycle momentum</span>
              <span>🐻 Late-cycle defense</span>
            </div>
          </div>
        </section>

        <section id="insights" className="section">
          <h2 className="section-title">Insights Tiers</h2>
          <p className="section-sub">
            Thresholds double each year for the first 7 years. Tier is based on
            your current staked BTCBR.
          </p>
          <div className="tiers">
            {tiers.map((tier) => (
              <div key={tier.name} className="tier-card card-outline">
                <h4>{tier.name}</h4>
                <div className="tag">{tier.threshold}</div>
                <p className="section-sub">{tier.perks}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="dashboard" className="section">
          <h2 className="section-title">Dashboard Preview</h2>
          <p className="section-sub">
            Connect your wallet to unlock live insights, trend phases, and
            personalized signals. Preview is shown below.
          </p>
          <div className="dashboard">
            <div className="card card-outline">
              <h3>Stake Panel</h3>
              <strong>BTCBR Staking</strong>
              <div className="stat">
                <span>Wallet</span>
                <span>Not connected</span>
              </div>
              <div className="stat">
                <span>Tier</span>
                <span>Locked</span>
              </div>
              <div className="hero-actions">
                <ConnectStatusButton className="btn btn-primary" />
                <button className="btn btn-ghost">Stake</button>
              </div>
            </div>
            <div className="card card-outline">
              <h3>Trend Pulse</h3>
              <strong>Cycle Scanner</strong>
              <p className="section-sub">
                Bull/Bear phase signals, momentum shift alerts, and volatility
                bands.
              </p>
              <div className="tag">Locked: Stake to unlock</div>
            </div>
            <div className="card card-outline">
              <h3>News Intel</h3>
              <strong>Market Impact Feed</strong>
              <p className="section-sub">
                Curated headlines with sentiment scoring and impact labels.
              </p>
              <div className="tag">Insights Tier</div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Roadmap</h2>
          <p className="section-sub">
            Delivering a full-cycle intelligence stack with gamified progression.
          </p>
          <div className="roadmap">
            <div className="roadmap-item">
              <div className="roadmap-badge">01</div>
              <div className="roadmap-card">
                <div className="roadmap-meta">Phase 01 · Foundation</div>
                <strong>Launch</strong>
                <p className="section-sub">
                  Staking live, initial APY schedule, tiered insights access.
                </p>
              </div>
            </div>
            <div className="roadmap-item">
              <div className="roadmap-badge">02</div>
              <div className="roadmap-card">
                <div className="roadmap-meta">Phase 02 · Intelligence</div>
                <strong>Signals</strong>
                <p className="section-sub">
                  Trend-phase engine, alert routing, and premium dashboards.
                </p>
              </div>
            </div>
            <div className="roadmap-item">
              <div className="roadmap-badge">03</div>
              <div className="roadmap-card">
                <div className="roadmap-meta">Phase 03 · Engagement</div>
                <strong>Gaming Layer</strong>
                <p className="section-sub">
                  Seasonal quests, leaderboard, and reward boosts for active
                  stakers.
                </p>
              </div>
            </div>
            <div className="roadmap-item">
              <div className="roadmap-badge">04</div>
              <div className="roadmap-card">
                <div className="roadmap-meta">Phase 04 · Scale</div>
                <strong>Expansion</strong>
                <p className="section-sub">
                  Multi-signal packs, partner intel, and pro-grade market
                  analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="cta">
            <div className="cta-panel">
              <h2 className="section-title">Ready to run the cycle?</h2>
              <p className="section-sub">
                Stake BTCBR, lock your APY, and unlock the signal suite powering
                the next market phase.
              </p>
              <div className="hero-actions">
                <ConnectStatusButton className="btn btn-primary" />
                <button className="btn btn-outline">Join the Run</button>
              </div>
            </div>
            <div className="card card-outline">
              <h3>Security Note</h3>
              <p className="section-sub">
                Staking is non-custodial and contract-based. You can claim rewards
                anytime and fully unstake when you want.
              </p>
              <div className="tag">No Lockup</div>
              <div className="tag">Simple Interest</div>
            </div>
          </div>
        </section>

        <section id="faq" className="section">
          <h2 className="section-title">FAQ</h2>
          <div className="grid-3">
            {faq.map((item) => (
              <div key={item.q} className="card card-outline">
                <strong>{item.q}</strong>
                <p className="section-sub">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">
          <div>
            BTCBR — Bitcoin Bear & Bull Run on BSC Mainnet.
            <div className="disclaimer">
              Analytics and staking rewards only. This is not financial advice.
            </div>
            <div className="divider" />
            <a className="tag" href="#top">
              Back to top
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
