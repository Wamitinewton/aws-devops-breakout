import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

const ARGOCD_INSTALL = `# Install ArgoCD into its own namespace on k3s / Kubernetes
kubectl create namespace argocd

kubectl apply -n argocd \\
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for all pods to be ready
kubectl wait --for=condition=Ready pod --all -n argocd --timeout=120s

# Get the initial admin password
kubectl get secret argocd-initial-admin-secret -n argocd \\
  -o jsonpath="{.data.password}" | base64 --decode && echo

# Expose the ArgoCD UI (NodePort — change 30443 to your preferred port)
kubectl patch svc argocd-server -n argocd \\
  -p '{"spec": {"type": "NodePort", "ports": [{"port": 443, "nodePort": 30443}]}}'

# Access at: https://YOUR-SERVER-IP:30443
# Login: admin / <password from above>`;

const ARGOCD_APP_YAML = `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hello-devops
  namespace: argocd        # ArgoCD lives in the argocd namespace
spec:
  project: default

  source:
    repoURL: https://github.com/your-org/hello-devops-infra
    targetRevision: main   # Watch the main branch
    path: k8s              # Path inside the repo containing manifests

  destination:
    server: https://kubernetes.default.svc
    namespace: production  # Deploy into the production namespace

  syncPolicy:
    automated:
      prune: true      # Delete resources removed from Git
      selfHeal: true   # Correct any manual changes to the cluster
    syncOptions:
      - CreateNamespace=true   # Create 'production' ns if it doesn't exist
      - ApplyOutOfSyncOnly=true`;

const ARGOCD_CLI = `# Login to ArgoCD via CLI
argocd login YOUR-SERVER-IP:30443 --username admin --password <password>

# Create an application
argocd app create hello-devops \\
  --repo https://github.com/your-org/hello-devops-infra \\
  --path k8s \\
  --dest-server https://kubernetes.default.svc \\
  --dest-namespace production \\
  --sync-policy automated

# View application status
argocd app get hello-devops

# Trigger a manual sync
argocd app sync hello-devops

# Watch sync progress
argocd app wait hello-devops --health

# List all apps
argocd app list

# Roll back to a previous sync
argocd app history hello-devops
argocd app rollback hello-devops <revision-id>`;

const FAQ_ITEMS = [
  {
    q: "What does prune: true do in the sync policy?",
    a: "When prune is enabled, ArgoCD deletes Kubernetes resources that exist in the cluster but no longer have a corresponding manifest in Git. For example, if you delete service.yaml from your infra repo, ArgoCD will delete the Service from the cluster. Without prune, deleted manifests leave orphaned resources in Kubernetes forever.",
  },
  {
    q: "What does selfHeal: true do and why is it important?",
    a: "selfHeal makes ArgoCD continuously watch the live cluster state. If someone manually runs kubectl scale or kubectl delete on a resource that ArgoCD manages, selfHeal detects the drift and immediately re-applies the Git state. This enforces Git as the single source of truth and prevents ad-hoc manual changes from persisting in production.",
  },
  {
    q: "How do I connect ArgoCD to a private GitHub repository?",
    a: (
      <>
        <p>ArgoCD needs credentials to clone private repos. Two options:</p>
        <ul>
          <li><strong>HTTPS with PAT:</strong> Settings → Repositories → Connect Repo → HTTPS. Enter repo URL and a GitHub PAT with repo read scope.</li>
          <li><strong>SSH:</strong> Generate an SSH key pair, add the public key as a Deploy Key in GitHub repository settings, and add the private key in ArgoCD → Settings → Repositories → SSH.</li>
        </ul>
        <p>You can also use the CLI: <code>argocd repo add https://github.com/your-org/infra --username x --password YOUR_PAT</code></p>
      </>
    ),
  },
  {
    q: "Can ArgoCD manage multiple applications and multiple clusters?",
    a: "Yes — this is one of ArgoCD's strengths. You can have many Application resources in ArgoCD, each pointing to a different Git repo path and a different Kubernetes cluster (or namespace). ArgoCD gives you a single pane of glass across all applications and all clusters. You add target clusters with argocd cluster add <context-name>.",
  },
];

export default function ArgoCD2() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">ArgoCD · Page 2 of 2</span>
        <h1 className="slide-title">
          Configuring <span style={{ color: "#ef7b4d" }}>ArgoCD</span>
        </h1>
        <p className="slide-subtitle">
          Install ArgoCD on your cluster, define an Application manifest, and enable
          fully automated GitOps delivery with drift correction.
        </p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            Install ArgoCD on k3s
          </div>
          <CodeBlock lang="bash" filename="terminal" code={ARGOCD_INSTALL} />
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            ArgoCD Application Manifest
          </div>
          <CodeBlock lang="yaml" filename="argocd-app.yaml" code={ARGOCD_APP_YAML} />
        </div>
      </div>

      {/* Application spec fields */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title"><span style={{ fontSize: "20px" }}>📋</span> Application Manifest Explained</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>What it means</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["spec.source.repoURL",          "URL of the Git repository containing your Kubernetes manifests (your infra repo)"],
              ["spec.source.targetRevision",   "Branch or tag to watch. main, HEAD, or a specific tag like v1.2.0"],
              ["spec.source.path",             "Directory inside the repo where your manifests live. k8s/, helm/, kustomize/, etc."],
              ["spec.destination.server",      "The Kubernetes API server URL. https://kubernetes.default.svc means the same cluster"],
              ["spec.destination.namespace",   "The Kubernetes namespace to deploy resources into"],
              ["syncPolicy.automated",         "Enables automatic sync on Git changes. Without this, you must manually click Sync in the UI"],
              ["syncPolicy.automated.prune",   "Delete cluster resources that no longer exist in Git"],
              ["syncPolicy.automated.selfHeal","Revert any manual changes to the cluster back to the Git state"],
              ["syncOptions.CreateNamespace",  "ArgoCD creates the destination namespace if it does not exist yet"],
            ].map(([field, desc]) => (
              <tr key={field}>
                <td><code style={{ fontSize: "10.5px" }}>{field}</code></td>
                <td style={{ fontSize: "12px" }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CLI reference */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          ArgoCD CLI Reference
        </div>
        <CodeBlock lang="bash" filename="terminal" code={ARGOCD_CLI} />
      </div>

      {/* GitOps infra repo structure */}
      <div className="card">
        <div className="card-title"><span style={{ fontSize: "20px" }}>📁</span> GitOps Infra Repository Structure</div>
        <div className="two-col">
          <div className="arch-box">{`hello-devops-infra/
├── k8s/
│   ├── namespace.yaml       # production namespace
│   ├── deployment.yaml      # ← Jenkins updates image tag here
│   ├── service.yaml         # NodePort service
│   └── configmap.yaml       # App configuration
├── argocd/
│   └── application.yaml     # ArgoCD Application manifest
└── README.md`}</div>
          <div className="card-body">
            <div className="step-list">
              {[
                ["k8s/", "All Kubernetes manifests. ArgoCD watches this directory and applies every .yaml file to the cluster."],
                ["deployment.yaml", "The most important file. Jenkins updates the image tag here on every build. ArgoCD detects the change and rolls out the new version."],
                ["argocd/", "The ArgoCD Application manifest. Apply once: kubectl apply -f argocd/application.yaml"],
                ["Separate from app code", "This repo is separate from your Spring Boot source code repo. Clean separation of concerns: app code vs infrastructure."],
              ].map(([title, desc]) => (
                <div className="step-item" key={title}>
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

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
