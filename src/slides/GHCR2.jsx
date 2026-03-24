import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

const CREATE_PAT = `# Steps to create a GitHub Personal Access Token (PAT)
# 1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# 2. Generate new token → Add a note: "GHCR Jenkins"
# 3. Expiration: 90 days (rotate regularly in production)
# 4. Scopes to select:
#    ✅ write:packages   — Push images to GHCR
#    ✅ read:packages    — Pull images from GHCR
#    ✅ delete:packages  — Clean up old versions (optional)
#    ✅ repo             — Needed for private repositories
# 5. Copy the token — you will NOT see it again!

# Store it in Jenkins Credentials:
# Manage Jenkins → Credentials → Global → Add Credential
# Kind: Secret text | ID: ghcr-token | Secret: <paste token>`;

const DOCKER_LOGIN_PUSH = `# Authenticate with GHCR using your PAT
echo $GHCR_TOKEN | docker login ghcr.io -u your-username --password-stdin

# Build the image with GHCR image name
docker build -t ghcr.io/your-org/hello-devops:42 .

# Also tag as latest
docker tag ghcr.io/your-org/hello-devops:42 ghcr.io/your-org/hello-devops:latest

# Push both tags
docker push ghcr.io/your-org/hello-devops:42
docker push ghcr.io/your-org/hello-devops:latest

# Pull the image (on any machine with access)
docker pull ghcr.io/your-org/hello-devops:42

# List all tags for an image (using GitHub API)
# curl -H "Authorization: Bearer $GHCR_TOKEN" \\
#   https://ghcr.io/v2/your-org/hello-devops/tags/list`;

const K8S_IMAGE_PULL_SECRET = `# Create a Kubernetes Secret for GHCR credentials
# This allows Kubernetes nodes to pull private images

kubectl create secret docker-registry ghcr-credentials \\
  --namespace production \\
  --docker-server=ghcr.io \\
  --docker-username=your-username \\
  --docker-password=YOUR_PAT_TOKEN

---
# Reference it in your Deployment spec:
spec:
  template:
    spec:
      imagePullSecrets:
        - name: ghcr-credentials  # References the secret above
      containers:
        - name: hello-devops
          image: ghcr.io/your-org/hello-devops:42`;

const JENKINSFILE_GHCR = `stage('Docker Build & Push') {
    steps {
        withCredentials([string(credentialsId: 'ghcr-token',
                                variable: 'GHCR_TOKEN')]) {
            sh """
                # Login — password from stdin (never in logs)
                echo \\$GHCR_TOKEN | \\
                  docker login ghcr.io -u your-username --password-stdin

                # Build with both build-number and latest tags
                docker build \\
                  -t ghcr.io/your-org/hello-devops:\${BUILD_NUMBER} \\
                  -t ghcr.io/your-org/hello-devops:latest \\
                  .

                # Push both tags
                docker push ghcr.io/your-org/hello-devops:\${BUILD_NUMBER}
                docker push ghcr.io/your-org/hello-devops:latest

                # Clean up local image to save disk space
                docker rmi ghcr.io/your-org/hello-devops:\${BUILD_NUMBER}
                docker rmi ghcr.io/your-org/hello-devops:latest
            """
        }
    }
}`;

const FAQ_ITEMS = [
  {
    q: "Why do we use --password-stdin instead of -p $TOKEN in docker login?",
    a: "Using -p $TOKEN on the command line would expose the token in the process list (visible with ps aux on the server) and in Jenkins build logs. --password-stdin reads the password from standard input, which is not logged. This is the correct, secure way to pass secrets to docker login.",
  },
  {
    q: "How do I make a GHCR image public so the Kubernetes cluster doesn't need credentials?",
    a: "In GitHub, go to your profile or org → Packages → select the package → Package Settings → Change visibility → Public. Once public, any machine can docker pull it without authenticating. This is convenient for development but exposes your image publicly — use private packages for production.",
  },
  {
    q: "How should I handle PAT expiration in production?",
    a: "PATs should be rotated regularly (every 30-90 days). The process: generate a new PAT in GitHub with the same scopes, update the Jenkins Credential (same ID — ghcr-token), update the Kubernetes imagePullSecret if you have one, and delete the old PAT. For production systems, consider GitHub Apps or service accounts instead of PATs for better security and no expiry management.",
  },
  {
    q: "What is the recommended image tagging strategy?",
    a: (
      <>
        <ul>
          <li><strong>Build number tag</strong> (<code>:42</code>) — use in Kubernetes manifests. Immutable, traceable to the exact Jenkins build.</li>
          <li><strong>:latest</strong> — push for convenience (local testing), never use in Kubernetes deployments. :latest is mutable and breaks reproducibility.</li>
          <li><strong>Git commit SHA tag</strong> (<code>:abc1234</code>) — even more precise than build number. Ties the image directly to the source commit.</li>
          <li><strong>Semantic version tag</strong> (<code>:v1.2.3</code>) — for library/open-source images. Use alongside the build number for traceability.</li>
        </ul>
      </>
    ),
  },
];

export default function GHCR2() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">GHCR · Page 2 of 2</span>
        <h1 className="slide-title">
          Using <span style={{ color: "#a78bfa" }}>GHCR</span> in Practice
        </h1>
        <p className="slide-subtitle">
          Set up a Personal Access Token, authenticate Docker and Jenkins, push images,
          and configure Kubernetes to pull from your private registry.
        </p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            Create a GitHub PAT
          </div>
          <CodeBlock lang="bash" filename="GitHub PAT Setup" code={CREATE_PAT} />
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            Login, Build & Push
          </div>
          <CodeBlock lang="bash" filename="terminal" code={DOCKER_LOGIN_PUSH} />
        </div>
      </div>

      {/* Jenkinsfile stage */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          Jenkinsfile — Docker Build & Push Stage
        </div>
        <CodeBlock lang="jenkinsfile" filename="Jenkinsfile (excerpt)" code={JENKINSFILE_GHCR} />
      </div>

      {/* Kubernetes pull secret */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          Kubernetes imagePullSecret — Private GHCR
        </div>
        <CodeBlock lang="yaml" filename="k8s/deployment.yaml (with pull secret)" code={K8S_IMAGE_PULL_SECRET} />
      </div>

      {/* Complete flow */}
      <div className="card">
        <div className="card-title"><span style={{ fontSize: "20px" }}>🔄</span> Complete GHCR Flow in the Pipeline</div>
        <div className="step-list">
          {[
            ["Developer pushes code",             "git push triggers GitHub webhook → Jenkins starts build"],
            ["Jenkins builds JAR",                "mvn clean package produces target/hello-devops.jar"],
            ["Jenkins builds Docker image",        "docker build reads Dockerfile, creates image with layered filesystem"],
            ["Jenkins pushes to GHCR",            "docker push uploads layers to ghcr.io/your-org/hello-devops:BUILD_NUMBER"],
            ["Image appears in GitHub Packages",  "Visible under your org at github.com/orgs/your-org/packages"],
            ["Jenkins updates deployment.yaml",   "Replaces image tag in infra repo with the new build number"],
            ["ArgoCD detects the Git change",     "ArgoCD polls or receives webhook — detects OutOfSync state"],
            ["Kubernetes pulls from GHCR",        "Each node pulls ghcr.io/your-org/hello-devops:BUILD_NUMBER using imagePullSecrets"],
            ["Rolling update completes",          "New pods pass health checks, old pods terminated — zero downtime"],
          ].map(([title, desc], i) => (
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

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
