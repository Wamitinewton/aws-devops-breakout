import QuestionBox from "../components/QuestionBox";

const steps = [
  {
    n: "01",
    actor: "Developer",
    action: "git push to main",
    detail: "Engineer commits code and pushes the service repository to GitHub.",
    color: "var(--accent)",
  },
  {
    n: "02",
    actor: "GitHub",
    action: "Webhook fires",
    detail: "GitHub sends a POST to the Jenkins webhook endpoint on the server.",
    color: "var(--accent3)",
  },
  {
    n: "03",
    actor: "Jenkins",
    action: "Pipeline starts",
    detail: "Checks out the repo and runs mvnw package to produce the compiled JAR.",
    color: "#a78bfa",
  },
  {
    n: "04",
    actor: "Jenkins",
    action: "Docker build & push",
    detail: "Builds the image, tags it with the Jenkins BUILD_NUMBER, pushes to GHCR.",
    color: "#a78bfa",
  },
  {
    n: "05",
    actor: "Jenkins",
    action: "Updates GitOps repo",
    detail: "Clones the infra repo, replaces the image tag in deployment.yaml, commits and pushes.",
    color: "#a78bfa",
  },
  {
    n: "06",
    actor: "ArgoCD",
    action: "Detects drift",
    detail: "ArgoCD sees the new image tag in Git differs from what is running in the cluster.",
    color: "var(--accent4)",
  },
  {
    n: "07",
    actor: "Kubernetes",
    action: "Rolling update",
    detail: "ArgoCD applies the manifest. k3s starts the new pod, waits for the readiness probe, terminates the old one.",
    color: "var(--accent4)",
  },
  {
    n: "08",
    actor: "Live",
    action: "New version running",
    detail: "The service is live on the cluster. The API Gateway routes traffic to it automatically.",
    color: "var(--accent4)",
  },
];

export default function CICDFlow() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 06</span>
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
            overflow: "hidden",
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: `1.5px solid ${s.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 700,
              color: s.color,
              flexShrink: 0,
              background: "rgba(0,0,0,0.3)",
            }}>{s.n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)" }}>{s.actor}</span>
              </div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "13px", color: "#fff", marginBottom: "4px" }}>{s.action}</div>
              <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="highlight-box success" style={{ marginBottom: "1rem" }}>
        <div>
          <strong style={{ color: "var(--accent4)" }}>Zero manual deployment steps</strong>
          <span style={{ color: "var(--muted)", fontSize: "12.5px" }}> after initial setup. The entire flow from code to production is automatic. The only human action is writing and pushing code.</span>
        </div>
      </div>

      <div className="highlight-box info">
        <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>
          <strong style={{ color: "var(--accent)" }}>Typical end-to-end time:</strong> git push to pod running is approximately 3–5 minutes. Jenkins build: ~2 min. ArgoCD detection and sync: ~1 min. Pod startup with Spring Boot initialDelaySeconds: ~2 min.
        </div>
      </div>

      <QuestionBox
        question="If a developer pushes bad code that causes the new pod's readiness probe to fail, what happens to the live service?"
        answer="Nothing breaks for users. Kubernetes performs a rolling update: it starts the new pod first and waits for the readiness probe to return HTTP 200 before terminating the old pod. If the new pod never becomes ready (failureThreshold: 3 failed checks), Kubernetes marks the rollout as failed and stops. The old pod continues running and serving traffic. The service never goes down. This is the value of properly configured readiness probes."
      />
    </div>
  );
}