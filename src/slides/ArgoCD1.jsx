import { FiGitBranch, FiSettings, FiBarChart2, FiSliders } from "react-icons/fi";
import FAQ from "../components/FAQ";

const FAQ_ITEMS = [
  {
    q: "What is GitOps and how is it different from just using a deploy script?",
    a: (
      <>
        <p><strong>GitOps</strong> is a set of practices where Git is the single source of truth for both application code and infrastructure. Every change to the cluster goes through a Git commit — there are no 'manual' deployments.</p>
        <p>With a deploy script, the production state is whatever the last script run did. With GitOps: the desired state is always in Git, every deployment has an audit trail (who, what, when), rolling back means reverting a commit, and ArgoCD continuously ensures the cluster matches Git — correcting any manual changes automatically.</p>
      </>
    ),
  },
  {
    q: "What is 'drift' in the context of ArgoCD?",
    a: "Drift is when the actual state of the Kubernetes cluster differs from the desired state stored in Git. For example, a developer manually runs kubectl scale deployment hello-devops --replicas=5 on the cluster. The Git manifest says replicas: 2. That gap is drift. ArgoCD detects drift continuously and, with selfHeal: true, automatically corrects it back to 2 replicas — restoring what Git says.",
  },
  {
    q: "What is the difference between ArgoCD syncing and Kubernetes applying a manifest?",
    a: "kubectl apply is a one-time operation — you run it, it applies the manifest, and nothing watches the cluster afterward. ArgoCD is continuous — it polls Git every 3 minutes (or receives a webhook) and watches the cluster in real time. Any drift is detected and corrected automatically. ArgoCD also provides a UI to see the sync status, health of every resource, and the history of all syncs.",
  },
  {
    q: "Does ArgoCD replace Jenkins?",
    a: "No — they serve different parts of the pipeline. Jenkins is the CI tool: it builds your code, creates the Docker image, and pushes it to GHCR. ArgoCD is the CD tool: it watches the GitOps repo and deploys to Kubernetes. Jenkins writes a new image tag to Git; ArgoCD detects that Git change and applies it to the cluster. They complement each other perfectly.",
  },
];

const GITOPS_PRINCIPLES = [
  { n: "1", label: "Declarative",              desc: "The entire system — deployments, services, configs — is described declaratively in YAML files. You describe the desired state, not the steps to get there." },
  { n: "2", label: "Versioned",                desc: "Git is the source of truth. Every change to infrastructure is a commit with a message, author, and timestamp. Full audit trail. Rollback = git revert." },
  { n: "3", label: "Pulled",                   desc: "Changes are pulled by ArgoCD running inside the cluster — not pushed by external scripts. The cluster always initiates, making firewall rules simpler and more secure." },
  { n: "4", label: "Continuously Reconciled",  desc: "ArgoCD continuously compares the live cluster state with Git. Any drift is automatically corrected. The cluster is self-healing." },
];

const HOW_IT_WORKS = [
  ["Watches a Git repo",   "You configure ArgoCD with a Git repository URL (your infra repo) and a path to YAML manifests"],
  ["Polls for changes",    "ArgoCD checks the repo every 3 minutes (configurable) for new commits. Webhooks trigger immediate detection."],
  ["Compares to cluster",  "ArgoCD queries the Kubernetes API and compares live state to the desired state in Git"],
  ["Detects drift",        "Any difference between Git and the cluster is flagged as 'OutOfSync'. ArgoCD shows exactly what changed."],
  ["Syncs automatically",  "With automated sync enabled, ArgoCD runs kubectl apply to bring the cluster into sync with Git"],
];

const SYNC_STATES = [
  { color: "var(--accent4)", label: "Synced",    desc: "Cluster state matches Git exactly — all good" },
  { color: "var(--accent3)", label: "OutOfSync", desc: "Cluster differs from Git — drift detected or new commit not yet applied" },
  { color: "var(--accent)",  label: "Syncing",   desc: "ArgoCD is currently applying changes to the cluster" },
  { color: "#a78bfa",        label: "Unknown",   desc: "ArgoCD cannot determine the state — usually a permissions issue" },
];

