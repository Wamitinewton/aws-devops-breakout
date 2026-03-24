import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

const DEPLOYMENT_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-devops
  namespace: production
  labels:
    app: hello-devops
spec:
  replicas: 2               # Run 2 identical pods
  selector:
    matchLabels:
      app: hello-devops
  template:
    metadata:
      labels:
        app: hello-devops
    spec:
      containers:
        - name: hello-devops
          image: ghcr.io/your-org/hello-devops:42
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "prod"
          resources:
            requests:          # Minimum resources guaranteed
              cpu: "100m"      # 100 millicores = 0.1 CPU core
              memory: "256Mi"
            limits:            # Maximum resources allowed
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 20`;

const SERVICE_YAML = `apiVersion: v1
kind: Service
metadata:
  name: hello-devops
  namespace: production
spec:
  type: NodePort        # Accessible from outside the cluster
  selector:
    app: hello-devops   # Routes traffic to pods with this label
  ports:
    - name: http
      protocol: TCP
      port: 80          # Port on the Service
      targetPort: 8080  # Port on the Pod (container)
      nodePort: 30080   # Port accessible on every node's IP`;

const CONFIGMAP_SECRET_YAML = `# ConfigMap — non-sensitive configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: hello-devops-config
  namespace: production
data:
  spring.profiles.active: "prod"
  server.port: "8080"

---
# Secret — sensitive data (base64 encoded)
apiVersion: v1
kind: Secret
metadata:
  name: hello-devops-secrets
  namespace: production
type: Opaque
data:
  # echo -n 'mysecretpassword' | base64
  db-password: bXlzZWNyZXRwYXNzd29yZA==`;

const FAQ_ITEMS = [
  {
    q: "What is the difference between a Deployment and a Pod?",
    a: "A Pod is a single running instance of your application. A Deployment is a controller that manages a set of identical Pods. You almost never create Pods directly — you create a Deployment and tell it how many replicas to maintain. The Deployment ensures the right number of healthy Pods are always running.",
  },
  {
    q: "What is the difference between a ClusterIP, NodePort, and LoadBalancer service?",
    a: (
      <>
        <ul>
          <li><strong>ClusterIP</strong> (default) — internal only. Only accessible inside the cluster. Other pods in the cluster can reach it by name.</li>
          <li><strong>NodePort</strong> — opens a port (30000-32767) on every node's IP. Accessible from outside the cluster at NODE_IP:NodePort. Simple but not production-grade for internet traffic.</li>
          <li><strong>LoadBalancer</strong> — provisions a cloud load balancer (AWS ELB, GCP, etc.) and gives the service a public IP. Best for production on cloud platforms.</li>
        </ul>
      </>
    ),
  },
  {
    q: "What is the difference between resource requests and resource limits?",
    a: "Requests are the minimum amount of CPU/memory Kubernetes guarantees for your pod. The scheduler uses requests to find a node with enough free capacity. Limits are the maximum — if your pod tries to use more CPU than its limit, it gets throttled. If it exceeds its memory limit, the pod is killed (OOMKilled). Always set both: requests for scheduling, limits for safety.",
  },
  {
    q: "Why is base64 not encryption? How should we really protect secrets?",
    a: "Kubernetes Secrets store values as base64-encoded strings — this is encoding, not encryption. Anyone with cluster access can read them. For production, use external secret managers: AWS Secrets Manager, HashiCorp Vault, or Kubernetes External Secrets Operator. At minimum, enable Kubernetes encryption-at-rest for etcd. Never commit base64-encoded secrets to Git.",
  },
];

export default function Kubernetes2() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Kubernetes · Page 2 of 3</span>
        <h1 className="slide-title">
          Core <span style={{ color: "#326ce5" }}>Resources</span> & Manifests
        </h1>
        <p className="slide-subtitle">
          Everything in Kubernetes is declared as a YAML manifest — a description of the desired
          state. Learn the four resources you will use in every deployment.
        </p>
      </div>

      {/* Resource overview */}
      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        {[
          { icon: "🔄", name: "Deployment",  badge: "badge-blue",   desc: "Declares how many identical Pod replicas to run, which container image to use, and how to roll out updates." },
          { icon: "🌐", name: "Service",     badge: "badge-green",  desc: "A stable network endpoint for a set of Pods. Pods come and go; the Service IP/DNS name stays constant." },
          { icon: "📋", name: "ConfigMap",   badge: "badge-amber",  desc: "Stores non-sensitive configuration as key-value pairs. Inject into pods as environment variables or files." },
          { icon: "🔐", name: "Secret",      badge: "badge-purple", desc: "Stores sensitive data (passwords, tokens) as base64-encoded values. Treated with extra care by Kubernetes." },
          { icon: "🏷️", name: "Namespace",  badge: "badge-blue",   desc: "Virtual cluster. Groups related resources and provides isolation. Recommended: production, staging, argocd." },
          { icon: "📊", name: "Pod",         badge: "badge-red",    desc: "The smallest deployable unit — wraps one or more containers sharing a network and storage. Usually managed by a Deployment." },
        ].map(({ icon, name, badge, desc }) => (
          <div className="card" key={name}>
            <div className="card-title">
              <span style={{ fontSize: "18px" }}>{icon}</span>
              {name}
              <span className={`badge ${badge}`} style={{ marginLeft: "auto" }}>{name}</span>
            </div>
            <div className="card-body">{desc}</div>
          </div>
        ))}
      </div>

      {/* Deployment YAML */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          Deployment Manifest
        </div>
        <CodeBlock lang="yaml" filename="k8s/deployment.yaml" code={DEPLOYMENT_YAML} />
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            Service Manifest
          </div>
          <CodeBlock lang="yaml" filename="k8s/service.yaml" code={SERVICE_YAML} />
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            ConfigMap & Secret
          </div>
          <CodeBlock lang="yaml" filename="k8s/config.yaml" code={CONFIGMAP_SECRET_YAML} />
        </div>
      </div>

      {/* Probes explanation */}
      <div className="card">
        <div className="card-title"><span style={{ fontSize: "20px" }}>❤️</span> Health Probes — Why They Matter</div>
        <div className="two-col">
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "13px", color: "var(--accent4)", marginBottom: "0.5rem" }}>readinessProbe</div>
            <div className="card-body">
              Kubernetes only routes traffic to a pod when the readiness probe returns HTTP 200.
              During startup, while Spring Boot is initialising, the pod is <em>not</em> ready —
              so no traffic reaches it. Essential for zero-downtime rolling updates.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "13px", color: "var(--accent3)", marginBottom: "0.5rem" }}>livenessProbe</div>
            <div className="card-body">
              Kubernetes periodically checks if the pod is still healthy. If the liveness probe
              fails repeatedly (e.g., app is deadlocked), Kubernetes automatically restarts the
              container — the self-healing mechanism in action.
            </div>
          </div>
        </div>
        <div className="highlight-box info" style={{ marginTop: "1rem" }}>
          <span className="icon">💡</span>
          <div style={{ fontSize: "12px" }}>
            Spring Boot Actuator provides the <code>/actuator/health</code> endpoint automatically.
            Add <code>spring-boot-starter-actuator</code> to your <code>pom.xml</code> dependencies.
          </div>
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
