import QuestionBox from "../components/QuestionBox";
import CodeBlock from "../components/CodeBlock";

const ArgoCDIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#ef7b4d" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="4" fill="#ef7b4d"/>
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#ef7b4d" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" stroke="#ef7b4d" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const argoAppYaml = `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: auth-service
  namespace: argocd
  annotations:
    argocd.argoproj.io/sync-wave: "3"
spec:
  project: bizmwitu
  source:
    repoURL: https://github.com/ari-bizmwitu/bizmwitu-infra
    targetRevision: main
    path: apps/auth-service
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=false`;

export default function ArgoCDSlide() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 05</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ArgoCDIcon />
          <h2 className="slide-title">ArgoCD</h2>
        </div>
        <p className="slide-subtitle">The GitOps controller — Git is the source of truth. ArgoCD makes the cluster match it.</p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>How ArgoCD Works</div>
          <div className="step-list">
            {[
              { n: "1", title: "Watches a Git repo", desc: "ArgoCD is configured to watch a target GitHub repository. Every ~3 minutes, or via webhook, it checks for changes." },
              { n: "2", title: "Compares desired vs actual", desc: "It reads the YAML in the repo (desired state) and compares it to what is running in the cluster (actual state)." },
              { n: "3", title: "Detects drift", desc: "If deployment.yaml says image tag :15 but the cluster is running :14 — that is drift." },
              { n: "4", title: "Auto-syncs", desc: "With selfHeal: true and prune: true, ArgoCD automatically applies the change. No manual kubectl apply needed." },
            ].map((s) => (
              <div key={s.n} className="step-item">
                <div className="step-num">{s.n}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="highlight-box info" style={{ marginTop: "1rem" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              <strong style={{ color: "var(--accent)" }}>selfHeal: true</strong> means if someone runs <code>kubectl set image</code> directly on the cluster, ArgoCD detects the drift and automatically reverts it back to what Git says. Git always wins.
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>ArgoCD Application YAML</div>
          <CodeBlock code={argoAppYaml} lang="yaml" filename="argocd/applications/app-auth-service.yaml" />

          <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              <strong style={{ color: "var(--accent)" }}>sync-wave</strong> controls deployment order. Wave 0 deploys first, all the way to the last wave. This ensures dependencies like a message bus or config server are running before dependent services.
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>
        Deployment Wave Order
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
        {[
          { wave: "0", name: "Kafka", color: "var(--accent3)", reason: "Event bus — needed by everyone" },
          { wave: "1", name: "Config Server", color: "var(--accent)", reason: "Config source for all services" },
          { wave: "2", name: "Eureka Server", color: "var(--accent)", reason: "Service registry" },
          { wave: "3", name: "Auth Service", color: "#a78bfa", reason: "Auth dependency for others" },
          { wave: "4", name: "User + Org", color: "#a78bfa", reason: "Core domain services" },
          { wave: "5", name: "Storage, Billing, Notif", color: "var(--accent4)", reason: "Support services" },
          { wave: "6", name: "API Gateway", color: "var(--danger)", reason: "Entry point — needs all backends" },
        ].map((w) => (
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
        answer="ArgoCD will detect the drift within ~3 minutes. Because selfHeal: true is set, it will automatically revert the deployment back to what is in Git. This is the core GitOps principle — the cluster's desired state lives in Git, not in someone's terminal. If you need to change the image, you commit it to Git. This prevents configuration drift and makes every deployment auditable."
      />
    </div>
  );
}