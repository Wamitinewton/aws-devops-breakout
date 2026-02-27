import QuestionBox from "../components/QuestionBox";

export default function APIGateway() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 09</span>
        <h2 className="slide-title">API Gateway & Service Discovery</h2>
        <p className="slide-subtitle">The single entry point into Bizmwitu — and how it finds every backend service without Eureka.</p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>What the API Gateway Does</div>
          <div className="step-list">
            {[
              { title: "Single Entry Point", desc: "All external traffic comes to :30000. No service is directly exposed to the internet except the gateway." },
              { title: "JWT Validation", desc: "Validates JWT tokens on every request before forwarding. If token is invalid, returns 401 immediately — never hits backend services." },
              { title: "Route to Services", desc: "Based on the path prefix (/auth/**, /users/**, /org/**), routes to the correct internal service." },
              { title: "Internal API Key", desc: "Adds an X-Internal-API-Key header to every forwarded request. Backend services reject any request without it — ensuring direct access is impossible." },
            ].map(s => (
              <div key={s.title} className="step-item">
                <div className="step-num" style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", fontSize: "12px" }}>▶</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>
            Kubernetes-Native Service Discovery
          </div>
          <div className="highlight-box info" style={{ marginBottom: "1rem" }}>
            <span className="icon">🔍</span>
            <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>
              <strong style={{ color: "var(--accent)" }}>We no longer use Eureka for service discovery.</strong> Instead, the API Gateway uses Spring Cloud Kubernetes, which reads the Kubernetes API directly to discover services by their K8s Service name.
            </div>
          </div>

          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "13px", marginBottom: "0.5rem" }}>
            How it works:
          </div>
          <div className="step-list">
            {[
              { n: "1", title: "RBAC ServiceAccount", desc: "spring-cloud-kubernetes ServiceAccount has Role that can GET/LIST/WATCH services, endpoints, and pods in the production namespace." },
              { n: "2", title: "Kubernetes DNS", desc: "Services are reachable by their DNS name: auth-service.production.svc.cluster.local or simply auth-service (same namespace)." },
              { n: "3", title: "Gateway discovers them", desc: "Spring Cloud Gateway resolves lb://auth-service to the actual pod IP via Kubernetes service discovery — no registry needed." },
            ].map(s => (
              <div key={s.n} className="step-item">
                <div className="step-num">{s.n}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>
        Service Discovery RBAC (required for Spring Cloud Kubernetes)
      </div>
      <div className="code-block" style={{ fontSize: "11px" }}>
        <span className="key">kind</span>: Role{"\n"}
        <span className="key">metadata</span>: {"{ name: service-discovery, namespace: production }"}{"\n"}
        <span className="key">rules</span>:{"\n"}
        {"  "}- <span className="key">apiGroups</span>: [""]  <span className="comment"># core API group</span>{"\n"}
        {"    "}<span className="key">resources</span>: [<span className="string">services</span>, <span className="string">endpoints</span>, <span className="string">pods</span>]{"\n"}
        {"    "}<span className="key">verbs</span>: [<span className="string">get</span>, <span className="string">list</span>, <span className="string">watch</span>]{"\n"}
        {"  "}- <span className="key">apiGroups</span>: [""]  <span className="comment"># also needs configmaps</span>{"\n"}
        {"    "}<span className="key">resources</span>: [<span className="string">configmaps</span>]{"\n"}
        {"    "}<span className="key">verbs</span>: [<span className="string">get</span>, <span className="string">list</span>, <span className="string">watch</span>]
      </div>

      <div style={{ marginTop: "1rem" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>
          Traffic Flow: Mobile App → API Gateway → Service
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { label: "Mobile App", sub: "POST /auth/login", color: "var(--accent3)" },
            "→",
            { label: "VPS:30000", sub: "NodePort", color: "var(--muted)" },
            "→",
            { label: "API Gateway", sub: "validate JWT / route", color: "var(--accent)" },
            "→",
            { label: "auth-service", sub: ":8081 (ClusterIP)", color: "#a78bfa" },
            "→",
            { label: "Response", sub: "JWT tokens", color: "var(--accent4)" },
          ].map((item, i) => typeof item === "string" ? (
            <span key={i} style={{ color: "var(--muted)", fontSize: "20px" }}>→</span>
          ) : (
            <div key={i} style={{
              background: "var(--surface2)",
              border: `1px solid var(--border)`,
              borderRadius: "8px",
              padding: "8px 14px",
              textAlign: "center",
              minWidth: "110px",
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, color: item.color }}>{item.label}</div>
              <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <QuestionBox
        question="When a new hello-works-service is added and registered in the API Gateway, what needs to change and where?"
        answer="Two things: (1) In the API Gateway's application config (in the Config Server repo) — add a route: id: hello-works, uri: lb://hello-works-service, predicates: [Path=/hello/**]. Spring Cloud Kubernetes will automatically discover the hello-works-service Kubernetes Service as soon as it exists. (2) The hello-works-service deployment and service must exist in the production namespace with the correct labels. No manual service registration or Eureka entry needed."
      />
    </div>
  );
}