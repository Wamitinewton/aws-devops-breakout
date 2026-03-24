import FAQ from "../components/FAQ";

const TOOLS = [
  {
    icon: "🐳",
    name: "Docker",
    color: "#2496ed",
    badge: "Containerisation",
    badgeClass: "badge-blue",
    desc: "Docker packages your application and all its dependencies into a single portable unit called a container. The container runs identically on any machine — your laptop, a CI server, or a cloud VM.",
  },
  {
    icon: "🔧",
    name: "Jenkins",
    color: "#d33833",
    badge: "CI Automation",
    badgeClass: "badge-red",
    desc: "Jenkins is an open-source automation server. It watches your Git repository for changes, then automatically builds your code, runs tests, builds a Docker image, and pushes it to a registry.",
  },
  {
    icon: "☸️",
    name: "Kubernetes",
    color: "#326ce5",
    badge: "Orchestration",
    badgeClass: "badge-blue",
    desc: "Kubernetes (K8s) manages groups of containers across many servers. It handles scaling, self-healing, rolling updates, and service discovery so you don't have to.",
  },
  {
    icon: "🔄",
    name: "ArgoCD",
    color: "#ef7b4d",
    badge: "GitOps CD",
    badgeClass: "badge-amber",
    desc: "ArgoCD continuously watches a Git repository and ensures that what is deployed in Kubernetes matches exactly what is defined in Git. Any drift is detected and corrected automatically.",
  },
  {
    icon: "📦",
    name: "GHCR",
    color: "#a78bfa",
    badge: "Image Registry",
    badgeClass: "badge-purple",
    desc: "GitHub Container Registry stores your Docker images alongside your source code. It integrates seamlessly with GitHub Actions and PAT-based authentication used by Jenkins.",
  },
  {
    icon: "🌿",
    name: "GitOps",
    color: "#10b981",
    badge: "Methodology",
    badgeClass: "badge-green",
    desc: "GitOps is a set of practices where Git is the single source of truth for infrastructure and application state. Every change goes through a pull request, giving you a full audit trail and easy rollbacks.",
  },
];

const PIPELINE_STEPS = [
  { label: "Code",       desc: "Developer pushes code to GitHub" },
  { label: "Webhook",    desc: "GitHub fires a webhook to Jenkins" },
  { label: "Build",      desc: "Jenkins compiles the JAR with Maven" },
  { label: "Image",      desc: "Docker image built & pushed to GHCR" },
  { label: "GitOps",     desc: "Jenkins updates deployment.yaml in infra repo" },
  { label: "Sync",       desc: "ArgoCD detects drift and syncs cluster" },
  { label: "Deploy",     desc: "Kubernetes performs a rolling update" },
  { label: "Live",       desc: "Application is running in production" },
];

const FAQ_ITEMS = [
  {
    q: "What is the difference between Continuous Integration (CI) and Continuous Delivery (CD)?",
    a: "CI is about automatically building and testing your code every time a change is pushed. CD is about automatically deploying that tested code to an environment. Together they form a pipeline: code → build → test → deploy.",
  },
  {
    q: "Why do we need a container registry like GHCR? Can't we just build the image on the server?",
    a: "Building on the server is fragile and slow. A registry acts as a versioned artifact store. Jenkins builds the image once, pushes it tagged with a build number, and Kubernetes pulls that exact image. Every deployment is reproducible and auditable.",
  },
  {
    q: "What makes GitOps different from a traditional deploy script?",
    a: "With a deploy script, the deployment state lives in whatever the script last did — you have no single place to check. With GitOps, the desired state is always in Git. ArgoCD continuously reconciles the cluster toward that state, meaning any manual change to the cluster is automatically reverted (drift detection).",
  },
];

export default function ToolsGlossary() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Session 02 · Tools Overview</span>
        <h1 className="slide-title">Meet Your <span className="glow-text">Toolbox</span></h1>
        <p className="slide-subtitle">
          Six tools, one cohesive pipeline. Here is what each one does and why it matters.
        </p>
      </div>

      <div className="card-grid" style={{ marginBottom: "2rem" }}>
        {TOOLS.map((t) => (
          <div className="card" key={t.name} style={{ borderColor: `${t.color}22` }}>
            <div className="card-title">
              <span style={{ fontSize: "22px" }}>{t.icon}</span>
              <span style={{ color: t.color }}>{t.name}</span>
              <span className={`badge ${t.badgeClass}`} style={{ marginLeft: "auto" }}>{t.badge}</span>
            </div>
            <div className="card-body">{t.desc}</div>
          </div>
        ))}
      </div>

      <hr className="section-divider" />

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "1rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          How they connect — the pipeline
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
          {PIPELINE_STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.4rem 0.9rem",
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)", fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>{s.desc}</div>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <span style={{ color: "var(--muted)", fontSize: "14px" }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
