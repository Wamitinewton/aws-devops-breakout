import { useState } from "react";
import CodeBlock from "../components/CodeBlock";

const springBootCode = `@SpringBootApplication
@RestController
public class HelloWorksApplication {

    @GetMapping("/hello")
    public String hello() {
        return "Hello from HelloWorks Service — running on k3s!";
    }

    @GetMapping("/actuator/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "hello-works-service");
    }

    public static void main(String[] args) {
        SpringApplication.run(HelloWorksApplication.class, args);
    }
}`;

const appProperties = `server.port=8090
spring.application.name=hello-works-service
management.endpoints.web.exposure.include=health
management.endpoint.health.probes.enabled=true`;

const dockerfile = `FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]`;

const jenkinsfile = `pipeline {
  agent any
  environment {
    SERVICE_NAME = "hello-works-service"
    SERVICE_PORT = "8090"
    IMAGE        = "ghcr.io/ari-bizmwitu/\${SERVICE_NAME}"
    GITOPS_REPO  = "https://github.com/ari-bizmwitu/bizmwitu-infra.git"
  }
  stages {
    stage("Build JAR") {
      steps { sh "./mvnw package -DskipTests" }
    }
    stage("Login to GHCR") {
      steps {
        withCredentials([string(credentialsId: "GITHUB_TOKEN", variable: "TOKEN")]) {
          sh "echo $TOKEN | docker login ghcr.io -u ari-bizmwitu --password-stdin"
        }
      }
    }
    stage("Build and Push Image") {
      steps {
        sh "docker build -t \${IMAGE}:\${BUILD_NUMBER} ."
        sh "docker push \${IMAGE}:\${BUILD_NUMBER}"
      }
    }
    stage("Update GitOps Repo") {
      steps {
        withCredentials([string(credentialsId: "GITOPS_PAT", variable: "PAT")]) {
          sh """
            git clone https://\${PAT}@github.com/ari-bizmwitu/bizmwitu-infra.git infra
            cd infra
            sed -i "s|\${IMAGE}:.*|\${IMAGE}:\${BUILD_NUMBER}|" apps/\${SERVICE_NAME}/deployment.yaml
            git config user.email "jenkins@bizmwitu.com"
            git config user.name "Jenkins"
            git commit -am "ci: bump \${SERVICE_NAME} to build \${BUILD_NUMBER}"
            git push
          """
        }
      }
    }
  }
}`;

const deploymentYaml = `apiVersion: apps/v1
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
            periodSeconds: 15`;

const serviceYaml = `apiVersion: v1
kind: Service
metadata:
  name: hello-works-service
  namespace: production
spec:
  selector:
    app: hello-works-service
  ports:
    - port: 8090
      targetPort: 8090`;

const argoAppYaml = `apiVersion: argoproj.io/v1alpha1
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
      - CreateNamespace=false`;

const gatewayYaml = `spring:
  cloud:
    gateway:
      routes:
        - id: hello-works-service
          uri: lb://hello-works-service
          predicates:
            - Path=/hello/**`;

const deployBash = `kubectl apply -f argocd/applications/app-hello-works-service.yaml

kubectl get pods -n production -w

kubectl logs -n production deployment/hello-works-service --tail=50

curl http://<VPS_IP>:30000/hello`;

