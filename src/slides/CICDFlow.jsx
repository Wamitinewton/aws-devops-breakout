import {
  FiUser, FiGithub, FiTool, FiBox, FiEdit, FiRefreshCw, FiCloud, FiCheckCircle, FiShield, FiCheck
} from "react-icons/fi";
import FAQ from "../components/FAQ";

const STEPS = [
  {
    n: "01",
    icon: FiUser,
    actor: "Developer",
    action: "git push to main",
    detail: "A developer finishes a feature, commits their code, and pushes to the main branch on GitHub.",
    color: "#60a5fa",
  },
  {
    n: "02",
    icon: FiGithub,
    actor: "GitHub",
    action: "Webhook fired",
    detail: "GitHub immediately sends an HTTP POST (webhook) to Jenkins at /github-webhook/. Jenkins receives the event and queues a new build.",
    color: "#a78bfa",
  },
  {
    n: "03",
    icon: FiTool,
    actor: "Jenkins",
    action: "Pipeline starts — Build & Package",
    detail: "Jenkins runs the Jenkinsfile. Stage 1: checkout source code. Stage 2: build and package the application artifact.",
    color: "#d33833",
  },
  {
    n: "04",
    icon: FiBox,
    actor: "Jenkins",
    action: "Docker build & push to GHCR",
    detail: "docker build creates the image using the multi-stage Dockerfile. Jenkins tags it with the BUILD_NUMBER and pushes to ghcr.io/your-org/app:BUILD_NUMBER.",
    color: "#2496ed",
  },
  {
    n: "05",
    icon: FiEdit,
    actor: "Jenkins",
    action: "Update deployment.yaml in infra repo",
    detail: "Jenkins clones the GitOps infra repo, updates the image tag with the new build number, commits, and pushes. This is the only change needed.",
    color: "#d33833",
  },
  {
    n: "06",
    icon: FiRefreshCw,
    actor: "ArgoCD",
    action: "Detect drift — OutOfSync",
    detail: "ArgoCD polls the infra repo (or receives a webhook). It sees the image tag in deployment.yaml changed. The cluster is now OutOfSync with Git.",
    color: "#ef7b4d",
  },
  {
    n: "07",
    icon: FiCloud,
    actor: "Kubernetes",
    action: "Rolling update begins",
    detail: "ArgoCD applies the updated manifest. Kubernetes starts a rolling update: new pod started → readiness probe passes → traffic shifts → old pod terminated.",
    color: "#326ce5",
  },
  {
    n: "08",
    icon: FiCheckCircle,
    actor: "Production",
    action: "New version live — zero downtime",
    detail: "All replicas are now running the new image. The application is live. ArgoCD status: Synced + Healthy.",
    color: "#10b981",
  },
];

const FAQ_ITEMS = [
  {
    q: "What happens if the Docker push fails in the middle of the pipeline?",
    a: "Jenkins marks the build as FAILED and sends a notification (Slack, email, etc.). The infra repo is NOT updated, so ArgoCD never syncs a broken image. The cluster continues running the previous version. This is a key safety property of the pipeline — partial failures do not result in broken deployments.",
  },
  {
    q: "What if the new pods fail their readiness probe during the rolling update?",
    a: "Kubernetes pauses the rolling update and does not terminate the old pods. The old version continues serving traffic. Your deployment goes into a 'Progressing' state in ArgoCD, and you can roll back with kubectl rollout undo or by reverting the Git commit. The cluster never has zero running pods.",
  },
  {
    q: "How do we handle database migrations in this pipeline?",
    a: "For a beginner setup, the simplest approach is to run migrations as a Kubernetes Job or Init Container that runs before the application pod starts. Tools like Flyway or Liquibase can handle this. The Init Container pattern ensures migrations complete successfully before any app pod receives traffic — preventing startup failures due to missing schema.",
  },
];

const SAFETY_ITEMS = [
  "Failed builds never reach the cluster — infra repo not updated",
  "Rolling updates ensure no downtime — old pods stay until new ones are healthy",
  "Git is the rollback mechanism — revert a commit = revert a deployment",
  "Every deployment is a commit — full audit trail",
];

export default function CICDFlow() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">The Complete Pipeline</span>
        <h1 className="slide-title">
          CI/CD <span className="glow-text">Flow</span> — End to End
        </h1>
        <p className="slide-subtitle">
          Eight steps from a developer's <code>git push</code> to a live deployment in
          Kubernetes — fully automated, zero-downtime, and with complete audit trail.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={s.n} style={{ display: "flex", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: `${s.color}18`,
                  border: `2px solid ${s.color}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: s.color,
                }}>
                  <Icon size={18} />
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{ width: 2, flex: 1, minHeight: 16, background: `linear-gradient(to bottom, ${s.color}33, transparent)`, margin: "4px 0" }} />
                )}
              </div>

              <div style={{
                flex: 1,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${s.color}`,
                borderRadius: "0 10px 10px 0",
                padding: "0.75rem 1rem",
                minWidth: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: s.color,
                    background: `${s.color}15`,
                    borderRadius: "4px",
                    padding: "2px 6px",
                    letterSpacing: "1px",
                  }}>
                    Step {s.n}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "1px" }}>
                    {s.actor}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "14px", color: "#fff", marginBottom: "0.2rem" }}>
                  {s.action}
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)", lineHeight: "1.6" }}>
                  {s.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title"><FiShield size={17} /> Safety Properties</div>
        <div className="card-body">
          <div className="step-list">
            {SAFETY_ITEMS.map((item, i) => (
              <div className="step-item" key={i}>
                <FiCheck size={15} style={{ color: "var(--accent4)", flexShrink: 0, marginTop: 2 }} />
                <div className="step-desc">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
