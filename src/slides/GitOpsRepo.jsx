import QuestionBox from "../components/QuestionBox";

export default function GitOpsRepo() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 08</span>
        <h2 className="slide-title">The GitOps Repository</h2>
        <p className="slide-subtitle"><code>bizmwitu-infra</code> — the single source of truth for every deployment in the cluster.</p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>Repository Structure</div>
          <div className="code-block" style={{ fontSize: "11px", lineHeight: "1.9" }}>
            <span className="keyword">bizmwitu-infra/</span>{"\n"}
            ├── <span className="value">namespaces.yaml</span>          <span className="comment"># production + kafka</span>{"\n"}
            ├── <span className="value">platform/</span>{"\n"}
            │   └── <span className="value">kafka/</span>               <span className="comment"># Kafka KRaft + UI</span>{"\n"}
            ├── <span className="value">apps/</span>                     <span className="comment"># one folder per service</span>{"\n"}
            │   ├── <span className="value">api-gateway/</span>{"\n"}
            │   │   ├── <span className="string">deployment.yaml</span>  <span className="comment"># ← Jenkins updates image tag</span>{"\n"}
            │   │   └── <span className="string">service.yaml</span>{"\n"}
            │   ├── <span className="value">auth-service/</span>{"\n"}
            │   ├── <span className="value">user-service/</span>{"\n"}
            │   ├── <span className="value">organization-service/</span>{"\n"}
            │   ├── <span className="value">billing-service/</span>{"\n"}
            │   ├── <span className="value">storage-service/</span>{"\n"}
            │   ├── <span className="value">notification-service/</span>{"\n"}
            │   └── <span className="value">migrations-runner/</span>{"\n"}
            ├── <span className="value">argocd/</span>{"\n"}
            │   ├── <span className="string">project.yaml</span>         <span className="comment"># ArgoCD project config</span>{"\n"}
            │   └── <span className="value">applications/</span>         <span className="comment"># one Application per service</span>{"\n"}
            │       ├── <span className="string">app-api-gateway.yaml</span>{"\n"}
            │       ├── <span className="string">app-auth-service.yaml</span>{"\n"}
            │       └── <span className="string">... (one per service)</span>{"\n"}
            └── <span className="value">scripts/</span>{"\n"}
                └── <span className="string">create-secrets.sh</span>    <span className="comment"># run once on VPS</span>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>What's In Git vs What's Not</div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--accent4)", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700 }}>✓ IN GIT</span>
            </div>
            {[
              "deployment.yaml — image name + tag, resource limits, env var names, probes",
              "service.yaml — port mappings, service type (ClusterIP / NodePort)",
              "ArgoCD Application manifests",
              "Platform configs (Kafka, namespaces)",
            ].map(i => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
                <span style={{ color: "var(--accent4)", flexShrink: 0 }}>→</span>{i}
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--danger)", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700 }}>✗ NOT IN GIT</span>
            </div>
            {[
              "Database passwords, JWT secrets, API keys",
              "Redis credentials",
              "GitHub tokens, GHCR credentials",
              "create-secrets.sh values (run manually on VPS)",
            ].map(i => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
                <span style={{ color: "var(--danger)", flexShrink: 0 }}>✗</span>{i}
              </div>
            ))}
          </div>

          <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
            <span className="icon">🔒</span>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              Secrets live only in Kubernetes Secrets on the cluster. They're created once via <code>create-secrets.sh</code> and injected as env variables at pod startup via <code>secretKeyRef</code>.
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>
        How Secrets Flow Into a Service
      </div>
      <div className="code-block" style={{ fontSize: "11px" }}>
        <span className="comment"># 1. application-prod.yml (in Config Server repo, in Git)</span>{"\n"}
        spring.datasource.password: {"${AUTH_DATABASE_PASSWORD}"}{"\n\n"}
        <span className="comment"># 2. deployment.yaml (in GitOps repo, in Git) — references secret by KEY NAME only</span>{"\n"}
        env:{"\n"}
        {"  "}- name: SPRING_DATASOURCE_PASSWORD{"\n"}
        {"    "}valueFrom:{"\n"}
        {"      "}secretKeyRef:{"\n"}
        {"        "}name: auth-service-secrets{"\n"}
        {"        "}key: AUTH_DATABASE_PASSWORD{"\n\n"}
        <span className="comment"># 3. create-secrets.sh (run manually on VPS, never pushed to Git)</span>{"\n"}
        kubectl create secret generic auth-service-secrets \{"\n"}
        {"  "}--from-literal=AUTH_DATABASE_PASSWORD="npg_mHs4trG7Nblk"
      </div>

      <QuestionBox
        question="Adding a new microservice to Bizmwitu requires changes in how many places? Name them."
        answer="Four places: (1) The service's own GitHub repo — add Dockerfile, Jenkinsfile, .dockerignore. (2) The GitOps repo (bizmwitu-infra) — add apps/new-service/deployment.yaml and service.yaml. (3) The GitOps repo again — add argocd/applications/app-new-service.yaml. (4) The VPS — run kubectl create secret for the new service's secrets. Then trigger the first Jenkins build and apply the ArgoCD application."
      />
    </div>
  );
}