import QuestionBox from "../components/QuestionBox";

const tools = [
  {
    icon: "🐳",
    name: "Docker",
    badge: "badge-blue",
    badgeText: "CONTAINERIZATION",
    definition: "A platform that packages your application and all its dependencies into a lightweight, portable container. Think of it as a shipping container — the app runs identically everywhere, whether on your laptop, a CI server, or production.",
    analogy: "Your Spring Boot service + JDK + all config, sealed into a single runnable image.",
  },
  {
    icon: "🔧",
    name: "Jenkins",
    badge: "badge-amber",
    badgeText: "CI SERVER",
    definition: "An open-source automation server that listens for code pushes, then runs a pipeline: compile, test, build Docker image, push to registry, update deployment config. It's the engine that turns a git push into a deployable artifact.",
    analogy: "The factory worker — takes raw code, builds the product, stamps a version on it, and puts it on the shelf.",
  },
  {
    icon: "📦",
    name: "GitHub Container Registry (GHCR)",
    badge: "badge-purple",
    badgeText: "IMAGE REGISTRY",
    definition: "GitHub's built-in Docker image registry. After Jenkins builds a Docker image, it pushes it to GHCR with a version tag (e.g. :14). ArgoCD then pulls it from here when deploying to Kubernetes.",
    analogy: "DockerHub, but living right next to your source code on GitHub.",
  },
  {
    icon: "⚙️",
    name: "Kubernetes / k3s",
    badge: "badge-green",
    badgeText: "ORCHESTRATION",
    definition: "Kubernetes is the industry standard for running containers at scale — it handles scheduling, scaling, self-healing, and networking. k3s is a lightweight Kubernetes distribution (by Rancher) that runs the full K8s API on a single VPS with minimal RAM.",
    analogy: "The operations manager for your containers. If a container crashes, k3s restarts it. You declare what you want, it makes it happen.",
  },
  {
    icon: "🔄",
    name: "ArgoCD",
    badge: "badge-purple",
    badgeText: "GITOPS CONTROLLER",
    definition: "A Kubernetes-native continuous delivery tool that watches a Git repository (your infra repo). Whenever something changes in the repo, ArgoCD detects the drift and syncs the cluster to match the desired state. Git becomes the single source of truth.",
    analogy: "A robot that constantly compares your Git repo to what's running, and automatically fixes any difference.",
  },
  {
    icon: "🗃️",
    name: "GitOps",
    badge: "badge-blue",
    badgeText: "METHODOLOGY",
    definition: "A deployment methodology where the entire desired system state is stored in Git. Deployments happen by making a pull request, not by running kubectl commands. The cluster watches the repo and self-heals to match it.",
    analogy: "Instead of 'I ran kubectl apply on the server,' you say 'I merged a PR and the cluster updated itself.'",
  },
];

export default function ToolsGlossary() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 01</span>
        <h2 className="slide-title">The Toolbox</h2>
        <p className="slide-subtitle">Every tool in our stack — defined plainly, so there's no guessing what anything does.</p>
      </div>

      <div className="card-grid">
        {tools.map((t) => (
          <div key={t.name} className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "22px" }}>{t.icon}</span>
              <div>
                <div className="card-title" style={{ marginBottom: "3px" }}>{t.name}</div>
                <span className={`badge ${t.badge}`}>{t.badgeText}</span>
              </div>
            </div>
            <div className="card-body" style={{ marginBottom: "0.75rem" }}>{t.definition}</div>
            <div style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "6px",
              padding: "8px 10px",
              fontSize: "11.5px",
              color: "var(--accent3)",
              borderLeft: "3px solid var(--accent3)",
            }}>
              💡 {t.analogy}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1.5rem" }} className="highlight-box info">
        <span className="icon">💡</span>
        <div>
          <strong style={{ color: "var(--accent)" }}>The Big Picture:</strong>
          <span style={{ color: "var(--muted)", fontSize: "12.5px" }}> Jenkins builds &amp; pushes images → updates the GitOps repo → ArgoCD detects the change → Kubernetes applies it. Zero manual kubectl commands needed after initial setup.</span>
        </div>
      </div>

      <QuestionBox
        question="What is the fundamental difference between Jenkins and ArgoCD in our pipeline?"
        answer="Jenkins is the CI part (Continuous Integration) — it builds, tests, and packages your code into a Docker image. ArgoCD is the CD part (Continuous Delivery) — it watches your Git repo and deploys the image to Kubernetes. Jenkins runs outside k3s (needs Docker socket access). ArgoCD runs inside k3s (needs cluster access to deploy)."
      />
    </div>
  );
}