const steps = [
  {
    id: "create",
    title: "1. Create Spring Boot Service",
    color: "var(--accent)",
    desc: "A minimal Spring Boot app with one REST endpoint and health probes.",
    blocks: [
      { code: springBootCode, lang: "java", filename: "HelloWorksApplication.java" },
      { code: appProperties, lang: "yaml", filename: "application.properties" },
    ],
  },
  {
    id: "dockerfile",
    title: "2. Add Dockerfile",
    color: "var(--accent3)",
    desc: "Multi-stage build targeting Java 21.",
    blocks: [
      { code: dockerfile, lang: "dockerfile", filename: "Dockerfile" },
    ],
  },
  {
    id: "jenkinsfile",
    title: "3. Add Jenkinsfile",
    color: "#a78bfa",
    desc: "Pipeline: build JAR → push image → update GitOps repo.",
    blocks: [
      { code: jenkinsfile, lang: "groovy", filename: "Jenkinsfile" },
    ],
  },
  {
    id: "gitops",
    title: "4. Add to GitOps Repo",
    color: "var(--accent4)",
    desc: "Three files in bizmwitu-infra: deployment.yaml, service.yaml, and ArgoCD Application.",
    blocks: [
      { code: deploymentYaml, lang: "yaml", filename: "apps/hello-works-service/deployment.yaml" },
      { code: serviceYaml, lang: "yaml", filename: "apps/hello-works-service/service.yaml" },
      { code: argoAppYaml, lang: "yaml", filename: "argocd/applications/app-hello-works-service.yaml" },
    ],
  },
  {
    id: "gateway",
    title: "5. Register in API Gateway",
    color: "var(--accent)",
    desc: "Add a route in the Config Server. Spring Cloud Kubernetes discovers the service automatically.",
    blocks: [
      { code: gatewayYaml, lang: "yaml", filename: "config-server: application-prod.yml (gateway routes)" },
    ],
    note: "lb://hello-works-service resolves via Kubernetes DNS — no Eureka, no hardcoded IPs.",
  },
  {
    id: "deploy",
    title: "6. Deploy & Verify",
    color: "var(--accent4)",
    desc: "Apply the ArgoCD Application, watch the pod come up, and hit the endpoint.",
    blocks: [
      { code: deployBash, lang: "bash", filename: "Terminal" },
    ],
  },
];

export default function LiveDemo() {
  const [open, setOpen] = useState(null);

  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 08 · Live Demo</span>
        <h2 className="slide-title">Deploy: Hello Works Service</h2>
        <p className="slide-subtitle">
          A brand new Spring Boot microservice — zero to live on k3s. Click each step to expand.
        </p>
      </div>

      <div className="highlight-box warning" style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>
          <strong style={{ color: "var(--accent3)" }}>Demo goal:</strong> Create a Spring Boot service, add it to Bizmwitu's GitOps pipeline, deploy it live, and access it via the API Gateway at <code>http://{"<VPS_IP>"}:30000/hello</code>
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
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: `1.5px solid ${step.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 700,
                color: step.color,
                flexShrink: 0,
              }}>
                {step.id === "create" ? "01" : step.id === "dockerfile" ? "02" : step.id === "jenkinsfile" ? "03" : step.id === "gitops" ? "04" : step.id === "gateway" ? "05" : "06"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "14px", color: "#fff" }}>{step.title}</div>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>{step.desc}</div>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: open === step.id ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  color: step.color,
                  flexShrink: 0,
                }}
              >
                <path d="M9 18l6-6-6-6" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {open === step.id && (
              <div style={{ padding: "0 1.25rem 1.25rem", animation: "fadeIn 0.2s ease" }}>
                <hr style={{ border: "none", borderTop: "1px solid var(--border)", marginBottom: "1rem" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {step.blocks.map((b, i) => (
                    <CodeBlock key={i} code={b.code} lang={b.lang} filename={b.filename} />
                  ))}
                </div>
                {step.note && (
                  <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>{step.note}</div>
                  </div>
                )}
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
          That is the <span className="glow-text">GitOps Bridge</span>
        </div>
        <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "540px", margin: "0 auto", lineHeight: 1.8 }}>
          git push → Jenkins CI → Docker image → GHCR → GitOps repo update → ArgoCD sync → Kubernetes rolling update → Live service behind the API Gateway.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          {["No manual deployments", "Self-healing", "Version controlled", "Auditable", "Scalable"].map((t) => (
            <span key={t} className="badge badge-green">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}