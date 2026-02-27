import { useState } from "react";

const steps = [
  {
    id: "create",
    title: "1. Create Spring Boot Service",
    icon: "🌱",
    color: "var(--accent)",
    desc: "A minimal Spring Boot app with one endpoint.",
    content: (
      <div>
        <div style={{ marginBottom: "0.5rem", fontSize: "12px", color: "var(--muted)" }}>
          <strong style={{ color: "#fff" }}>HelloWorksApplication.java</strong>
        </div>
        <div className="code-block" style={{ fontSize: "11px" }}>
{`@SpringBootApplication
@RestController
public class HelloWorksApplication {

    @GetMapping("/hello")
    public String hello() {
        return "Hello from HelloWorks Service — running on k3s! 🚀";
    }

    @GetMapping("/actuator/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "hello-works-service");
    }

    public static void main(String[] args) {
        SpringApplication.run(HelloWorksApplication.class, args);
    }
}`}
        </div>
        <div style={{ marginTop: "0.75rem", fontSize: "12px", color: "var(--muted)" }}>
          <strong style={{ color: "#fff" }}>application.properties</strong>
        </div>
        <div className="code-block" style={{ marginTop: "0.4rem", fontSize: "11px" }}>
{`server.port=8090
spring.application.name=hello-works-service
management.endpoints.web.exposure.include=health
management.endpoint.health.probes.enabled=true`}
        </div>
      </div>
    ),
  },
  {
    id: "dockerfile",
    title: "2. Add Dockerfile",
    icon: "🐳",
    color: "var(--accent3)",
    desc: "Multi-stage build targeting Java 21.",
    content: (
      <div className="code-block" style={{ fontSize: "11px" }}>
{`FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]`}
      </div>
    ),
  },
  {
    id: "jenkinsfile",
    title: "3. Add Jenkinsfile",
    icon: "🔧",
    color: "#a78bfa",
    desc: "Pipeline: build JAR → push image → update GitOps repo.",
    content: (
      <div className="code-block" style={{ fontSize: "10.5px" }}>
{`pipeline {
  agent any
  environment {
    SERVICE_NAME = 'hello-works-service'
    SERVICE_PORT = '8090'
    IMAGE        = "ghcr.io/ari-bizmwitu/\${SERVICE_NAME}"
    GITOPS_REPO  = 'https://github.com/ari-bizmwitu/bizmwitu-infra.git'
  }
  stages {
    stage('Build JAR') {
      steps { sh './mvnw package -DskipTests' }
    }
    stage('Login to GHCR') {
      steps {
        withCredentials([string(credentialsId: 'GITHUB_TOKEN', variable: 'TOKEN')]) {
          sh 'echo $TOKEN | docker login ghcr.io -u ari-bizmwitu --password-stdin'
        }
      }
    }
    stage('Build & Push Image') {
      steps {
        sh "docker build -t \${IMAGE}:\${BUILD_NUMBER} ."
        sh "docker push \${IMAGE}:\${BUILD_NUMBER}"
      }
    }
    stage('Update GitOps Repo') {
      steps {
        withCredentials([string(credentialsId: 'GITOPS_PAT', variable: 'PAT')]) {
          sh """
            git clone https://\${PAT}@github.com/ari-bizmwitu/bizmwitu-infra.git infra
            cd infra
            sed -i 's|\${IMAGE}:.*|\${IMAGE}:\${BUILD_NUMBER}|' \\
              apps/\${SERVICE_NAME}/deployment.yaml
            git config user.email "jenkins@bizmwitu.com"
            git config user.name "Jenkins"
            git commit -am "ci: bump \${SERVICE_NAME} to build \${BUILD_NUMBER}"
            git push
          """
        }
      }
    }
  }
}`}
      </div>
    ),
  },
  {
    id: "gitops",
    title: "4. Add to GitOps Repo",
    icon: "📁",
    color: "var(--accent4)",
    desc: "Two files in bizmwitu-infra: deployment.yaml + service.yaml + ArgoCD application.",
    content: (
      <div>
        <div style={{ marginBottom: "0.5rem", fontSize: "12px", color: "var(--muted)" }}>
          <strong style={{ color: "#fff" }}>apps/hello-works-service/deployment.yaml</strong>
        </div>
        <div className="code-block" style={{ fontSize: "10.5px", marginBottom: "0.75rem" }}>
{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-works-service
  namespace: production
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hello-works-service
  template:
    metadata:
      labels:
        app: hello-works-service
    spec:
      serviceAccountName: spring-cloud-kubernetes
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: hello-works-service
          image: ghcr.io/ari-bizmwitu/hello-works-service:1
          ports:
            - containerPort: 8090
          env:
            - name: SERVER_PORT
              value: "8090"
            - name: SPRING_PROFILES_ACTIVE
              value: "prod"
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
              port: 8090
            initialDelaySeconds: 60
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8090
            initialDelaySeconds: 90
            periodSeconds: 15`}
        </div>
        <div style={{ marginBottom: "0.5rem", fontSize: "12px", color: "var(--muted)" }}>
          <strong style={{ color: "#fff" }}>apps/hello-works-service/service.yaml</strong>
        </div>
        <div className="code-block" style={{ fontSize: "10.5px", marginBottom: "0.75rem" }}>
{`apiVersion: v1
kind: Service
metadata:
  name: hello-works-service
  namespace: production
spec:
  selector:
    app: hello-works-service
  ports:
    - port: 8090
      targetPort: 8090`}
        </div>
        <div style={{ marginBottom: "0.5rem", fontSize: "12px", color: "var(--muted)" }}>
          <strong style={{ color: "#fff" }}>argocd/applications/app-hello-works-service.yaml</strong>
        </div>
        <div className="code-block" style={{ fontSize: "10.5px" }}>
{`apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hello-works-service
  namespace: argocd
  annotations:
    argocd.argoproj.io/sync-wave: "5"
spec:
  project: bizmwitu
  source:
    repoURL: https://github.com/ari-bizmwitu/bizmwitu-infra.git
    targetRevision: main
    path: apps/hello-works-service
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=false`}
        </div>
      </div>
    ),
  },
  {
    id: "gateway",
    title: "5. Register in API Gateway",
    icon: "🔀",
    color: "var(--accent)",
    desc: "Add a route in the Config Server — Spring Cloud Kubernetes discovers the service automatically.",
    content: (
      <div>
        <div style={{ marginBottom: "0.5rem", fontSize: "12px", color: "var(--muted)" }}>
          <strong style={{ color: "#fff" }}>In config-server repo → application-prod.yml (gateway section)</strong>
        </div>
        <div className="code-block" style={{ fontSize: "11px" }}>
{`spring:
  cloud:
    gateway:
      routes:
        # ... existing routes ...
        - id: hello-works-service
          uri: lb://hello-works-service
          predicates:
            - Path=/hello/**
          filters:
            - AddRequestHeader=X-Internal-API-Key, \${INTERNAL_API_KEY}`}
        </div>
        <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
          <span className="icon">💡</span>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>
            <code>lb://hello-works-service</code> — the <strong>lb://</strong> prefix tells Spring Cloud Gateway to use Kubernetes service discovery. It resolves <code>hello-works-service</code> to the pod IP using the K8s DNS + RBAC setup. No Eureka. No hardcoded IPs.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "deploy",
    title: "6. Deploy & Verify",
    icon: "🚀",
    color: "var(--accent4)",
    desc: "Push code → Jenkins builds → ArgoCD deploys → hit the URL.",
    content: (
      <div>
        <div style={{ marginBottom: "0.5rem", fontSize: "12px", color: "var(--muted)" }}>
          <strong style={{ color: "#fff" }}>On the VPS — apply the ArgoCD application</strong>
        </div>
        <div className="code-block" style={{ fontSize: "11px", marginBottom: "0.75rem" }}>
{`# Apply the ArgoCD application manifest
kubectl apply -f argocd/applications/app-hello-works-service.yaml

# Watch it come up
kubectl get pods -n production -w

# Verify it's running
kubectl logs -n production deployment/hello-works-service --tail=50`}
        </div>
        <div style={{ marginBottom: "0.5rem", fontSize: "12px", color: "var(--muted)" }}>
          <strong style={{ color: "#fff" }}>Test it</strong>
        </div>
        <div className="code-block" style={{ fontSize: "11px", marginBottom: "0.75rem" }}>
{`# Direct pod test (internal)
curl http://localhost:8090/hello

# Via API Gateway (external URL)
curl http://<VPS_IP>:30000/hello

# Expected response:
# Hello from HelloWorks Service — running on k3s! 🚀`}
        </div>
        <div className="highlight-box success">
          <span className="icon">🎉</span>
          <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>
            <strong style={{ color: "var(--accent4)" }}>That's the full GitOps cycle.</strong> From empty Spring Boot project to a live, auto-deployed, gateway-registered microservice — using the same pipeline every Bizmwitu service uses.
          </div>
        </div>
      </div>
    ),
  },
];

export default function LiveDemo() {
  const [open, setOpen] = useState(null);

  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 10 · Live Demo</span>
        <h2 className="slide-title">Deploy: Hello Works Service</h2>
        <p className="slide-subtitle">
          A brand new Spring Boot microservice — zero to live on Bizmwitu's k3s cluster.
          Click each step to expand.
        </p>
      </div>

      <div className="highlight-box warning" style={{ marginBottom: "1.5rem" }}>
        <span className="icon">🎯</span>
        <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>
          <strong style={{ color: "var(--accent3)" }}>Demo goal:</strong> Create a Spring Boot service that returns a string, add it to Bizmwitu's GitOps pipeline, deploy it live, and access it via the API Gateway at <code>http://{"<VPS_IP>"}:30000/hello</code>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              background: "var(--surface)",
              border: `1px solid ${open === step.id ? step.color : "var(--border)"}`,
              borderRadius: "10px",
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}
          >
            <button
              onClick={() => setOpen(open === step.id ? null : step.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem 1.25rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "22px" }}>{step.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "14px", color: "#fff" }}>{step.title}</div>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>{step.desc}</div>
              </div>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "18px",
                color: step.color,
                transform: open === step.id ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}>▶</span>
            </button>

            {open === step.id && (
              <div style={{ padding: "0 1.25rem 1.25rem", animation: "fadeIn 0.2s ease" }}>
                <hr style={{ border: "none", borderTop: "1px solid var(--border)", marginBottom: "1rem" }} />
                {step.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        background: "linear-gradient(135deg, rgba(0,229,255,0.06), rgba(124,58,237,0.06))",
        border: "1px solid rgba(0,229,255,0.2)",
        borderRadius: "12px",
        padding: "1.5rem",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
          🎓 That's the <span className="glow-text">GitOps Bridge</span>
        </div>
        <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "540px", margin: "0 auto", lineHeight: 1.8 }}>
          Git push → Jenkins CI → Docker image → GHCR → GitOps repo update → ArgoCD sync → Kubernetes rolling update → Live service behind the API Gateway.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          {["No manual deployments", "Self-healing", "Version controlled", "Auditable", "Scalable"].map(t => (
            <span key={t} className="badge badge-green">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}