import { FiLayout, FiSettings, FiGrid, FiLock, FiRefreshCw, FiInfo } from "react-icons/fi";
import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

const DOCKER_COMPOSE_JENKINS = `# docker-compose.yml — Run Jenkins with Docker support
version: "3.9"
services:
  jenkins:
    image: jenkins/jenkins:lts-jdk21
    container_name: jenkins
    ports:
      - "8080:8080"    # Jenkins UI
      - "50000:50000"  # Agent connection port
    volumes:
      - jenkins_home:/var/jenkins_home
      # Give Jenkins access to the host Docker socket
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped

volumes:
  jenkins_home:`;

const FAQ_ITEMS = [
  {
    q: "What is the difference between Jenkins master and Jenkins agent?",
    a: (
      <>
        <p><strong>Jenkins Controller (master)</strong> is the central server. It stores job configurations, schedules builds, and shows the UI. It does NOT run builds directly (best practice).</p>
        <p><strong>Jenkins Agent</strong> is a machine or container that the controller delegates actual build work to. An agent can be on the same machine or a remote server. For our beginner setup, we use <code>agent any</code> which runs the build on the controller itself.</p>
      </>
    ),
  },
  {
    q: "Why do we mount /var/run/docker.sock into the Jenkins container?",
    a: "This gives Jenkins access to the host's Docker daemon. When a Jenkinsfile runs docker build or docker push, it talks to the same Docker engine that runs the Jenkins container itself. Without this mount, the Jenkins container would not have any Docker capability. This is called 'Docker-outside-of-Docker' (DooD).",
  },
  {
    q: "What is a Jenkins Credential and why is it safer than putting secrets in a Jenkinsfile?",
    a: "A Jenkins Credential is an encrypted secret stored in Jenkins' own credential store. You reference it by an ID (e.g. 'ghcr-token') and Jenkins injects it at build time — it never appears in logs or source code. Putting a token directly in a Jenkinsfile means it is committed to Git history, visible to anyone with repo access, and never rotatable without changing code.",
  },
  {
    q: "What is a Jenkins Webhook and how does GitHub trigger a build?",
    a: "A webhook is an HTTP POST request GitHub sends to Jenkins when code is pushed. In GitHub repository settings → Webhooks, you add your Jenkins URL + /github-webhook/. Jenkins' GitHub plugin receives the POST, identifies which job is configured for that repo, and immediately triggers a build. This replaces polling — no delay, no wasted resources.",
  },
];

const ARCHITECTURE_ITEMS = [
  ["Controller", "Central server. Stores job configs, shows UI at :8080, schedules builds. Does not run builds itself (best practice)."],
  ["Agent", "Machine that executes the actual build steps. Can be the controller itself (agent any) or a dedicated remote node."],
  ["Executor", "A thread on an agent that can run one build at a time. More executors = more parallel builds."],
  ["Plugin", "Jenkins is extended through plugins. ~1,800 plugins: Git, Docker, Maven, Kubernetes, GitHub, Slack, etc."],
];

const KEY_CONCEPTS = [
  ["Job / Pipeline", "A configured unit of work. Freestyle jobs use the UI; Pipeline jobs use a Jenkinsfile in your repo — always prefer Pipelines."],
  ["Jenkinsfile", "A text file (Groovy DSL) checked into your Git repository alongside source code. Defines all build stages."],
  ["Stage", "A logical group of steps within a pipeline: Checkout, Build, Test, Docker Build, Deploy."],
  ["Credential", "Encrypted secrets (tokens, passwords) stored in Jenkins. Referenced by ID in Jenkinsfile — never hardcoded."],
  ["Webhook", "GitHub fires an HTTP POST to Jenkins when code is pushed, triggering a build instantly."],
];

const PLUGINS = [
  { name: "Git",              badge: "badge-blue",   desc: "Clone and pull from GitHub repositories" },
  { name: "GitHub",           badge: "badge-blue",   desc: "Receive webhooks and set commit status" },
  { name: "Pipeline",         badge: "badge-green",  desc: "Enable Jenkinsfile-based pipelines" },
  { name: "Docker Pipeline",  badge: "badge-blue",   desc: "Use Docker inside pipeline steps" },
  { name: "Maven Integration",badge: "badge-amber",  desc: "Auto-detect Maven and manage JDK" },
  { name: "Credentials",      badge: "badge-purple", desc: "Store and inject secrets securely" },
  { name: "Workspace Cleanup",badge: "badge-red",    desc: "Clean workspace before/after builds" },
  { name: "Blue Ocean",       badge: "badge-blue",   desc: "Modern pipeline visualisation UI" },
];

const CREDENTIALS_STEPS = [
  ["Manage Jenkins → Credentials", "Go to Dashboard → Manage Jenkins → Credentials → System → Global credentials"],
  ["Add GHCR Token", "Kind: Secret text. ID: ghcr-token. Value: your GitHub Personal Access Token (PAT) with write:packages scope"],
  ["Add GitHub Token", "Kind: Secret text. ID: github-token. Value: a PAT with repo scope (to push to the infra repo)"],
  ["Reference in Jenkinsfile", "Use withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) { ... }"],
];

export default function Jenkins1() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Jenkins · Page 1 of 2</span>
        <h1 className="slide-title">
          <span style={{ color: "#d33833" }}>Jenkins</span> — CI Automation
        </h1>
        <p className="slide-subtitle">
          Jenkins watches your repository and automatically builds, tests, and packages
          your application every time code is pushed. This is Continuous Integration (CI).
        </p>
      </div>

      <div className="highlight-box info" style={{ marginBottom: "1.5rem" }}>
        <span className="icon"><FiRefreshCw size={17} /></span>
        <div>
          <strong>What is CI?</strong> Continuous Integration means automatically running the
          build and test process every time a developer pushes code. The goal: catch broken
          builds immediately, not days later during a manual release.
        </div>
      </div>

      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-title"><FiLayout size={17} /> Jenkins Architecture</div>
          <div className="card-body">
            <div className="step-list">
              {ARCHITECTURE_ITEMS.map(([name, desc]) => (
                <div className="step-item" key={name}>
                  <div className="step-content">
                    <div className="step-title">{name}</div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><FiSettings size={17} /> Key Concepts</div>
          <div className="card-body">
            <div className="step-list">
              {KEY_CONCEPTS.map(([name, desc]) => (
                <div className="step-item" key={name}>
                  <div className="step-content">
                    <div className="step-title">{name}</div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title"><FiGrid size={17} /> Essential Plugins to Install</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginTop: "0.5rem" }}>
          {PLUGINS.map(({ name, badge, desc }) => (
            <div key={name} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <span className={`badge ${badge}`}>{name}</span>
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          Running Jenkins with Docker Compose
        </div>
        <CodeBlock lang="yaml" filename="docker-compose.yml" code={DOCKER_COMPOSE_JENKINS} />
        <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
          <span className="icon"><FiInfo size={17} /></span>
          <div style={{ fontSize: "12px" }}>
            <strong>After starting Jenkins:</strong> Visit <code>http://localhost:8080</code>, unlock
            with the initial admin password (<code>docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword</code>),
            install suggested plugins, and create your admin user.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><FiLock size={17} /> Setting Up Credentials</div>
        <div className="card-body">
          <div className="step-list">
            {CREDENTIALS_STEPS.map(([title, desc], i) => (
              <div className="step-item" key={i}>
                <div className="step-num">{i + 1}</div>
                <div className="step-content">
                  <div className="step-title">{title}</div>
                  <div className="step-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
