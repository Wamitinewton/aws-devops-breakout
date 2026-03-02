import QuestionBox from "../components/QuestionBox";
import CodeBlock from "../components/CodeBlock";

const GatewayIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="9" height="18" rx="2" stroke="#00e5ff" strokeWidth="1.5"/>
    <rect x="13" y="3" width="9" height="8" rx="2" stroke="#a78bfa" strokeWidth="1.5"/>
    <rect x="13" y="13" width="9" height="8" rx="2" stroke="#10b981" strokeWidth="1.5"/>
    <path d="M11 7h2M11 12h2M11 17h2" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const eurekaYaml = `eureka:
  client:
    serviceUrl:
      defaultZone: http://eureka-server:8761/eureka/
  instance:
    preferIpAddress: true

spring:
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: lb://auth-service
          predicates:
            - Path=/auth/**`;

const k8sDiscoveryYaml = `spring:
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: lb://auth-service
          predicates:
            - Path=/auth/**`;

const rbacYaml = `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: service-discovery
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["services", "endpoints", "pods"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list", "watch"]`;

export default function APIGateway() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 07</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <GatewayIcon />
          <h2 className="slide-title">API Gateway & Service Discovery</h2>
        </div>
        <p className="slide-subtitle">The single entry point into a microservices system — and the two ways services find each other.</p>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>
          What is an API Gateway?
        </div>
        <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            {
              title: "Single Entry Point",
              color: "var(--accent)",
              desc: "All client traffic enters through one address. No service is exposed directly to the internet. The gateway is the only public-facing component.",
            },
            {
              title: "Routing",
              color: "#a78bfa",
              desc: "Based on the URL path prefix — /auth/**, /users/**, /orders/** — the gateway forwards the request to the correct backend service.",
            },
            {
              title: "Cross-cutting Concerns",
              color: "var(--accent3)",
              desc: "Auth validation, rate limiting, CORS, logging, and header manipulation happen once at the gateway — backend services don't need to repeat this.",
            },
            {
              title: "Load Balancing",
              color: "var(--accent4)",
              desc: "When a service runs multiple replicas, the gateway distributes requests across all healthy instances automatically via the lb:// prefix.",
            },
          ].map((c) => (
            <div key={c.title} className="card">
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: c.color, marginBottom: "0.5rem", fontSize: "13px" }}>{c.title}</div>
              <div className="card-body">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="section-divider" />

      <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, color: "#fff", fontSize: "1.2rem", marginBottom: "1.25rem" }}>
        Service Discovery: Two Approaches
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#a78bfa", fontSize: "14px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-purple">APPROACH 1</span> Eureka (Service Registry)
          </div>

          <div className="card-body" style={{ marginBottom: "1rem", lineHeight: 1.8 }}>
            Eureka is a service registry built by Netflix and integrated into Spring Cloud. Every service registers itself with the Eureka server on startup. The gateway queries Eureka to discover where a service lives, then routes requests to it.
          </div>

          <div className="step-list" style={{ marginBottom: "1rem" }}>
            {[
              { n: "1", title: "Service starts", desc: "auth-service sends a POST to Eureka: 'I am auth-service running at 10.0.1.5:8081'" },
              { n: "2", title: "Registry stores it", desc: "Eureka keeps a heartbeat map of all registered instances and their health status." },
              { n: "3", title: "Gateway asks Eureka", desc: "When the gateway resolves lb://auth-service, Eureka returns the list of live instances." },
              { n: "4", title: "Request routes", desc: "The gateway picks an instance and forwards the request." },
            ].map((s) => (
              <div key={s.n} className="step-item">
                <div className="step-num" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)" }}>{s.n}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <CodeBlock code={eurekaYaml} lang="yaml" filename="application.yml — with Eureka" />

          <div className="highlight-box warning" style={{ marginTop: "0.75rem" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              <strong style={{ color: "var(--accent3)" }}>Drawback:</strong> Eureka is an extra service to run, maintain, and keep available. Every service needs the Eureka client dependency and must be configured to register. If Eureka is down, discovery breaks.
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "var(--accent)", fontSize: "14px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-blue">APPROACH 2</span> Kubernetes Service Discovery
          </div>

          <div className="card-body" style={{ marginBottom: "1rem", lineHeight: 1.8 }}>
            When running inside Kubernetes, Spring Cloud Kubernetes replaces Eureka entirely. The gateway reads the Kubernetes API directly — services are already registered as Kubernetes Services with stable DNS names. No extra registry needed.
          </div>

          <div className="step-list" style={{ marginBottom: "1rem" }}>
            {[
              { n: "1", title: "Service is deployed", desc: "Kubernetes creates a Service object for auth-service. It gets a stable DNS name: auth-service.production.svc.cluster.local" },
              { n: "2", title: "DNS always resolves", desc: "As long as the Kubernetes Service exists, its DNS name resolves — even if pods restart and get new IPs." },
              { n: "3", title: "Gateway reads K8s API", desc: "Spring Cloud Kubernetes uses an RBAC ServiceAccount to list services and endpoints from the cluster API." },
              { n: "4", title: "lb:// resolves natively", desc: "lb://auth-service resolves to the pod IPs behind the Kubernetes Service — no Eureka, no extra hops." },
            ].map((s) => (
              <div key={s.n} className="step-item">
                <div className="step-num">{s.n}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <CodeBlock code={k8sDiscoveryYaml} lang="yaml" filename="application.yml — with Spring Cloud Kubernetes" />

          <div className="highlight-box success" style={{ marginTop: "0.75rem" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              <strong style={{ color: "var(--accent4)" }}>Advantage:</strong> The gateway config looks identical to the Eureka version. The difference is that Spring Cloud Kubernetes resolves lb:// using the Kubernetes API instead of querying a registry. One less service to operate.
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>
        RBAC for Kubernetes Service Discovery
      </div>
      <div className="card-body" style={{ marginBottom: "0.75rem" }}>
        For Spring Cloud Kubernetes to read the cluster API, the gateway pod needs a ServiceAccount with a Role that grants read access to services, endpoints, pods, and configmaps.
      </div>
      <CodeBlock code={rbacYaml} lang="yaml" filename="service-discovery-rbac.yaml" />

      <div style={{ marginTop: "1.5rem" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>
          Comparison at a Glance
        </div>
        <table className="port-table">
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Eureka</th>
              <th>Kubernetes Discovery</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Extra service to run", "Yes — Eureka Server pod", "No"],
              ["Client dependency", "spring-cloud-starter-netflix-eureka-client", "spring-cloud-starter-kubernetes-client-all"],
              ["How services register", "Self-register on startup", "Automatically via K8s Service objects"],
              ["DNS resolution", "Via Eureka registry", "Via native Kubernetes DNS"],
              ["Works outside K8s?", "Yes", "No — requires cluster"],
              ["Recommended for K8s", "No", "Yes"],
            ].map(([aspect, eureka, k8s]) => (
              <tr key={aspect}>
                <td style={{ color: "#94a3b8" }}>{aspect}</td>
                <td style={{ color: "#64748b" }}>{eureka}</td>
                <td style={{ color: "var(--accent4)" }}>{k8s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <QuestionBox
        question="When a new microservice is added to a Kubernetes cluster, what does the API Gateway need to do to start routing traffic to it?"
        answer="Two things: (1) Add a route entry in the gateway config — id, uri: lb://new-service, and the path predicate. Spring Cloud Kubernetes will automatically discover the new Kubernetes Service by name as soon as it exists in the cluster. (2) Ensure the new service has a Kubernetes Service object with a matching name. No manual service registration, no Eureka entry, no hardcoded IP addresses needed."
      />
    </div>
  );
}