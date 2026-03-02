import QuestionBox from "../components/QuestionBox";
import CodeBlock from "../components/CodeBlock";

const JenkinsLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M11.9 1a11 11 0 100 22A11 11 0 0011.9 1zm0 1.8a9.2 9.2 0 110 18.4A9.2 9.2 0 0111.9 2.8z" fill="#D33833"/>
    <path d="M11.9 5.5c-.8 0-1.5.3-2 .8-.6.5-.9 1.2-.9 2 0 .5.1 1 .4 1.4L8 11.5l1.5.3.8-1.2c.5.3 1 .4 1.6.4.8 0 1.5-.3 2-.8.6-.5.9-1.2.9-2s-.3-1.5-.9-2c-.5-.5-1.2-.8-2-.8zm0 1.5c.4 0 .8.1 1.1.4.3.3.4.7.4 1.1 0 .4-.1.8-.4 1.1-.3.3-.7.4-1.1.4-.4 0-.8-.1-1.1-.4-.3-.3-.4-.7-.4-1.1 0-.4.1-.8.4-1.1.3-.3.7-.4 1.1-.4zm-3 7.5l-.5 3h7l-.5-3H8.9z" fill="#D33833"/>
  </svg>
);

const jenkinsfile = `pipeline {
  agent any

  environment {
    SERVICE_NAME = "hello-works-service"
    SERVICE_PORT = "8090"
    IMAGE        = "ghcr.io/ari-bizmwitu/\${SERVICE_NAME}"
    GITOPS_REPO  = "https://github.com/ari-bizmwitu/bizmwitu-infra.git"
  }

  stages {

    stage("Build JAR") {
      steps {
        sh "./mvnw package -DskipTests"
      }
    }

    stage("Login to GHCR") {
      steps {
        withCredentials([string(credentialsId: "GITHUB_TOKEN", variable: "TOKEN")]) {
          sh "echo $TOKEN | docker login ghcr.io -u ari-bizmwitu --password-stdin"
        }
      }
    }

    stage("Build and Push Image") {
      steps {
        sh "docker build -t \${IMAGE}:\${BUILD_NUMBER} ."
        sh "docker push \${IMAGE}:\${BUILD_NUMBER}"
      }
    }

    stage("Update GitOps Repo") {
      steps {
        withCredentials([string(credentialsId: "GITOPS_PAT", variable: "PAT")]) {
          sh """
            git clone https://\${PAT}@github.com/ari-bizmwitu/bizmwitu-infra.git infra
            cd infra
            sed -i "s|\${IMAGE}:.*|\${IMAGE}:\${BUILD_NUMBER}|" apps/\${SERVICE_NAME}/deployment.yaml
            git config user.email "jenkins@bizmwitu.com"
            git config user.name "Jenkins"
            git commit -am "ci: bump \${SERVICE_NAME} to build \${BUILD_NUMBER}"
            git push
          """
        }
      }
    }

  }
}`;

export default function JenkinsSlide() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 03</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <JenkinsLogo />
          <h2 className="slide-title">Jenkins</h2>
        </div>
        <p className="slide-subtitle">
          The CI engine — triggered by a git push, it builds a versioned Docker image and updates the GitOps repository.
        </p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>
            What Jenkins Does
          </div>
          <div className="card-body" style={{ marginBottom: "1rem", lineHeight: 1.8 }}>
            Jenkins is an open-source automation server that listens for code pushes, then executes a defined pipeline — compile, build image, push to registry, update the deployment config. It is the engine that turns a <code>git push</code> into a deployable, versioned artifact ready for the cluster.
          </div>

          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "1rem" }}>
            Pipeline Trigger Flow
          </div>

          <div className="step-list">
            {[
              {
                n: "1",
                title: "GitHub Webhook",
                desc: "A push to the main branch triggers GitHub to send a POST request to the Jenkins webhook endpoint.",
              },
              {
                n: "2",
                title: "Pipeline starts",
                desc: "Jenkins finds the matching job, checks out the repository, and begins executing the Jenkinsfile.",
              },
              {
                n: "3",
                title: "Build JAR",
                desc: "Runs ./mvnw package -DskipTests to produce the compiled Spring Boot JAR artifact.",
              },
              {
                n: "4",
                title: "Build & push image",
                desc: "Builds the Docker image, tags it with the BUILD_NUMBER, and pushes it to GHCR.",
              },
              {
                n: "5",
                title: "Update GitOps repo",
                desc: "Clones the infra repo, replaces the image tag in deployment.yaml, then commits and pushes the change.",
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

        <div>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "0.75rem" }}>
            The Jenkinsfile
          </div>
          <CodeBlock code={jenkinsfile} lang="groovy" filename="Jenkinsfile" />
        </div>
      </div>

      <QuestionBox
        question="After Jenkins pushes a new image tag to GHCR and updates deployment.yaml in the GitOps repo — what happens next, and who does it?"
        answer="ArgoCD happens next. ArgoCD continuously polls the GitOps repo and detects that deployment.yaml now references image tag :15 but the cluster is still running :14. ArgoCD treats this as drift from desired state and automatically applies the updated deployment to Kubernetes. Kubernetes then performs a rolling update — starts the new pod, waits for it to be healthy, then terminates the old one."
      />
    </div>
  );
}