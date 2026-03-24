export default function Intro() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Session 01 · Welcome</span>
        <h1 className="slide-title">
          The <span className="glow-text">GitOps</span> Bridge
        </h1>
        <p className="slide-subtitle">
          A beginner-friendly, hands-on journey through Docker, Jenkins, Kubernetes, ArgoCD,
          and GitHub Container Registry — everything you need to build a real CI/CD pipeline.
        </p>
      </div>

      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-title">
            <span style={{ fontSize: "22px" }}>📦</span> What We Cover
          </div>
          <div className="card-body">
            <div className="step-list">
              {[
                ["Docker",      "Containerise your application reliably"],
                ["Jenkins",     "Automate your build and release pipeline"],
                ["Kubernetes",  "Orchestrate containers at scale"],
                ["ArgoCD",      "Deploy with GitOps — Git is the source of truth"],
                ["GHCR",        "Store and distribute your Docker images"],
              ].map(([tool, desc]) => (
                <div className="step-item" key={tool}>
                  <div className="step-content">
                    <div className="step-title">{tool}</div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <span style={{ fontSize: "22px" }}>🎯</span> Learning Goals
          </div>
          <div className="card-body">
            <div className="step-list">
              {[
                "Understand why each tool exists and what problem it solves",
                "Write Dockerfiles — single-stage and multi-stage",
                "Build a Jenkins pipeline (Jenkinsfile) from scratch",
                "Deploy to Kubernetes using YAML manifests",
                "Automate deployments with ArgoCD and GitOps",
                "Push and pull images from GitHub Container Registry",
                "Deploy a real Spring Boot app end-to-end",
              ].map((g, i) => (
                <div className="step-item" key={i}>
                  <div className="step-num">{i + 1}</div>
                  <div className="step-content">
                    <div className="step-desc">{g}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="highlight-box info">
        <span className="icon">💡</span>
        <div>
          <strong>Beginner-friendly.</strong> No microservices, no distributed systems — just one
          clean Spring Boot application deployed the professional way. By the end you will have a
          working CI/CD pipeline you can reuse for any project.
        </div>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          The full pipeline at a glance
        </div>
        <div className="arch-box">{`  Developer
      │
      │  git push
      ▼
  GitHub ──── Webhook ────► Jenkins
                                │
                      ┌─────────┴──────────┐
                      │                    │
                 mvn package           docker build
                      │                    │
                      └─────────┬──────────┘
                                │
                          docker push ──► GHCR
                                │
                     update deployment.yaml in
                         GitOps Infra Repo
                                │
                                ▼
                       ArgoCD detects drift
                                │
                                ▼
                      Kubernetes rolling update
                                │
                                ▼
                         ✅  App is live!`}</div>
      </div>

      <div className="highlight-box success" style={{ marginTop: "1.5rem" }}>
        <span className="icon">⌨️</span>
        <div>
          Use <strong>← →</strong> arrow keys or the <strong>Prev / Next</strong> buttons to
          navigate. Each tool section has multiple pages. Look for{" "}
          <strong>Frequently Asked Questions</strong> with reveal buttons at the bottom of every page.
        </div>
      </div>
    </div>
  );
}
