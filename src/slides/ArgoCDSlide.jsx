import QuestionBox from "../components/QuestionBox";

export default function ArgoCDSlide() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 05</span>
        <h2 className="slide-title">🔄 ArgoCD</h2>
        <p className="slide-subtitle">The GitOps controller — Git is the source of truth. ArgoCD makes the cluster match it.</p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>How ArgoCD Works</div>
          <div className="step-list">
            {[
              { n: "1", title: "Watches a Git repo", desc: "ArgoCD is configured to watch bizmwitu-infra on GitHub. Every ~3 minutes (or via webhook), it checks for changes." },
              { n: "2", title: "Compares desired vs actual", desc: "It reads the YAML in the repo (desired state) and compares it to what's running in the cluster (actual state)." },
              { n: "3", title: "Detects drift", desc: "If deployment.yaml says image tag :15 but the cluster is running :14 → that's drift." },
              { n: "4", title: "Auto-syncs", desc: "With selfHeal: true and prune: true, ArgoCD automatically applies the change. No manual kubectl apply needed." },
            ].map(s => (
              <div key={s.n} className="step-item">
                <div className="step-num">{s.n}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>ArgoCD Application YAML</div>
          <div className="code-block" style={{ fontSize: "11px" }}>
            <span className="key">apiVersion</span>: argoproj.io/v1alpha1{"\n"}
            <span className="key">kind</span>: Application{"\n"}
            <span className="key">metadata</span>:{"\n"}
            {"  "}<span className="key">name</span>: <span className="value">auth-service</span>{"\n"}
            {"  "}<span className="key">namespace</span>: <span className="value">argocd</span>{"\n"}
            {"  "}<span className="key">annotations</span>:{"\n"}
            {"    "}argocd.argoproj.io/sync-wave: <span className="string">"3"</span>  <span className="comment"># deploy order</span>{"\n"}
            <span className="key">spec</span>:{"\n"}
            {"  "}<span className="key">source</span>:{"\n"}
            {"    "}<span className="key">repoURL</span>: <span className="string">https://github.com/ari-bizmwitu/bizmwitu-infra</span>{"\n"}
            {"    "}<span className="key">path</span>: <span className="value">apps/auth-service</span>{"\n"}
            {"  "}<span className="key">destination</span>:{"\n"}
            {"    "}<span className="key">namespace</span>: <span className="value">production</span>{"\n"}
            {"  "}<span className="key">syncPolicy</span>:{"\n"}
            {"    "}<span className="key">automated</span>:{"\n"}
            {"      "}<span className="key">prune</span>: <span className="string">true</span>   <span className="comment"># remove deleted resources</span>{"\n"}
            {"      "}<span className="key">selfHeal</span>: <span className="string">true</span>  <span className="comment"># fix manual changes</span>
          </div>

          <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
            <span className="icon">💡</span>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              <strong style={{ color: "var(--accent)" }}>sync-wave</strong> controls deployment order. Wave 0 (Kafka) deploys first, wave 1 (Config Server) next, all the way to wave 6 (API Gateway).
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>
        Deployment Wave Order (our actual setup)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
        {[
          { wave: "0", name: "Kafka", color: "var(--accent3)", reason: "Event bus — needed by everyone" },
          { wave: "1", name: "Config Server", color: "var(--accent)", reason: "Config source for all services" },
          { wave: "2", name: "Eureka Server", color: "var(--accent)", reason: "Service registry" },
          { wave: "3", name: "Auth Service", color: "#a78bfa", reason: "Auth dependency for others" },
          { wave: "4", name: "User + Org Services", color: "#a78bfa", reason: "Core domain services" },
          { wave: "5", name: "Storage, Billing, Notif, Migrations", color: "var(--accent4)", reason: "Support services" },
          { wave: "6", name: "API Gateway", color: "var(--danger)", reason: "Entry point — needs all backends" },
        ].map(w => (
          <div key={w.wave} style={{
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "10px 12px",
          }}>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                background: "rgba(0,0,0,0.4)",
                color: w.color,
                padding: "1px 7px",
                borderRadius: "3px",
                fontWeight: 700,
              }}>WAVE {w.wave}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: "12px", color: "#fff", marginBottom: "3px" }}>{w.name}</div>
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>{w.reason}</div>
          </div>
        ))}
      </div>

      <QuestionBox
        question="What happens if you manually run kubectl set image deployment/auth-service auth-service=some-other-image on the cluster while ArgoCD is running?"
        answer="ArgoCD will detect the drift within ~3 minutes. Because selfHeal: true is set, it will automatically revert the deployment back to what's in Git. This is the core GitOps principle — the cluster's desired state lives in Git, not in someone's terminal. If you need to change the image, you commit it to Git. This prevents configuration drift and makes deployments auditable."
      />
    </div>
  );
}