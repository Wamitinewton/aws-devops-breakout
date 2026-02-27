import QuestionBox from "../components/QuestionBox";

const steps = [
  {
    n: "1",
    icon: "💻",
    actor: "Developer",
    action: "git push to main",
    detail: "Engineer commits code and pushes the service repo to GitHub",
    color: "var(--accent)",
  },
  {
    n: "2",
    icon: "🔔",
    actor: "GitHub",
    action: "Webhook fires",
    detail: "GitHub sends a POST to Jenkins at http://VPS_IP:8080/github-webhook/",
    color: "var(--accent3)",
  },
  {
    n: "3",
    icon: "🔧",
    actor: "Jenkins",
    action: "Pipeline starts",
    detail: "Checks out the repo, runs mvnw package to produce the JAR",
    color: "#a78bfa",
  },
  {
    n: "4",
    icon: "🐳",
    actor: "Jenkins",
    action: "Docker build & push",
    detail: "Builds the image, tags it with the Jenkins BUILD_NUMBER, pushes to GHCR",
    color: "#a78bfa",
  },
  {
    n: "5",
    icon: "✏️",
    actor: "Jenkins",
    action: "Updates GitOps repo",
    detail: "Clones bizmwitu-infra, sed-replaces the image tag in deployment.yaml, commits and pushes",
    color: "#a78bfa",
  },
  {
    n: "6",
    icon: "🔄",
    actor: "ArgoCD",
    action: "Detects drift",
    detail: "ArgoCD sees the new image tag in Git differs from what's running in the cluster",
    color: "var(--accent4)",
  },
  {
    n: "7",
    icon: "⚙️",
    actor: "Kubernetes",
    action: "Rolling update",
    detail: "ArgoCD applies the manifest. k3s starts the new pod, waits for readiness probe, terminates the old one",
    color: "var(--accent4)",
  },
  {
    n: "8",
    icon: "✅",
    actor: "Live",
    action: "New version running",
    detail: "The service is live on the cluster. API Gateway routes traffic to it automatically",
    color: "var(--accent4)",
  },
];

export default function CICDFlow() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 07</span>
        <h2 className="slide-title">The Full CI/CD Pipeline</h2>
        <p className="slide-subtitle">From git push to production — every step, every actor.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {steps.map((s) => (
          <div key={s.n} style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "1rem",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start",
            position: "relative",
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: `2px solid ${s.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0,
              background: "rgba(0,0,0,0.3)",
            }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: s.color, fontWeight: 700 }}>STEP {s.n}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)" }}>{s.actor}</span>
              </div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "13px", color: "#fff", marginBottom: "4px" }}>{s.action}</div>
              <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>{s.detail}</div>
            </div>
            <div style={{
              position: "absolute",
              top: "8px",
              right: "10px",
              fontFamily: "var(--font-mono)",
              fontSize: "20px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.04)",
            }}>{s.n}</div>
          </div>
        ))}
      </div>

      <div className="highlight-box success" style={{ marginBottom: "1rem" }}>
        <span className="icon">🎯</span>
        <div>
          <strong style={{ color: "var(--accent4)" }}>Zero manual deployment steps</strong>
          <span style={{ color: "var(--muted)", fontSize: "12.5px" }}> after initial setup. The entire flow from code to production is automatic. The only human action is writing and pushing code.</span>
        </div>
      </div>

      <div className="highlight-box info">
        <span className="icon">⏱️</span>
        <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>
          <strong style={{ color: "var(--accent)" }}>Typical end-to-end time:</strong> git push → pod running ≈ 3–5 minutes. Jenkins build: ~2min. ArgoCD detection + sync: ~1min. Pod startup (Spring Boot with initialDelaySeconds=120): ~2min.
        </div>
      </div>

      <QuestionBox
        question="If a developer pushes bad code that causes the new pod's readiness probe to fail, what happens to the live service?"
        answer="Nothing breaks for users. Kubernetes performs a rolling update: it starts the new pod first and waits for the readiness probe to return HTTP 200 before terminating the old pod. If the new pod never becomes ready (failureThreshold: 3 failed checks), Kubernetes marks the rollout as failed and stops. The old pod continues running and serving traffic. The service never goes down. This is the value of properly configured readiness probes."
      />
    </div>
  );
}