import QuestionBox from "../components/QuestionBox";

export default function Architecture() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 06</span>
        <h2 className="slide-title">System Architecture</h2>
        <p className="slide-subtitle">Everything running on a single 24GB RAM Contabo VPS — Docker + k3s side by side.</p>
      </div>

      <div className="arch-box" style={{ marginBottom: "1.5rem", fontSize: "11px" }}>
        {`┌─────────────────────── CONTABO VPS ──────────────────────────┐
│                                                               │
│  ┌─────────────────────┐    ┌──────────────────────────────┐ │
│  │   Docker Engine      │    │        k3s Cluster           │ │
│  │  ┌───────────────┐  │    │                              │ │
│  │  │   Jenkins     │  │    │  [argocd]                    │ │
│  │  │   :8080       │  │    │  └── ArgoCD Server :30443    │ │
│  │  └───────────────┘  │    │                              │ │
│  └─────────────────────┘    │  [kafka]                     │ │
│                              │  ├── Kafka (KRaft) :9092    │ │
│                              │  └── Kafka UI :30100        │ │
│                              │                              │ │
│                              │  [production]                │ │
│                              │  ├── config-server :8888    │ │
│                              │  ├── api-gateway :30000 ◄── ┼─┼── INTERNET
│                              │  ├── auth-service :8081     │ │
│                              │  ├── user-service :8082     │ │
│                              │  ├── org-service :8083      │ │
│                              │  ├── notif-service :8084    │ │
│                              │  ├── migrations :8085       │ │
│                              │  ├── storage-service :8086  │ │
│                              │  └── billing-service :8087  │ │
│                              └──────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
    │                              │
External Services            CI/CD Bridge
├── PostgreSQL (Neon)         Jenkins → GHCR → GitOps repo
├── Redis Cloud                     ↓
└── GitHub repos              ArgoCD syncs cluster`}
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>Access Points</div>
          <table className="port-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>URL / Port</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["API Gateway", ":30000", "NodePort"],
                ["Jenkins", ":8080", "Docker"],
                ["ArgoCD UI", ":30443", "NodePort"],
                ["Kafka UI", ":30100", "NodePort"],
                ["All others", "Internal", "ClusterIP"],
              ].map(([svc, port, type]) => (
                <tr key={svc}>
                  <td>{svc}</td>
                  <td><code>{port}</code></td>
                  <td><span className={`badge ${type === "NodePort" ? "badge-blue" : type === "Docker" ? "badge-amber" : "badge-purple"}`}>{type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>Design Decisions</div>
          <div className="step-list">
            {[
              { title: "Jenkins outside k3s", desc: "Needs direct Docker socket access to build images. DinD (Docker-in-Docker) adds complexity. Running as a plain container is simpler." },
              { title: "ArgoCD inside k3s", desc: "Needs direct cluster API access to apply deployments. Kubernetes-native is the right home for it." },
              { title: "No Ingress controller", desc: "We use NodePort on the API Gateway as our single entry point. No Traefik/Nginx overhead needed. Domain + TLS can be added later." },
              { title: "External databases", desc: "Postgres on Neon, Redis on Redis Cloud. No database pods inside k3s — stateful workloads are kept external for simplicity and reliability." },
            ].map(s => (
              <div key={s.title} className="step-item">
                <div className="step-num" style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", fontSize: "14px" }}>→</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuestionBox
        question="Why are databases (Postgres, Redis) kept external (Neon, Redis Cloud) rather than running as pods in k3s?"
        answer="Running stateful workloads like databases in Kubernetes requires PersistentVolumes, StatefulSets, backup strategies, and careful data management. For a single-node setup, if the VPS goes down, you'd lose your data. External managed services (Neon, Redis Cloud) handle redundancy, backups, and scaling. The k3s cluster stays stateless — every pod can be destroyed and recreated without data loss."
      />
    </div>
  );
}