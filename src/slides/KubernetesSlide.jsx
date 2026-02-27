import QuestionBox from "../components/QuestionBox";

export default function KubernetesSlide() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 04</span>
        <h2 className="slide-title">⚙️ Kubernetes & k3s</h2>
        <p className="slide-subtitle">The container orchestration layer — schedules, runs, heals, and connects your services.</p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>Core Concepts</div>
          {[
            { term: "Pod", badge: "badge-blue", desc: "The smallest deployable unit. Usually 1 container. Has its own IP inside the cluster." },
            { term: "Deployment", badge: "badge-purple", desc: "Declares: 'I want 1 replica of this image running at all times.' Kubernetes ensures it — if a pod crashes, it restarts it." },
            { term: "Service", badge: "badge-green", desc: "A stable DNS name + IP that routes traffic to pods. Pods come and go, but the Service name never changes." },
            { term: "Namespace", badge: "badge-amber", desc: "A logical partition inside the cluster. We use production (services) and kafka (message bus)." },
            { term: "Secret", badge: "badge-red", desc: "Kubernetes-native key-value store for sensitive data. Injected as environment variables into pods." },
          ].map(c => (
            <div key={c.term} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "flex-start" }}>
              <span className={`badge ${c.badge}`} style={{ marginTop: "3px", minWidth: "90px", textAlign: "center" }}>{c.term}</span>
              <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{c.desc}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>k3s vs Full Kubernetes</div>
          <table className="port-table" style={{ marginBottom: "1rem" }}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>K8s</th>
                <th>k3s</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["RAM needed", "~4GB", "~512MB"],
                ["Binary size", "~1GB", "~60MB"],
                ["Same K8s API?", "✓", "✓"],
                ["Single binary?", "✗", "✓"],
                ["Best for", "Cloud clusters", "Single VPS"],
              ].map(([f, k, k3]) => (
                <tr key={f}>
                  <td style={{ color: "#94a3b8" }}>{f}</td>
                  <td style={{ color: "#64748b" }}>{k}</td>
                  <td style={{ color: "var(--accent4)" }}>{k3}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="highlight-box info">
            <span className="icon">💡</span>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              k3s uses the same <code>kubectl</code> commands and YAML manifests as full Kubernetes. Everything you learn here transfers directly to EKS, GKE, or AKS.
            </div>
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>
        Our Deployment YAML (what ArgoCD applies)
      </div>
      <div className="code-block">
        <span className="key">apiVersion</span>: apps/v1{"\n"}
        <span className="key">kind</span>: Deployment{"\n"}
        <span className="key">metadata</span>:{"\n"}
        {"  "}<span className="key">name</span>: <span className="value">auth-service</span>{"\n"}
        {"  "}<span className="key">namespace</span>: <span className="value">production</span>{"\n"}
        <span className="key">spec</span>:{"\n"}
        {"  "}<span className="key">replicas</span>: <span className="string">1</span>{"\n"}
        {"  "}<span className="key">template</span>:{"\n"}
        {"    "}<span className="key">spec</span>:{"\n"}
        {"      "}<span className="key">containers</span>:{"\n"}
        {"        "}- <span className="key">name</span>: <span className="value">auth-service</span>{"\n"}
        {"          "}<span className="key">image</span>: <span className="string">ghcr.io/ari-bizmwitu/auth-service:11</span>  <span className="comment"># ← Jenkins updates this</span>{"\n"}
        {"          "}<span className="key">env</span>:{"\n"}
        {"            "}- <span className="key">name</span>: JWT_SECRET{"\n"}
        {"              "}<span className="key">valueFrom</span>: {"{ secretKeyRef: { name: auth-service-secrets, key: JWT_SECRET } }"}{"\n"}
        {"          "}<span className="key">readinessProbe</span>:{"\n"}
        {"            "}<span className="key">httpGet</span>: {"{ path: /actuator/health/readiness, port: 8081 }"}{"\n"}
        {"            "}<span className="key">initialDelaySeconds</span>: <span className="string">120</span>
      </div>

      <div className="highlight-box success" style={{ marginTop: "1rem" }}>
        <span className="icon">✅</span>
        <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>
          <strong style={{ color: "var(--accent4)" }}>Self-healing:</strong> If the auth-service pod crashes at 3am, Kubernetes detects it failed the readiness probe and automatically restarts it — no manual intervention needed.
        </div>
      </div>

      <QuestionBox
        question="What is the difference between a Kubernetes Service of type ClusterIP vs NodePort, and which do we use for the API Gateway?"
        answer="ClusterIP (default) — gives a stable internal DNS name and IP, only reachable inside the cluster. Used for all internal services (auth, user, org, etc.). NodePort — exposes the service on a port directly on the VPS's external IP (e.g. :30000). Used for the API Gateway so external clients (mobile apps, web) can reach it. ArgoCD UI uses NodePort :30443. Kafka UI uses NodePort :30100."
      />
    </div>
  );
}