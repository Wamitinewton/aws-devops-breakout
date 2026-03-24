import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

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

const FAQ_ITEMS = [
  {
    q: "How do we verify the full pipeline worked end-to-end?",
    a: (
      <>
        <p>After a git push, check each step in order:</p>
        <ul>
          <li>Jenkins: Build shows green in Jenkins UI → all stages passed</li>
          <li>GHCR: New image tag appears in GitHub → Packages</li>
          <li>Infra repo: New commit with updated image tag in deployment.yaml</li>
          <li>ArgoCD: App status shows 'Synced + Healthy'</li>
          <li>Kubernetes: <code>kubectl get pods -n production</code> — pods show Running</li>
          <li>App: <code>curl http://SERVER:30080/hello</code> returns JSON response</li>
        </ul>
      </>
    ),
  },
  {
    q: "What does 'imagePullBackOff' mean and how do I fix it?",
    a: "ImagePullBackOff means Kubernetes cannot pull the Docker image. Common causes: (1) wrong image name or tag in deployment.yaml, (2) the ghcr-credentials secret is missing or has a wrong token, (3) the image doesn't exist in GHCR yet (build failed before push). Run kubectl describe pod <pod-name> -n production and look at the Events section for the exact error message.",
  },
  {
    q: "How do we roll back to a previous version?",
    a: (
      <>
        <p>Two options:</p>
        <ul>
          <li><strong>Git revert:</strong> <code>git revert HEAD</code> in the infra repo. This creates a new commit that reverts the image tag to the previous build number. ArgoCD detects it and rolls the cluster back. Full audit trail preserved.</li>
          <li><strong>kubectl rollout:</strong> <code>kubectl rollout undo deployment/hello-devops -n production</code>. This directly reverts the Deployment to the previous version but does NOT update Git — so ArgoCD will re-sync to the bad version. Always prefer the Git revert approach.</li>
        </ul>
      </>
    ),
  },
  {
    q: "How do we add the second application later? Do we need a new Jenkins job?",
    a: "Yes — create a new Jenkins pipeline job pointing to the new application's repository. The new app gets its own Jenkinsfile, its own infra directory (or repo), and its own ArgoCD Application manifest. Each app is independent. This is the scalable pattern: one Jenkinsfile per app, one ArgoCD Application per app. ArgoCD manages all of them in a single dashboard.",
  },
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

      {/* Two-column: Dockerfile + K8s manifests */}
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

      {/* K8s manifests */}
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

      {/* Deployment commands */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          First-Time Deployment Commands
        </div>
        <CodeBlock lang="bash" filename="terminal" code={DEPLOY_COMMANDS} />
      </div>

      {/* Complete infra repo structure */}
      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-title"><span style={{ fontSize: "20px" }}>📁</span> Infra Repository Structure</div>
          <div className="arch-box">{`hello-devops-infra/
├── k8s/
│   ├── namespace.yaml        # namespace: production
│   ├── deployment.yaml       # ← Jenkins updates image tag
│   └── service.yaml          # NodePort :30080
├── argocd/
│   └── application.yaml      # ArgoCD Application manifest
└── README.md`}</div>
          <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
            <span className="icon">💡</span>
            <div style={{ fontSize: "12px" }}>
              Two GitHub repositories: <strong>hello-devops</strong> (source code + Dockerfile + Jenkinsfile)
              and <strong>hello-devops-infra</strong> (Kubernetes manifests). Keep them separate.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><span style={{ fontSize: "20px" }}>✅</span> Deployment Checklist</div>
          <div className="card-body">
            <div className="step-list">
              {[
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
              ].map(([title, desc], i) => (
                <div className="step-item" key={i}>
                  <div style={{
                    width: 20,
                    height: 20,
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
        <span className="icon">🎉</span>
        <div>
          <strong>Congratulations!</strong> You now have a complete GitOps CI/CD pipeline:
          code pushed to GitHub → Jenkins builds and pushes to GHCR → ArgoCD detects the Git change
          → Kubernetes deploys with zero downtime. This is the foundation of modern DevOps.
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
