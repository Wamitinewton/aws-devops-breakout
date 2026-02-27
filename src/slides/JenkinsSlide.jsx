import QuestionBox from "../components/QuestionBox";

export default function JenkinsSlide() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 03</span>
        <h2 className="slide-title">🔧 Jenkins</h2>
        <p className="slide-subtitle">
          The CI engine — triggered by a git push, produces a versioned Docker image and updates the GitOps repo.
        </p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              color: "#fff",
              fontSize: "15px",
              marginBottom: "1rem",
            }}
          >
            How Jenkins Runs
          </div>

          <div className="card" style={{ marginBottom: "1rem" }}>
            <div className="card-body">
              <p>
                Jenkins runs as a{" "}
                <strong style={{ color: "#fff" }}>Docker container</strong> on
                the VPS — outside of Kubernetes. It mounts the Docker socket so
                it can build images natively.
              </p>

              <div
                className="code-block"
                style={{ marginTop: "0.75rem", fontSize: "11px" }}
              >
                docker run -d {"\n"}
                {"  "}--name jenkins {"\n"}
                {"  "}-p 8080:8080 {"\n"}
                {"  "}-v /var/run/docker.sock:/var/run/docker.sock {"\n"}
                {"  "}-v jenkins_home:/var/jenkins_home {"\n"}
                {"  "}jenkins/jenkins:lts-jdk21
              </div>
            </div>
          </div>

          <div className="highlight-box warning">
            <span className="icon">🔑</span>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              Jenkins stores credentials: <code>GITHUB_TOKEN</code> (for GHCR
              push) and <code>GITOPS_PAT</code> (for updating the infra repo).
              These are stored in Jenkins credentials, not in code.
            </div>
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              color: "#fff",
              fontSize: "15px",
              marginBottom: "1rem",
            }}
          >
            Trigger Flow
          </div>

          <div className="step-list">
            {[
              {
                n: "1",
                title: "GitHub Webhook",
                desc:
                  "Dev pushes to main branch → GitHub sends a POST to Jenkins at :8080/github-webhook/",
              },
              {
                n: "2",
                title: "Jenkins picks up",
                desc:
                  "Jenkins finds the matching pipeline job and starts executing the Jenkinsfile",
              },
              {
                n: "3",
                title: "Build JAR",
                desc: "./mvnw package -DskipTests inside the checked-out repo",
              },
              {
                n: "4",
                title: "Build & push image",
                desc:
                  "docker build, tag with build number, push to ghcr.io/ari-bizmwitu/service:N",
              },
              {
                n: "5",
                title: "Update GitOps repo",
                desc:
                  "Jenkins clones bizmwitu-infra, replaces the image tag in deployment.yaml, commits + pushes",
              },
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
        </div>
      </div>

      <div
        style={{
          fontFamily: "var(--font-head)",
          fontWeight: 700,
          color: "#fff",
          fontSize: "15px",
          marginBottom: "0.75rem",
        }}
      >
        The Jenkinsfile (every service follows this pattern)
      </div>

      <div className="code-block">
        {`pipeline {
  agent any

  environment {
    SERVICE_NAME = 'hello-works-service'
    SERVICE_PORT = '8090'
    IMAGE = "ghcr.io/ari-bizmwitu/\${SERVICE_NAME}"
    GITOPS_REPO = 'https://github.com/ari-bizmwitu/bizmwitu-infra.git'
  }

  stages {

    stage('Build JAR') {
      steps {
        sh './mvnw package -DskipTests'
      }
    }

    stage('Build & Push Image') {
      steps {
        sh "docker build -t \${IMAGE}:\${BUILD_NUMBER} ."
        sh "docker push \${IMAGE}:\${BUILD_NUMBER}"
      }
    }

    stage('Update GitOps') {
      steps {
        sh """
          git clone \${GITOPS_REPO} infra
          cd infra
          sed -i 's|\${IMAGE}:.*|\${IMAGE}:\${BUILD_NUMBER}|' apps/\${SERVICE_NAME}/deployment.yaml
          git commit -am "ci: bump \${SERVICE_NAME} to build \${BUILD_NUMBER}"
          git push
        """
      }
    }

  }
}`}
      </div>

      <QuestionBox
        question="After Jenkins pushes a new image tag to GHCR and updates deployment.yaml in the GitOps repo — what happens next, and who does it?"
        answer="ArgoCD happens next. ArgoCD continuously polls (or receives a webhook from) the GitOps repo. It detects that deployment.yaml now references image tag :15 but the cluster is still running :14. ArgoCD treats this as drift from desired state, and automatically applies the updated deployment to Kubernetes. Kubernetes then performs a rolling update — starts the new pod, waits for it to be healthy, then terminates the old one."
      />
    </div>
  );
}