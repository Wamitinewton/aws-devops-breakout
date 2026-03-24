import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

const JENKINSFILE = `pipeline {
    agent any

    environment {
        // Image name on GHCR — replace with your org
        IMAGE_NAME = "ghcr.io/your-org/hello-devops"
        // GitHub infra repo — where Kubernetes manifests live
        INFRA_REPO = "https://github.com/your-org/hello-devops-infra.git"
        GITHUB_USER = "your-username"
    }

    stages {

        stage('Checkout') {
            steps {
                // Clone the source repo (Jenkins does this automatically
                // for pipeline jobs linked to a GitHub repo)
                checkout scm
            }
        }

        stage('Build JAR') {
            steps {
                sh 'mvn clean package -DskipTests'
                // Archive the artifact so it appears in Jenkins UI
                archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
            }
        }

        stage('Run Tests') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    // Publish JUnit test results in Jenkins UI
                    junit 'target/surefire-reports/*.xml'
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                withCredentials([string(credentialsId: 'ghcr-token',
                                        variable: 'GHCR_TOKEN')]) {
                    sh """
                        echo \\$GHCR_TOKEN | \\
                          docker login ghcr.io -u \${GITHUB_USER} --password-stdin

                        docker build \\
                          -t \${IMAGE_NAME}:\${BUILD_NUMBER} \\
                          -t \${IMAGE_NAME}:latest \\
                          .

                        docker push \${IMAGE_NAME}:\${BUILD_NUMBER}
                        docker push \${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Update GitOps Repo') {
            steps {
                withCredentials([string(credentialsId: 'github-token',
                                        variable: 'GH_TOKEN')]) {
                    sh """
                        # Clone the infrastructure repository
                        git clone https://\\$GH_TOKEN@github.com/your-org/hello-devops-infra.git

                        cd hello-devops-infra

                        # Update the image tag in the Kubernetes deployment manifest
                        sed -i "s|image: \${IMAGE_NAME}:.*|image: \${IMAGE_NAME}:\${BUILD_NUMBER}|" \\
                              k8s/deployment.yaml

                        git config user.email "jenkins@devops.local"
                        git config user.name "Jenkins CI"
                        git add k8s/deployment.yaml
                        git commit -m "ci: bump hello-devops to build #\${BUILD_NUMBER}"
                        git push
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Build \${BUILD_NUMBER} succeeded — ArgoCD will sync shortly."
        }
        failure {
            echo "Build \${BUILD_NUMBER} failed. Check the logs above."
        }
        always {
            // Clean workspace to avoid stale files on next build
            cleanWs()
        }
    }
}`;

const FAQ_ITEMS = [
  {
    q: "What is the post block in a Jenkinsfile for?",
    a: (
      <>
        <p>The <code>post</code> block runs steps after the pipeline (or a stage) completes, regardless of the result. Common conditions:</p>
        <ul>
          <li><strong>always</strong> — runs every time (e.g., clean workspace, publish reports)</li>
          <li><strong>success</strong> — only when the build passes (e.g., send Slack notification)</li>
          <li><strong>failure</strong> — only when the build fails (e.g., alert the team)</li>
          <li><strong>unstable</strong> — passed but with test failures</li>
        </ul>
      </>
    ),
  },
  {
    q: "Why do we use BUILD_NUMBER to tag the Docker image?",
    a: "BUILD_NUMBER is an auto-incrementing integer Jenkins assigns to each build (1, 2, 3, ...). Using it as an image tag gives you an immutable, traceable artifact. If a bad version is deployed, you know exactly which build number to roll back to. The :latest tag is also pushed for convenience but should never be used in Kubernetes deployments — always use the specific build number.",
  },
  {
    q: "Why does the pipeline update the infra repo instead of deploying directly with kubectl?",
    a: "This is the core of GitOps: the desired state lives in Git, not in Jenkins scripts. Jenkins updates the manifest (deployment.yaml) and pushes to the infra repo. ArgoCD then detects the change and applies it to Kubernetes. This means: (1) every deployment is a Git commit with a message and author, (2) you can roll back by reverting the commit, (3) ArgoCD continuously ensures the cluster matches Git — no drift.",
  },
  {
    q: "What is the difference between a Freestyle job and a Pipeline job in Jenkins?",
    a: "A Freestyle job is configured entirely through the Jenkins UI — point and click. Easy to start, but not version-controlled and hard to maintain. A Pipeline job is defined by a Jenkinsfile committed to your source code repository. This means your CI process is versioned, reviewed in pull requests, and reproducible. Always use Pipeline jobs in production.",
  },
];

