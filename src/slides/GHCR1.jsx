import { FiLink, FiKey, FiGlobe, FiTag, FiClipboard, FiTrash2, FiPackage } from "react-icons/fi";
import FAQ from "../components/FAQ";

const FAQ_ITEMS = [
  {
    q: "What is a container registry and why can't I just copy images between machines?",
    a: "A container image can be hundreds of megabytes. A container registry is a centralised server that stores, versions, and distributes images efficiently. It stores images in layers — layers already on the target machine are not re-downloaded. This makes pulling images from a registry much faster and more reliable than copying files manually. It also enables every server in your cluster to pull the exact same image.",
  },
  {
    q: "Can my Kubernetes cluster pull from a private GHCR repository?",
    a: "Yes, but you need to create a Kubernetes Secret of type docker-registry containing your GHCR credentials, then reference it in your Deployment with imagePullSecrets. The cluster then uses this secret to authenticate with GHCR when pulling images. We cover this on the next page.",
  },
  {
    q: "What is an image tag and what is a digest?",
    a: (
      <>
        <p><strong>Tag</strong> — A human-readable label like <code>latest</code>, <code>v1.0</code>, or <code>42</code> (build number). Tags are mutable — the same tag can be overwritten by a new image.</p>
        <p><strong>Digest</strong> — A SHA256 hash of the image content, e.g. <code>sha256:abc123...</code>. Digests are immutable — they uniquely identify an exact image. For reproducible, auditable deployments, always use a specific build tag (not <code>:latest</code>) or the digest.</p>
      </>
    ),
  },
];

const FEATURES = [
  {
    icon: FiLink,
    title: "GitHub Integration",
    desc: "Images appear as 'Packages' on your GitHub profile or organisation. You can link an image package to a repository for automatic visibility settings.",
  },
  {
    icon: FiKey,
    title: "PAT Authentication",
    desc: "The same Personal Access Token (PAT) you use for GitHub API authenticates with GHCR. Create one PAT with read:packages + write:packages scope for all GHCR operations.",
  },
  {
    icon: FiGlobe,
    title: "Public & Private",
    desc: "Images can be public (anyone can pull, no auth needed) or private (require authentication). Public repos automatically get free unlimited private GHCR packages.",
  },
  {
    icon: FiTag,
    title: "Image Tags",
    desc: "Tag images with the Jenkins BUILD_NUMBER for traceability. Example: ghcr.io/your-org/app:42. Also push :latest for convenience but never use it in Kubernetes manifests.",
  },
  {
    icon: FiClipboard,
    title: "Audit & Visibility",
    desc: "GitHub shows every package version, when it was pushed, and which workflows pushed it. You can see the full history of every Docker image ever built.",
  },
  {
    icon: FiTrash2,
    title: "Retention Policy",
    desc: "Configure deletion policies to automatically clean up old image versions. Keep the last N versions to avoid storage bloat over time.",
  },
];

export default function GHCR1() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">GHCR · Page 1 of 2</span>
        <h1 className="slide-title">
          GitHub Container <span style={{ color: "#a78bfa" }}>Registry</span>
        </h1>
        <p className="slide-subtitle">
          A container registry stores and distributes your Docker images. GHCR integrates
          directly with GitHub — your code, CI, and images all in one place.
        </p>
      </div>

      <div className="highlight-box info" style={{ marginBottom: "1.5rem" }}>
        <span className="icon"><FiPackage size={18} /></span>
        <div>
          <strong>Think of a container registry as npm for Docker images.</strong> Just like npm
          stores JavaScript packages that anyone can install with <code>npm install</code>, a
          registry stores Docker images that anyone (with access) can pull with{" "}
          <code>docker pull</code>. Every image has a name, a tag (version), and is stored in layers.
        </div>
      </div>

      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div className="card" key={title}>
            <div className="card-title"><Icon size={17} /> {title}</div>
            <div className="card-body">{desc}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title"><FiTag size={17} /> GHCR Image Naming Convention</div>
        <div className="card-body">
          <div style={{ background: "#070a10", borderRadius: "8px", padding: "1rem 1.5rem", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "13px", marginBottom: "1rem" }}>
            <span style={{ color: "var(--vscode-builtin)" }}>ghcr.io</span>
            <span style={{ color: "var(--muted)" }}>/</span>
            <span style={{ color: "var(--vscode-value)" }}>your-org-or-username</span>
            <span style={{ color: "var(--muted)" }}>/</span>
            <span style={{ color: "var(--vscode-key)" }}>app-name</span>
            <span style={{ color: "var(--muted)" }}>:</span>
            <span style={{ color: "var(--vscode-number)" }}>42</span>
          </div>
          <div className="three-col-responsive">
            {[
              { part: "ghcr.io", desc: "The registry host — always ghcr.io for GitHub Container Registry" },
              { part: "your-org-or-username", desc: "Your GitHub username or organisation name (lowercase)" },
              { part: "app-name", desc: "The image name — usually matches your repository name" },
              { part: ":42", desc: "The tag — use the Jenkins BUILD_NUMBER for traceability" },
              { part: ":latest", desc: "Convenience tag — always points to the most recent build (mutable)" },
              { part: "no tag = :latest", desc: "Omitting a tag defaults to :latest — always be explicit in Kubernetes" },
            ].map(({ part, desc }) => (
              <div key={part} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.65rem" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)", marginBottom: "0.25rem" }}>{part}</div>
                <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
