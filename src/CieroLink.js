import { useEffect } from "react";

const styles = `
  .cl-page {
    min-height:100vh;
    background:#F8FAFC;
    color:#0F172A;
    font-family:'DM Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  }
  .cl-hero {
    background:#12355B;
    color:white;
    padding:44px 20px 52px;
  }
  .cl-wrap {
    width:min(960px,100%);
    margin:0 auto;
  }
  .cl-nav {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:16px;
    margin-bottom:54px;
  }
  .cl-brand {
    font-size:15px;
    font-weight:800;
    letter-spacing:0.02em;
  }
  .cl-back {
    color:#F2C94C;
    text-decoration:none;
    font-size:13px;
    font-weight:800;
  }
  .cl-kicker {
    color:#F2C94C;
    font-size:13px;
    font-weight:800;
    text-transform:uppercase;
    letter-spacing:0.08em;
    margin-bottom:12px;
  }
  .cl-title {
    font-size:clamp(38px,7vw,72px);
    line-height:1;
    margin:0 0 14px;
    font-family:'DM Serif Display',Georgia,serif;
    font-weight:500;
  }
  .cl-subtitle {
    font-size:20px;
    line-height:1.35;
    margin:0 0 18px;
    color:#DBEAFE;
    font-weight:700;
  }
  .cl-copy {
    max-width:720px;
    font-size:17px;
    line-height:1.65;
    color:#EFF6FF;
    margin:0;
  }
  .cl-main {
    padding:30px 20px 44px;
  }
  .cl-grid {
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:16px;
    margin-top:-58px;
  }
  .cl-card {
    background:white;
    border:1px solid #E2E8F0;
    border-radius:8px;
    padding:22px;
    box-shadow:0 10px 26px rgba(15,23,42,0.08);
  }
  .cl-card h2 {
    margin:0 0 10px;
    font-size:18px;
    color:#12355B;
  }
  .cl-card p {
    margin:0;
    color:#334155;
    font-size:14px;
    line-height:1.6;
  }
  .cl-project {
    grid-column:span 2;
  }
  .cl-project-top {
    display:flex;
    justify-content:space-between;
    gap:16px;
    align-items:flex-start;
    margin-bottom:8px;
  }
  .cl-pill {
    background:#FFF7D6;
    color:#92400E;
    border:1px solid rgba(242,201,76,0.45);
    border-radius:999px;
    padding:5px 9px;
    font-size:11px;
    font-weight:800;
    white-space:nowrap;
  }
  .cl-button {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    margin-top:16px;
    background:#F2C94C;
    color:#0F172A;
    border-radius:8px;
    padding:12px 15px;
    font-size:14px;
    font-weight:900;
    text-decoration:none;
  }
  .cl-contact {
    margin-top:16px;
    background:#EFF6FF;
    border:1px solid #BFDBFE;
  }
  .cl-email {
    color:#1E5A8A;
    font-weight:900;
    text-decoration:none;
  }
  .cl-footer {
    border-top:1px solid #E2E8F0;
    padding:22px 20px 30px;
    color:#475569;
    font-size:13px;
  }
  .cl-footer strong {
    color:#12355B;
  }
  @media (max-width:760px) {
    .cl-hero { padding:30px 18px 48px; }
    .cl-nav { margin-bottom:38px; }
    .cl-grid { grid-template-columns:1fr; margin-top:-44px; }
    .cl-project { grid-column:auto; }
    .cl-project-top { flex-direction:column; }
  }
`;

function injectStyles() {
  if (document.getElementById("cierolink-css")) return;
  const style = document.createElement("style");
  style.id = "cierolink-css";
  style.textContent = styles;
  document.head.appendChild(style);
}

export default function CieroLink() {
  useEffect(() => {
    document.title = "CieroLink LLC";
  }, []);

  injectStyles();

  return (
    <main className="cl-page">
      <section className="cl-hero">
        <div className="cl-wrap">
          <nav className="cl-nav" aria-label="CieroLink navigation">
            <div className="cl-brand">CieroLink LLC</div>
            <a className="cl-back" href="/">DelcoHelp</a>
          </nav>
          <div className="cl-kicker">Wallingford, PA</div>
          <h1 className="cl-title">CieroLink LLC</h1>
          <p className="cl-subtitle">Community-focused technology for local impact.</p>
          <p className="cl-copy">
            CieroLink LLC builds simple, practical technology tools that help communities access resources, services, and information faster.
          </p>
        </div>
      </section>

      <section className="cl-main">
        <div className="cl-wrap cl-grid">
          <article className="cl-card">
            <h2>About</h2>
            <p>CieroLink LLC is focused on building accessible, community-centered digital tools that solve real local problems.</p>
          </article>

          <article className="cl-card cl-project">
            <div className="cl-project-top">
              <div>
                <h2>DelcoHelp</h2>
                <p>
                  A free community resource app helping Delaware County residents find food, shelter, crisis support, benefits, nutrition tools, and local services.
                </p>
              </div>
              <span className="cl-pill">Project</span>
            </div>
            <a className="cl-button" href="/">Visit DelcoHelp</a>
          </article>

          <article className="cl-card">
            <h2>Mission</h2>
            <p>We believe technology should be simple, useful, and accessible — especially for people trying to find help quickly.</p>
          </article>

          <article className="cl-card cl-contact">
            <h2>Contact</h2>
            <p>
              Questions or partnership ideas:<br />
              <a className="cl-email" href="mailto:cierolink@gmail.com">cierolink@gmail.com</a>
            </p>
          </article>
        </div>
      </section>

      <footer className="cl-footer">
        <div className="cl-wrap">
          <strong>CieroLink LLC</strong><br />
          Wallingford, PA<br />
          Built for community impact.
        </div>
      </footer>
    </main>
  );
}
