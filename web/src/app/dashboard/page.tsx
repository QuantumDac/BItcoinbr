import DashboardClient from "./DashboardClient";
import ConnectStatusButton from "../components/ConnectStatusButton";

export default function Dashboard() {
  return (
    <div className="page">
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
            <a href="/">Home</a>
            <a href="/#staking">Staking</a>
            <a href="/#insights">Insights</a>
            <a href="/#faq">FAQ</a>
          </div>
          <ConnectStatusButton className="btn btn-primary" />
        </nav>

        <section className="section">
          <div className="badge">Dashboard Access</div>
          <h1 className="section-title">BTCBR Intelligence Hub</h1>
          <p className="section-sub">
            Connect your wallet to unlock trend signals, market intel, and your
            staking performance. This preview shows the layout we’ll wire to
            on-chain data.
          </p>
        </section>

        <DashboardClient />

        <section className="section">
          <div className="cta">
            <div className="cta-panel">
              <h2 className="section-title">Unlock your tier</h2>
              <p className="section-sub">
                Stake BTCBR to enter the Insights tier and track the next cycle
                with confidence.
              </p>
              <div className="hero-actions">
                <ConnectStatusButton className="btn btn-primary" />
                <button className="btn btn-outline">Stake Now</button>
              </div>
            </div>
            <div className="card card-outline">
              <h3>Tier Targets</h3>
              <p className="section-sub">
                Insights: 1T BTCBR · Insights + Trend: 2T BTCBR (doubling yearly)
              </p>
              <div className="tag">APY Locked at Stake</div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div>
            BTCBR — Bitcoin Bear & Bull Run on BSC Mainnet.
            <div className="disclaimer">
              Analytics and staking rewards only. This is not financial advice.
            </div>
            <div className="divider" />
            <a className="tag" href="/#top">
              Back to landing
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
