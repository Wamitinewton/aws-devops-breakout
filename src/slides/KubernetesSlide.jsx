import QuestionBox from "../components/QuestionBox";
import CodeBlock from "../components/CodeBlock";

const K8sIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="#326CE5" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" fill="#326CE5"/>
    <path d="M12 2v7M12 15v7M2 7l8.5 5M13.5 10l8.5-3M2 17l8.5-5M13.5 12l8.5 5" stroke="#326CE5" strokeWidth="1" opacity="0.6"/>
  </svg>
);

const deploymentYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: production
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      serviceAccountName: spring-cloud-kubernetes
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: auth-service
          image: ghcr.io/ari-bizmwitu/auth-service:11
          ports:
            - containerPort: 8081
          env:
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: auth-service-secrets
                  key: JWT_SECRET
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8081
            initialDelaySeconds: 120
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8081
            initialDelaySeconds: 150
            periodSeconds: 15`;

export default function KubernetesSlide() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 04</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <K8sIcon />
          <h2 className="slide-title">Kubernetes & k3s</h2>
        </div>
        <p className="slide-subtitle">The container orchestration layer — schedules, runs, heals, and connects your services.</p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>Core Concepts</div>
          {[
            { term: "Pod", badge: "badge-blue", desc: "The smallest deployable unit. Usually 1 container. Has its own IP inside the cluster." },
            { term: "Deployment", badge: "badge-purple", desc: "Declares: 'I want 1 replica of this image running at all times.' Kubernetes ensures it — if a pod crashes, it restarts it." },
            { term: "Service", badge: "badge-green", desc: "A stable DNS name + IP that routes traffic to pods. Pods come and go, but the Service name never changes." },
            { term: "Namespace", badge: "badge-amber", desc: "A logical partition inside the cluster. Separates environments or teams — e.g. production and kafka." },
            { term: "Secret", badge: "badge-red", desc: "Kubernetes-native key-value store for sensitive data. Injected as environment variables into pods at startup." },
          ].map((c) => (
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
                ["RAM needed", "~4 GB", "~512 MB"],
                ["Binary size", "~1 GB", "~60 MB"],
                ["Same K8s API?", "Yes", "Yes"],
                ["Single binary?", "No", "Yes"],
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
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              k3s uses the same <code>kubectl</code> commands and YAML manifests as full Kubernetes. Everything you learn here transfers directly to EKS, GKE, or AKS.
            </div>
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>
        Deployment YAML
      </div>
      <CodeBlock code={deploymentYaml} lang="yaml" filename="apps/auth-service/deployment.yaml" />

      <div className="highlight-box success" style={{ marginTop: "1rem" }}>
        <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>
          <strong style={{ color: "var(--accent4)" }}>Self-healing:</strong> If the auth-service pod crashes at 3am, Kubernetes detects it failed the readiness probe and automatically restarts it — no manual intervention needed.
        </div>
      </div>

      <QuestionBox
        question="What is the difference between a Kubernetes Service of type ClusterIP vs NodePort, and which would you use for the API Gateway?"
        answer="ClusterIP (default) — gives a stable internal DNS name and IP, only reachable inside the cluster. Used for all internal services (auth, user, org, etc.). NodePort — exposes the service on a port directly on the node's external IP (e.g. :30000). Used for the API Gateway so external clients can reach it. ArgoCD UI and Kafka UI are also typically exposed via NodePort in a single-node setup."
      />
    </div>
  );
}