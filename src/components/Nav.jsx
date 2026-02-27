export default function Nav({ slides, current, goTo }) {
  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      padding: "0.75rem 2rem",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)",
      gap: "0.5rem",
      flexWrap: "wrap",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <span style={{
        fontFamily: "var(--font-head)",
        fontWeight: 800,
        fontSize: "15px",
        color: "#fff",
        marginRight: "1.5rem",
        whiteSpace: "nowrap",
        letterSpacing: "-0.5px",
      }}>
        <span className="glow-text">GitOps</span> Bridge
      </span>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            style={{
              background: i === current ? "rgba(0,229,255,0.12)" : "transparent",
              border: i === current ? "1px solid rgba(0,229,255,0.4)" : "1px solid transparent",
              color: i === current ? "var(--accent)" : "var(--muted)",
              padding: "4px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              transition: "all 0.15s",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={e => { if (i !== current) e.target.style.color = "var(--text)"; }}
            onMouseLeave={e => { if (i !== current) e.target.style.color = "var(--muted)"; }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  );
}