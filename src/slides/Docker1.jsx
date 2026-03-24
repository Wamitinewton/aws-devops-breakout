import { FiImage, FiBox, FiHardDrive, FiGlobe, FiSettings, FiAlertTriangle, FiMapPin } from "react-icons/fi";
import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

const FAQ_ITEMS = [
  {
    q: "What is the difference between a Docker image and a Docker container?",
    a: (
      <>
        <p>Think of an <strong>image</strong> as a blueprint or a class in programming — it is read-only and defines everything needed to run the application (OS layer, dependencies, your code).</p>
        <p>A <strong>container</strong> is a running instance of that image — it is like an object created from the class. You can run many containers from the same image simultaneously.</p>
      </>
    ),
  },
  {
    q: "Does Docker virtualise the operating system like a VM does?",
    a: "No. Docker containers share the host kernel — they do not have their own OS kernel. This makes containers much lighter and faster to start than VMs. A VM boots an entire OS (seconds to minutes); a container starts in milliseconds. The tradeoff is that containers are less isolated than VMs.",
  },
  {
    q: "What problem does Docker solve that just zipping up code doesn't?",
    a: (
      <>
        <p>A zip file contains only your code. Docker packages the entire runtime environment: OS libraries, language runtime (JDK/Node/Python), dependencies, and configuration. This eliminates the classic <strong>'it works on my machine'</strong> problem — the container behaves identically everywhere it runs.</p>
      </>
    ),
  },
  {
    q: "What is a Docker volume and when do you need one?",
    a: "Containers are ephemeral — when a container stops, any data written inside it is lost. A volume is a directory that lives outside the container's filesystem, on the host. Data written to a volume persists even after the container is deleted. Use volumes for databases, log files, or any data that must survive container restarts.",
  },
];

const CONCEPTS = [
  {
    icon: FiImage,
    title: "Docker Image",
    desc: "A read-only template that contains your application, its runtime, libraries, and configuration. Images are built in layers. Each instruction in a Dockerfile adds a layer. Images are stored in a registry (GHCR, Docker Hub).",
    badges: [["badge-blue", "Read-only"], ["badge-blue", "Layered"], ["badge-blue", "Stored in Registry"]],
  },
  {
    icon: FiBox,
    title: "Docker Container",
    desc: "A running instance of an image. You can start, stop, pause, and delete containers. Multiple containers can run from the same image simultaneously. Each container is isolated but shares the host OS kernel — making it lightweight.",
    badges: [["badge-green", "Runnable"], ["badge-green", "Isolated"], ["badge-green", "Ephemeral"]],
  },
  {
    icon: FiHardDrive,
    title: "Volume",
    desc: "Containers are stateless — data written inside them is lost when they stop. A volume is a persistent storage location on the host that survives container restarts and deletions. Essential for databases and logs.",
    badges: [["badge-amber", "Persistent"], ["badge-amber", "Shared"]],
  },
  {
    icon: FiGlobe,
    title: "Network",
    desc: "Docker creates virtual networks so containers can talk to each other safely. By default, containers are isolated from the host network. You expose ports explicitly (e.g. -p 8080:8080) to make a service reachable from outside.",
    badges: [["badge-purple", "Bridge"], ["badge-purple", "Host"], ["badge-purple", "None"]],
  },
];

export default function Docker1() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Docker · Page 1 of 3</span>
        <h1 className="slide-title">
          <span style={{ color: "#2496ed" }}>Docker</span> — Core Concepts
        </h1>
        <p className="slide-subtitle">
          Understand what Docker is, the problem it solves, and the key building blocks
          you will use every day.
        </p>
      </div>

      <div className="highlight-box warning" style={{ marginBottom: "1.5rem" }}>
        <span className="icon"><FiAlertTriangle size={17} /></span>
        <div>
          <strong>"It works on my machine!"</strong> — This is the classic DevOps problem. Your
          app runs perfectly locally but breaks in the CI server or production because the
          environment is slightly different: a different runtime version, a missing library, or a
          different OS. Docker eliminates this.
        </div>
      </div>

      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        {CONCEPTS.map(({ icon: Icon, title, desc, badges }) => (
          <div className="card" key={title}>
            <div className="card-title"><Icon size={18} /> {title}</div>
            <div className="card-body">
              {desc}
              <div className="pill-row">
                {badges.map(([cls, label]) => (
                  <span key={label} className={`badge ${cls}`}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title"><FiSettings size={17} /> Docker Architecture</div>
        <div className="two-col">
          <div className="card-body">
            <div className="step-list">
              {[
                ["Docker CLI", "The command-line tool you type into: docker build, docker run, docker push"],
                ["Docker Daemon", "The background service (dockerd) that does the actual work of building and running containers"],
                ["Docker Registry", "A server that stores Docker images. Docker Hub is the default public one; GHCR is private and tied to your GitHub account"],
                ["Dockerfile", "A text file with instructions for building an image — think of it as a recipe"],
              ].map(([name, desc]) => (
                <div className="step-item" key={name}>
                  <div className="step-content">
                    <div className="step-title">{name}</div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="arch-box">{`  ┌─────────────────────────────┐
  │       Docker Client (CLI)   │
  │   docker build / run / push │
  └──────────────┬──────────────┘
                 │ REST API
  ┌──────────────▼──────────────┐
  │       Docker Daemon         │
  │    Manages containers,      │
  │    images, networks,        │
  │    volumes                  │
  └──────────────┬──────────────┘
                 │ pull/push
  ┌──────────────▼──────────────┐
  │       Docker Registry       │
  │  Docker Hub / GHCR / ECR    │
  └─────────────────────────────┘`}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          Essential Docker Commands
        </div>
        <CodeBlock lang="bash" filename="terminal" code={`# Pull an image from a registry
docker pull eclipse-temurin:21-jre-alpine

# Build an image from a Dockerfile in the current directory
docker build -t hello-devops:1.0 .

# List all locally available images
docker images

# Run a container from an image (detached, port mapping)
docker run -d -p 8080:8080 --name hello hello-devops:1.0

# List running containers
docker ps

# View container logs
docker logs hello

# Stop and remove a container
docker stop hello && docker rm hello

# Remove an image
docker rmi hello-devops:1.0`} />
      </div>

      <div className="highlight-box info">
        <span className="icon"><FiMapPin size={17} /></span>
        <div>
          <strong>Image naming convention:</strong> <code>registry/username/image-name:tag</code>
          <br />Example: <code>ghcr.io/your-org/hello-devops:42</code> — registry is{" "}
          <code>ghcr.io</code>, tag <code>42</code> is the Jenkins build number.
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
