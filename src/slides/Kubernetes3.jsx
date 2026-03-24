import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

const KUBECTL_COMMANDS = `# ── Cluster Information ──────────────────────────────────────────
kubectl cluster-info
kubectl get nodes

# ── Apply manifests (creates or updates resources) ───────────────
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/          # Apply all files in a directory

# ── Namespaces ────────────────────────────────────────────────────
kubectl create namespace production
kubectl get namespaces
kubectl config set-context --current --namespace=production

# ── Pods ──────────────────────────────────────────────────────────
kubectl get pods -n production
kubectl get pods -n production -w          # Watch in real time
kubectl describe pod <pod-name> -n production
kubectl logs <pod-name> -n production
kubectl logs <pod-name> -n production -f   # Follow logs live
kubectl exec -it <pod-name> -n production -- /bin/sh

# ── Deployments ───────────────────────────────────────────────────
kubectl get deployments -n production
kubectl rollout status deployment/hello-devops -n production
kubectl rollout history deployment/hello-devops -n production
kubectl rollout undo deployment/hello-devops -n production

# ── Services ──────────────────────────────────────────────────────
kubectl get services -n production
kubectl get svc -n production

# ── Resource Usage ────────────────────────────────────────────────
kubectl top nodes
kubectl top pods -n production

# ── Delete Resources ─────────────────────────────────────────────
kubectl delete pod <pod-name> -n production   # Deployment recreates it
kubectl delete deployment hello-devops -n production`;

const NAMESPACE_STRUCTURE = `# Recommended namespace structure for a beginner setup

# Create namespaces
kubectl create namespace production
kubectl create namespace argocd

# production namespace — your running application
kubectl get all -n production

# argocd namespace — ArgoCD controller + UI
kubectl get all -n argocd`;

const FAQ_ITEMS = [
  {
    q: "What happens when I run kubectl apply -f deployment.yaml?",
    a: "kubectl sends the YAML manifest to the Kubernetes API server. The API server validates it and stores the desired state in etcd. The Deployment controller sees a new desired state and creates or updates the Pods. The scheduler assigns new Pods to nodes. The kubelet on each node pulls the Docker image and starts the container. This entire process typically completes in seconds.",
  },
  {
    q: "If I delete a Pod manually, does it come back?",
    a: "Yes — as long as a Deployment is managing it. The Deployment controller continuously watches the cluster. When you delete a Pod, the controller immediately detects the desired count (e.g., 2 replicas) no longer matches the actual count (1 pod). It creates a new Pod to restore the desired state. This is self-healing in action.",
  },
  {
    q: "What is a rolling update and how does Kubernetes achieve zero downtime?",
    a: (
      <>
        <p>When you update the image tag in a Deployment, Kubernetes performs a rolling update by default:</p>
        <ul>
          <li>Start one new Pod with the new image</li>
          <li>Wait for the readiness probe to return healthy</li>
          <li>Only then terminate one old Pod</li>
          <li>Repeat until all old Pods are replaced</li>
        </ul>
        <p>At no point are all Pods down simultaneously — traffic always routes to healthy Pods.</p>
      </>
    ),
  },
  {
    q: "What does kubectl describe do and when should I use it?",
    a: "kubectl describe gives you detailed information about a resource — including events, which are Kubernetes' log of what happened to that resource. When a Pod fails to start, describe pod shows you why: ImagePullBackOff (wrong image name/tag), CrashLoopBackOff (app crashes on startup), OOMKilled (ran out of memory), Pending (no node has enough resources). Always start troubleshooting with kubectl describe and kubectl logs.",
  },
];

export default function Kubernetes3() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Kubernetes · Page 3 of 3</span>
        <h1 className="slide-title">
          Working with <span style={{ color: "#326ce5" }}>kubectl</span>
        </h1>
        <p className="slide-subtitle">
          kubectl is your command-line interface to Kubernetes. Master these commands and you can
          inspect, troubleshoot, and manage any cluster confidently.
        </p>
      </div>

      {/* kubectl reference */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          Essential kubectl Commands
        </div>
        <CodeBlock lang="bash" filename="terminal" code={KUBECTL_COMMANDS} />
      </div>

      {/* Troubleshooting */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title"><span style={{ fontSize: "20px" }}>🔍</span> Troubleshooting Pod Issues</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>What it means</th>
              <th>How to fix</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Pending",            "Pod created but not scheduled to a node yet",            "Check kubectl describe pod — not enough CPU/memory on any node?"],
              ["ImagePullBackOff",   "Cannot pull the container image from the registry",       "Wrong image name/tag, missing imagePullSecret, registry auth failed"],
              ["CrashLoopBackOff",   "Container starts but keeps crashing immediately",         "kubectl logs <pod> — app throws exception on startup, check app config"],
              ["OOMKilled",          "Container exceeded its memory limit",                     "Increase memory limit, or fix a memory leak in the application"],
              ["Running 0/1",        "Container is running but not passing readiness probe",    "Health endpoint not reachable, app still initialising, wrong probe path"],
              ["Terminating",        "Pod is shutting down",                                    "Usually normal during rolling updates, stuck = kubectl delete pod --force"],
            ].map(([status, meaning, fix]) => (
              <tr key={status}>
                <td><code style={{ fontSize: "10.5px", color: "var(--accent3)" }}>{status}</code></td>
                <td style={{ fontSize: "12px" }}>{meaning}</td>
                <td style={{ fontSize: "11.5px", color: "var(--muted)" }}>{fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            Namespace Structure
          </div>
          <CodeBlock lang="bash" filename="terminal" code={NAMESPACE_STRUCTURE} />
        </div>

        <div>
          <div className="card" style={{ height: "100%" }}>
            <div className="card-title"><span style={{ fontSize: "20px" }}>📋</span> Rolling Update Flow</div>
            <div className="card-body">
              <div className="step-list">
                {[
                  ["Image tag updated in deployment.yaml", "ArgoCD or kubectl apply triggers the change"],
                  ["Kubernetes starts 1 new Pod", "Pulls the new image, starts the container"],
                  ["Readiness probe passes", "New Pod is healthy and ready to serve traffic"],
                  ["1 old Pod terminated", "Traffic shifts to the new Pod"],
                  ["Repeat for each replica", "Continue until all Pods are on the new version"],
                ].map(([title, desc], i) => (
                  <div className="step-item" key={i}>
                    <div className="step-num">{i + 1}</div>
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
      </div>

      {/* Quick reference */}
      <div className="card">
        <div className="card-title"><span style={{ fontSize: "20px" }}>⚡</span> kubectl Quick Reference</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.5rem", marginTop: "0.5rem" }}>
          {[
            { cmd: "kubectl get pods -n <ns>",          desc: "List all pods in a namespace" },
            { cmd: "kubectl describe pod <name>",       desc: "Detailed info + events for a pod" },
            { cmd: "kubectl logs <pod> -f",             desc: "Stream live logs from a pod" },
            { cmd: "kubectl apply -f file.yaml",        desc: "Create or update a resource" },
            { cmd: "kubectl delete -f file.yaml",       desc: "Delete resources from a manifest" },
            { cmd: "kubectl rollout undo deploy/<name>",desc: "Roll back to the previous version" },
            { cmd: "kubectl exec -it <pod> -- sh",      desc: "Open a shell inside a container" },
            { cmd: "kubectl port-forward svc/<svc> 8080:80", desc: "Forward a local port to a service" },
          ].map(({ cmd, desc }) => (
            <div key={cmd} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.65rem 0.9rem" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)", marginBottom: "0.25rem" }}>{cmd}</div>
              <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
