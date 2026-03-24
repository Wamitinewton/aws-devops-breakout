import { FiFolder, FiInfo, FiCheckCircle, FiCheckSquare } from "react-icons/fi";
import CodeBlock from "../components/CodeBlock";

const DOCKERFILE = `# ── Stage 1: Build ─────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Cache dependencies separately from source
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -S devops && adduser -S devops -G devops

# Copy only the compiled JAR from the build stage
COPY --from=builder /app/target/hello-devops-*.jar app.jar

USER devops

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]`;

const DEPLOYMENT_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-devops
  namespace: production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello-devops
  template:
    metadata:
      labels:
        app: hello-devops
    spec:
      imagePullSecrets:
        - name: ghcr-credentials    # Created separately (kubectl)
      containers:
        - name: hello-devops
          image: ghcr.io/your-org/hello-devops:latest   # Jenkins updates this
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 20
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 40
            periodSeconds: 20`;

const SERVICE_YAML = `apiVersion: v1
kind: Service
metadata:
  name: hello-devops
  namespace: production
spec:
  type: NodePort
  selector:
    app: hello-devops
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080`;

const ARGOCD_APP = `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hello-devops
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/hello-devops-infra
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true`;

const DEPLOY_COMMANDS = `# ── 1. Create the production namespace
kubectl create namespace production

# ── 2. Create the GHCR imagePullSecret
kubectl create secret docker-registry ghcr-credentials \\
  --namespace production \\
  --docker-server=ghcr.io \\
  --docker-username=your-username \\
  --docker-password=YOUR_PAT_TOKEN

# ── 3. Apply the ArgoCD Application manifest
kubectl apply -f argocd/application.yaml

# ── 4. Verify ArgoCD created the deployment
kubectl get pods -n production -w

# ── 5. Check the application is reachable
curl http://YOUR-SERVER-IP:30080/hello
# Expected: {"message":"Hello, DevOps World!","status":"running"}

curl http://YOUR-SERVER-IP:30080/actuator/health
# Expected: {"status":"UP"}`;

const CHECKLIST = [
  ["Jenkins running on :8080",               "docker-compose up -d jenkins"],
  ["GHCR token stored in Jenkins",           "Manage Jenkins → Credentials → ghcr-token"],
  ["GitHub token stored in Jenkins",         "For pushing to infra repo: github-token"],
  ["GitHub webhook configured",              "Settings → Webhooks → http://SERVER:8080/github-webhook/"],
  ["k3s / Kubernetes running",               "sudo k3s kubectl get nodes"],
  ["ArgoCD installed and UI accessible",     "kubectl get pods -n argocd"],
  ["ArgoCD Application applied",             "kubectl apply -f argocd/application.yaml"],
  ["imagePullSecret created",                "kubectl create secret docker-registry ghcr-credentials..."],
  ["Push a commit and watch the pipeline",   "git push → Jenkins → GHCR → ArgoCD → Kubernetes"],
  ["Verify app responds",                    "curl http://SERVER:30080/hello"],
];

export default function LiveDemo2() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Live Demo · Page 2 of 2</span>
        <h1 className="slide-title">
          Deploy <span className="glow-amber">Hello DevOps</span> — Full Pipeline
        </h1>
        <p className="slide-subtitle">
          The Dockerfile, Kubernetes manifests, ArgoCD Application, and step-by-step deployment
          commands to run the complete CI/CD pipeline from scratch.
        </p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            Multi-Stage Dockerfile
          </div>
          <CodeBlock lang="dockerfile" filename="Dockerfile" code={DOCKERFILE} />
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            ArgoCD Application
          </div>
          <CodeBlock lang="yaml" filename="argocd/application.yaml" code={ARGOCD_APP} />
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            k8s/deployment.yaml
          </div>
          <CodeBlock lang="yaml" filename="k8s/deployment.yaml" code={DEPLOYMENT_YAML} />
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            k8s/service.yaml
          </div>
          <CodeBlock lang="yaml" filename="k8s/service.yaml" code={SERVICE_YAML} />
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          First-Time Deployment Commands
        </div>
        <CodeBlock lang="bash" filename="terminal" code={DEPLOY_COMMANDS} />
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-title"><FiFolder size={17} /> Infra Repository Structure</div>
          <div className="arch-box">{`hello-devops-infra/
├── k8s/
│   ├── namespace.yaml        # namespace: production
│   ├── deployment.yaml       # ← Jenkins updates image tag
│   └── service.yaml          # NodePort :30080
├── argocd/
│   └── application.yaml      # ArgoCD Application manifest
└── README.md`}</div>
          <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
            <span className="icon"><FiInfo size={17} /></span>
            <div style={{ fontSize: "12px" }}>
              Two GitHub repositories: <strong>hello-devops</strong> (source code + Dockerfile + Jenkinsfile)
              and <strong>hello-devops-infra</strong> (Kubernetes manifests). Keep them separate.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><FiCheckSquare size={17} /> Deployment Checklist</div>
          <div className="card-body">
            <div className="step-list">
              {CHECKLIST.map(([title, desc], i) => (
                <div className="step-item" key={i}>
                  <div style={{
                    width: 18,
                    height: 18,
                    border: "2px solid var(--accent4)",
                    borderRadius: "4px",
                    flexShrink: 0,
                    marginTop: 2,
                  }} />
                  <div className="step-content">
                    <div className="step-title" style={{ fontSize: "12px" }}>{title}</div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="highlight-box success">
        <span className="icon"><FiCheckCircle size={17} /></span>
        <div>
          <strong>Pipeline complete.</strong> You now have a full GitOps CI/CD pipeline:
          code pushed to GitHub → Jenkins builds and pushes to GHCR → ArgoCD detects the Git change
          → Kubernetes deploys with zero downtime. This is the foundation of modern DevOps.
        </div>
      </div>
    </div>
  );
}
