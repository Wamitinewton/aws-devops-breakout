import { FiBox, FiSliders, FiRefreshCw, FiActivity, FiSearch, FiLock, FiCpu, FiServer, FiZap, FiInfo } from "react-icons/fi";
import FAQ from "../components/FAQ";

const FAQ_ITEMS = [
  {
    q: "Why do we need Kubernetes if Docker already runs containers?",
    a: "Docker runs containers on a single machine. Kubernetes orchestrates containers across many machines. Docker tells you how to package and run one container; Kubernetes answers: how do I run 100 containers across 10 servers, restart failed ones automatically, scale up under load, roll out new versions without downtime, and route traffic to healthy instances? These are production concerns Docker alone cannot solve.",
  },
  {
    q: "What is the difference between a Pod and a Container?",
    a: "A container is a running process in an isolated environment. A Pod is Kubernetes' smallest deployable unit — it wraps one or more containers that share a network namespace (same IP) and storage volumes. Most of the time a Pod contains exactly one container, but sidecar patterns (e.g., a logging agent alongside your app) use multiple containers in one Pod.",
  },
  {
    q: "What does 'self-healing' mean in Kubernetes?",
    a: "Kubernetes continuously compares the actual state of the cluster with the desired state you declared. If a Pod crashes, Kubernetes restarts it. If a Node fails, Kubernetes reschedules the Pods from that node onto healthy nodes. You declare 'I want 3 replicas' and Kubernetes ensures there are always 3, no matter what happens.",
  },
  {
    q: "Why use k3s instead of a full Kubernetes installation?",
    a: "k3s is a CNCF-certified, production-grade Kubernetes distribution that installs with a single binary. A full K8s install requires at least 3 control-plane nodes and many GB of RAM — overkill for learning and small servers. k3s runs on as little as 512 MB RAM, installs in under 30 seconds, and is API-compatible with full K8s. Everything you learn on k3s transfers directly to any other Kubernetes distribution.",
  },
];

const CAPABILITIES = [
  { icon: FiBox,      label: "Container Scheduling", desc: "Decides which node (server) each container runs on based on available CPU and memory resources." },
  { icon: FiSliders,  label: "Auto Scaling",          desc: "Automatically adds or removes container instances based on CPU usage, memory, or custom metrics." },
  { icon: FiRefreshCw,label: "Rolling Updates",       desc: "Deploys a new version gradually — new pods come up, traffic shifts, old pods go down. Zero downtime." },
  { icon: FiActivity, label: "Self-Healing",           desc: "Restarts crashed containers, replaces unhealthy nodes, reschedules pods when a server fails." },
  { icon: FiSearch,   label: "Service Discovery",     desc: "Containers find each other by DNS name, not IP address. IPs are ephemeral; DNS names are stable." },
  { icon: FiLock,     label: "Secret Management",     desc: "Stores sensitive data (passwords, tokens) as Secrets and injects them into pods as env vars or files." },
];

const CONTROL_PLANE_ITEMS = [
  ["API Server (kube-apiserver)", "The front door — all kubectl commands and ArgoCD syncs go through here via REST"],
  ["etcd", "A distributed key-value store — the single source of truth for all cluster state"],
  ["Scheduler (kube-scheduler)", "Watches for new pods with no assigned node and selects the best node to run them on"],
  ["Controller Manager", "Runs control loops: ensure 3 replicas, restart crashed pods, manage endpoints, etc."],
];

const WORKER_NODE_ITEMS = [
  ["kubelet", "Agent on every node. Talks to the API server and ensures pods declared for this node are running"],
  ["kube-proxy", "Manages network rules so traffic can reach pods. Implements the Service abstraction"],
  ["Container Runtime", "The engine that actually runs containers. Usually containerd (Docker's runtime underneath)"],
];

export default function Kubernetes1() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Kubernetes · Page 1 of 3</span>
        <h1 className="slide-title">
          <span style={{ color: "#326ce5" }}>Kubernetes</span> — Container Orchestration
        </h1>
        <p className="slide-subtitle">
          Kubernetes manages the deployment, scaling, and operation of containerised applications.
          It turns a group of servers into a single, programmable platform.
        </p>
      </div>

      <div className="highlight-box warning" style={{ marginBottom: "1.5rem" }}>
        <span className="icon"><FiInfo size={17} /></span>
        <div>
          <strong>The orchestration problem:</strong> You have a containerised app. It runs great
          locally. Now imagine 10 servers, needing 50 container instances, updating to a new version
          without downtime, restarting crashed containers automatically, and routing traffic to only
          healthy instances. Doing this manually is impossible at scale — Kubernetes automates it.
        </div>
      </div>

      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        {CAPABILITIES.map(({ icon: Icon, label, desc }) => (
          <div className="card" key={label}>
            <div className="card-title"><Icon size={17} /> {label}</div>
            <div className="card-body">{desc}</div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-title"><FiCpu size={17} /> Control Plane</div>
          <div className="card-body">
            <p style={{ marginBottom: "0.75rem" }}>The brain of the cluster. Manages state and makes scheduling decisions. Components:</p>
            <div className="step-list">
              {CONTROL_PLANE_ITEMS.map(([name, desc]) => (
                <div className="step-item" key={name}>
                  <div className="step-content">
                    <div className="step-title" style={{ fontSize: "12px" }}>{name}</div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><FiServer size={17} /> Worker Nodes</div>
          <div className="card-body">
            <p style={{ marginBottom: "0.75rem" }}>The machines that actually run your containers. Each node has:</p>
            <div className="step-list">
              {WORKER_NODE_ITEMS.map(([name, desc]) => (
                <div className="step-item" key={name}>
                  <div className="step-content">
                    <div className="step-title" style={{ fontSize: "12px" }}>{name}</div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(50,108,229,0.08)", borderRadius: "8px", border: "1px solid rgba(50,108,229,0.25)" }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "12px", color: "#60a5fa", marginBottom: "0.4rem" }}>k3s vs full K8s</div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                k3s is a single binary that installs in &lt; 30 seconds. It bundles the control plane,
                containerd, and a SQLite database instead of etcd. API-compatible with full K8s —
                perfect for learning and small VPS deployments.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><FiZap size={17} /> Installing k3s (one command)</div>
        <div className="card-body" style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
          <div style={{ background: "#0d1117", borderRadius: "8px", padding: "1rem 1.25rem", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--vscode-comment)", marginBottom: "0.5rem" }}># Install k3s server (control plane + worker)</div>
            <div style={{ color: "var(--vscode-builtin)" }}>curl -sfL https://get.k3s.io | sh -</div>
            <div style={{ color: "var(--vscode-comment)", marginTop: "1rem", marginBottom: "0.5rem" }}># Verify the cluster is running</div>
            <div style={{ color: "var(--vscode-builtin)" }}>sudo k3s kubectl get nodes</div>
            <div style={{ color: "var(--vscode-comment)", marginTop: "1rem", marginBottom: "0.5rem" }}># Copy kubeconfig for kubectl access</div>
            <div style={{ color: "var(--vscode-builtin)" }}>sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config</div>
            <div style={{ color: "var(--vscode-builtin)" }}>sudo chown $(whoami) ~/.kube/config</div>
          </div>
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
