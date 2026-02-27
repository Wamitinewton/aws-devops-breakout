export default function Intro() {
  return (
    <div className="slide">
      <div style={{ textAlign: "center", padding: "2rem 0 3rem" }}>
        <div style={{
          display: "inline-block",
          background: "linear-gradient(135deg, rgba(0,229,255,0.1), rgba(124,58,237,0.1))",
          border: "1px solid rgba(0,229,255,0.2)",
          borderRadius: "100px",
          padding: "6px 20px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--accent)",
          letterSpacing: "3px",
          marginBottom: "1.5rem",
        }}>
          AWS STUDENT COMMUNITY DAY · BREAKOUT SESSION
        </div>
        <h1 style={{
          fontFamily: "var(--font-head)",
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1.0,
          marginBottom: "1rem",
          letterSpacing: "-2px",
        }}>
          The <span className="glow-text">GitOps</span> Bridge
        </h1>
        <p style={{
          fontFamily: "var(--font-head)",
          fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
          color: "var(--muted)",
          fontWeight: 600,
          marginBottom: "2rem",
        }}>
          Automating Microservice Deployment for the Modern Cloud
        </p>

        <div style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "3rem",
        }}>
          {["Docker", "Jenkins", "GHCR", "Kubernetes/k3s", "ArgoCD", "Spring Boot"].map(t => (
            <span key={t} className="badge badge-blue">{t}</span>
          ))}
        </div>

        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div className="card" style={{ textAlign: "left" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <span style={{ fontSize: "28px" }}>🎯</span>
              <div>
                <div className="card-title" style={{ marginBottom: "0.75rem" }}>What We'll Cover Today</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem 1.5rem" }}>
                  {[
                    "Core tooling — Docker, Jenkins, ArgoCD, k3s",
                    "What GitOps actually means",
                    "How a microservice goes from code to cloud",
                    "The complete CI/CD pipeline",
                    "Kubernetes service discovery via API Gateway",
                    "Live demo: deploy a new service end-to-end",
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "12.5px", color: "var(--muted)", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--accent4)", marginTop: "2px", flexShrink: 0 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: 700, color: "var(--accent)" }}>10+</div>
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>Microservices</div>
          </div>
          <div style={{ width: "1px", background: "var(--border)" }}></div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: 700, color: "#a78bfa" }}>1</div>
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>VPS</div>
          </div>
          <div style={{ width: "1px", background: "var(--border)" }}></div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: 700, color: "var(--accent4)" }}>GitOps</div>
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>All the way</div>
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: "12px" }}>
          Navigate with <code>← →</code> arrow keys or use the buttons below
        </p>
      </div>
    </div>
  );
}