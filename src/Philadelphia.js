import { useEffect } from "react";

const placeholderResources = [
  {
    title: "Food pantries and meal sites",
    category: "Food",
    description: "Philadelphia food assistance listings will be added after source-by-source verification.",
  },
  {
    title: "Shelter and housing entry points",
    category: "Shelter",
    description: "Philadelphia-specific shelter and housing contacts must be verified before publication.",
  },
  {
    title: "Benefits and public assistance",
    category: "Benefits",
    description: "SNAP, Medicaid, LIHEAP, childcare, and other benefits guidance for Philadelphia residents.",
  },
  {
    title: "Crisis support",
    category: "Crisis",
    description: "Local Philadelphia crisis support details will be added only after verification.",
  },
  {
    title: "Community resource hubs",
    category: "Community",
    description: "Neighborhood-based support centers and trusted community organizations.",
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  .philly-page * { box-sizing:border-box; }
  .philly-page {
    min-height:100vh;
    margin:0;
    background:linear-gradient(135deg,#f8fafc 0%,#e0f2fe 100%);
    color:#0f172a;
    font-family:'DM Sans',sans-serif;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
  }
  .philly-shell {
    width:390px;
    min-height:780px;
    max-height:calc(100vh - 40px);
    overflow:auto;
    background:#f8fafc;
    border-radius:36px;
    box-shadow:0 32px 64px rgba(15,23,42,0.18),0 0 0 1px rgba(15,23,42,0.06);
  }
  .philly-hero {
    background:#1e3a8a;
    color:white;
    padding:28px 24px 24px;
    border-radius:0 0 28px 28px;
  }
  .philly-kicker {
    font-size:11px;
    font-weight:800;
    letter-spacing:0.08em;
    text-transform:uppercase;
    color:rgba(255,255,255,0.68);
    margin-bottom:6px;
  }
  .philly-title {
    font-family:'DM Serif Display',serif;
    font-size:38px;
    line-height:1;
    margin:0 0 12px;
  }
  .philly-copy {
    font-size:15px;
    line-height:1.55;
    margin:0 0 18px;
    color:rgba(255,255,255,0.88);
  }
  .philly-actions {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
  }
  .philly-button {
    border:0;
    border-radius:14px;
    padding:13px 12px;
    font:800 13px 'DM Sans',sans-serif;
    cursor:pointer;
    text-align:center;
    text-decoration:none;
  }
  .philly-button.primary { background:#facc15; color:#0f172a; }
  .philly-button.secondary { background:rgba(255,255,255,0.14); color:white; border:1px solid rgba(255,255,255,0.24); }
  .philly-content { padding:18px 24px 24px; }
  .philly-note {
    background:#fff7ed;
    border:1px solid #fed7aa;
    border-radius:16px;
    padding:14px;
    color:#7c2d12;
    font-size:12px;
    line-height:1.5;
    font-weight:650;
    margin-bottom:16px;
  }
  .philly-section-title {
    font-size:12px;
    font-weight:800;
    letter-spacing:0.08em;
    text-transform:uppercase;
    color:#475569;
    margin:0 0 10px;
  }
  .philly-card {
    background:white;
    border:1px solid #e2e8f0;
    border-radius:16px;
    padding:15px;
    margin-bottom:10px;
    box-shadow:0 4px 14px rgba(15,23,42,0.05);
  }
  .philly-card-top {
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:10px;
    margin-bottom:8px;
  }
  .philly-card h2 {
    font-size:15px;
    line-height:1.25;
    margin:0;
    color:#0f172a;
  }
  .philly-card p {
    font-size:12px;
    line-height:1.5;
    color:#475569;
    margin:0;
  }
  .philly-tag {
    display:inline-flex;
    align-items:center;
    white-space:nowrap;
    border-radius:999px;
    background:#e0f2fe;
    color:#075985;
    font-size:10px;
    font-weight:800;
    padding:5px 8px;
  }
  .philly-status {
    display:inline-flex;
    margin-top:10px;
    border-radius:999px;
    background:#fef3c7;
    color:#92400e;
    font-size:10px;
    font-weight:800;
    padding:5px 8px;
  }
`;

function injectCSS() {
  if (document.getElementById("phillyhelp-css")) return;
  const style = document.createElement("style");
  style.id = "phillyhelp-css";
  style.textContent = css;
  document.head.appendChild(style);
}

export default function Philadelphia() {
  useEffect(() => {
    document.title = "PhillyHelp";
  }, []);

  injectCSS();

  return (
    <main className="philly-page">
      <div className="philly-shell">
        <section className="philly-hero">
          <div className="philly-kicker">Philadelphia, PA</div>
          <h1 className="philly-title">PhillyHelp</h1>
          <p className="philly-copy">
            Find food, shelter, benefits, crisis support, and community resources in Philadelphia.
          </p>
          <div className="philly-actions">
            <a className="philly-button primary" href="#resources">Browse resources</a>
            <a className="philly-button secondary" href="/">DelcoHelp</a>
          </div>
        </section>

        <section className="philly-content" id="resources">
          <div className="philly-note">
            Philadelphia resource details are placeholders until each listing is verified. No Delaware County crisis or housing numbers are shown here.
          </div>

          <h2 className="philly-section-title">Resource Categories</h2>
          {placeholderResources.map((resource) => (
            <article className="philly-card" key={resource.title}>
              <div className="philly-card-top">
                <h2>{resource.title}</h2>
                <span className="philly-tag">{resource.category}</span>
              </div>
              <p>{resource.description}</p>
              <span className="philly-status">Needs verification</span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