export default function Jenkins2() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Jenkins · Page 2 of 2</span>
        <h1 className="slide-title">
          The <span style={{ color: "#d33833" }}>Jenkinsfile</span> — Pipeline as Code
        </h1>
        <p className="slide-subtitle">
          A Jenkinsfile is a Groovy script that lives in your repository and defines every step
          of your CI/CD pipeline. Treat it like any other code — review it, version it.
        </p>
      </div>

      {/* Pipeline anatomy */}
      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-title"><span style={{ fontSize: "20px" }}>🏛️</span> Declarative Pipeline Anatomy</div>
          <div className="card-body">
            <div className="step-list">
              {[
                ["pipeline { }", "The root block — wraps everything"],
                ["agent any", "Run on any available agent. Use agent { docker { image '...' } } for container agents"],
                ["environment { }", "Declare environment variables accessible in all stages"],
                ["stages { }", "Container for all stage blocks"],
                ["stage('Name') { }", "A named logical phase: Checkout, Build, Test, Deploy"],
                ["steps { }", "The actual commands to run inside a stage"],
                ["post { }", "Steps to run after the pipeline completes (success, failure, always)"],
              ].map(([title, desc]) => (
                <div className="step-item" key={title}>
                  <div className="step-content">
                    <div className="step-title"><code style={{ fontSize: "11px" }}>{title}</code></div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><span style={{ fontSize: "20px" }}>🔑</span> Useful Built-in Variables</div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["BUILD_NUMBER", "Auto-incrementing build ID (1, 2, 3...)"],
                  ["BUILD_ID",     "Same as BUILD_NUMBER"],
                  ["JOB_NAME",     "Name of the pipeline job"],
                  ["WORKSPACE",    "Absolute path to the build workspace"],
                  ["GIT_COMMIT",   "Full SHA of the current commit"],
                  ["GIT_BRANCH",   "Branch that triggered the build"],
                  ["JENKINS_URL",  "Base URL of the Jenkins server"],
                ].map(([v, d]) => (
                  <tr key={v}>
                    <td><code style={{ fontSize: "10.5px" }}>{v}</code></td>
                    <td style={{ fontSize: "11.5px" }}>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full Jenkinsfile */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          Complete Jenkinsfile — Hello DevOps Pipeline
        </div>
        <CodeBlock lang="jenkinsfile" filename="Jenkinsfile" code={JENKINSFILE} />
      </div>

      {/* Webhook setup */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title"><span style={{ fontSize: "20px" }}>🔔</span> GitHub Webhook Setup</div>
        <div className="step-list">
          {[
            ["GitHub → Repo → Settings → Webhooks", "Navigate to your source code repository's settings"],
            ["Add webhook", "Payload URL: http://YOUR-SERVER:8080/github-webhook/ · Content type: application/json"],
            ["Select trigger", "Choose 'Just the push event' to trigger on every git push"],
            ["Jenkins job configuration", "In the Jenkins pipeline job → Build Triggers → tick 'GitHub hook trigger for GITScm polling'"],
            ["Test the webhook", "Push a commit — GitHub should show a green tick next to the webhook and Jenkins should start a build"],
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

      <div className="highlight-box success">
        <span className="icon">✅</span>
        <div>
          Once the pipeline is set up: every <code>git push</code> triggers Jenkins → Maven build →
          Docker image built and pushed to GHCR → <code>deployment.yaml</code> updated in the infra
          repo → ArgoCD picks up the change and deploys to Kubernetes. Fully automated.
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