const HEALTH_STATES = [
  { color: "var(--accent4)", label: "Healthy",     desc: "All pods running and passing probes" },
  { color: "var(--accent3)", label: "Progressing", desc: "Rollout in progress" },
  { color: "var(--danger)",  label: "Degraded",    desc: "One or more pods failing" },
  { color: "var(--muted)",   label: "Suspended",   desc: "CronJob or resource paused" },
];

const COMPARISON_ROWS = [
  ["Audit trail",     "None — who ran what command?",         "Every deployment is a Git commit with author + message"],
  ["Drift detection", "Manual — you have to compare yourself", "Automatic — detects and corrects drift continuously"],
  ["Rollback",        "kubectl rollout undo (limited history)", "git revert → ArgoCD syncs the old state back"],
  ["Multi-cluster",   "Run kubectl against each cluster",      "One ArgoCD managing multiple clusters"],
  ["Access control",  "Everyone needs kubectl cluster access", "Developers push to Git; ArgoCD has cluster access"],
  ["Visibility",      "No central view of what is deployed",   "ArgoCD UI shows all apps, sync status, and history"],
];

export default function ArgoCD1() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">ArgoCD · Page 1 of 2</span>
        <h1 className="slide-title">
          <span style={{ color: "#ef7b4d" }}>ArgoCD</span> — GitOps Continuous Delivery
        </h1>
        <p className="slide-subtitle">
          ArgoCD makes Git the single source of truth for your Kubernetes deployments.
          It continuously ensures your cluster matches exactly what is in your repository.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem", borderColor: "rgba(239,123,77,0.3)" }}>
        <div className="card-title" style={{ color: "#ef7b4d" }}>
          <FiGitBranch size={17} style={{ color: "#ef7b4d" }} /> The Four GitOps Principles
        </div>
        <div className="card-grid" style={{ marginTop: "0.5rem" }}>
          {GITOPS_PRINCIPLES.map(({ n, label, desc }) => (
            <div key={n} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1rem" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#ef7b4d", fontWeight: 700, marginBottom: "0.3rem", letterSpacing: "2px" }}>PRINCIPLE {n}</div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "14px", color: "#fff", marginBottom: "0.4rem" }}>{label}</div>
              <div style={{ fontSize: "12.5px", color: "var(--muted)", lineHeight: "1.7" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-title"><FiSettings size={17} /> How ArgoCD Works</div>
          <div className="card-body">
            <div className="step-list">
              {HOW_IT_WORKS.map(([title, desc], i) => (
                <div className="step-item" key={i}>
                  <div className="step-num">{i + 1}</div>
                  <div className="step-content">
                    <div className="step-title">{title}</div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><FiBarChart2 size={17} /> ArgoCD Sync States</div>
          <div className="card-body">
            <div className="step-list" style={{ gap: "0.6rem" }}>
              {SYNC_STATES.map(({ color, label, desc }) => (
                <div className="step-item" key={label}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 4, boxShadow: `0 0 8px ${color}66` }} />
                  <div className="step-content">
                    <div className="step-title" style={{ color }}>{label}</div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "13px", color: "#fff", marginBottom: "0.5rem" }}>Health States</div>
              <div className="step-list" style={{ gap: "0.4rem" }}>
                {HEALTH_STATES.map(({ color, label, desc }) => (
                  <div className="step-item" key={label}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 4 }} />
                    <div className="step-content">
                      <div style={{ fontSize: "12.5px", color, fontWeight: 700 }}>{label}</div>
                      <div className="step-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title"><FiSliders size={17} /> ArgoCD vs Manual kubectl apply</div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Manual kubectl apply</th>
                <th>ArgoCD (GitOps)</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map(([aspect, manual, argo]) => (
                <tr key={aspect}>
                  <td style={{ fontWeight: 700, color: "var(--text)" }}>{aspect}</td>
                  <td style={{ color: "var(--danger)", fontSize: "12px" }}>✗ {manual}</td>
                  <td style={{ color: "var(--accent4)", fontSize: "12px" }}>✓ {argo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
