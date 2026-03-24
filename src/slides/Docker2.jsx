import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

const SINGLE_STAGE_DOCKERFILE = `# Single-stage Dockerfile for a Spring Boot app
FROM maven:3.9-eclipse-temurin-21

# Set working directory inside the container
WORKDIR /app

# Copy the Maven project descriptor first (layer caching)
COPY pom.xml .

# Download all dependencies (cached if pom.xml didn't change)
RUN mvn dependency:go-offline -q

# Copy source code
COPY src ./src

# Build the JAR
RUN mvn package -DskipTests -q

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "target/hello-devops.jar"]`;

const DOCKERIGNORE = `# .dockerignore — files NOT copied into the build context
target/
*.class
*.log
.git/
.gitignore
README.md
*.iml
.idea/`;

const FAQ_ITEMS = [
  {
    q: "What is a layer in a Docker image and why does it matter?",
    a: (
      <>
        <p>Every instruction in a Dockerfile (FROM, COPY, RUN, etc.) creates a new <strong>layer</strong>. Docker caches each layer. When you rebuild, only layers that changed (and everything after them) are rebuilt.</p>
        <p>This is why we copy <code>pom.xml</code> and download dependencies <em>before</em> copying source code — if your source changes but <code>pom.xml</code> doesn't, Docker reuses the cached dependency layer, making rebuilds much faster.</p>
      </>
    ),
  },
  {
    q: "What is the difference between CMD and ENTRYPOINT?",
    a: (
      <>
        <p><strong>ENTRYPOINT</strong> defines the executable that always runs — it cannot be overridden by arguments passed to <code>docker run</code>. Use it when the container has a specific purpose (e.g., always run <code>java -jar app.jar</code>).</p>
        <p><strong>CMD</strong> provides default arguments that can be overridden. When used together, ENTRYPOINT is the command and CMD provides default parameters.</p>
      </>
    ),
  },
  {
    q: "Why should we use a .dockerignore file?",
    a: "The build context is the entire directory Docker sends to the daemon when you run docker build. Without .dockerignore, Docker copies your entire project including node_modules, .git history, target/ directory, etc. This makes the build context huge and slow. .dockerignore works exactly like .gitignore — list files you don't want included.",
  },
  {
    q: "What does EXPOSE do? Does it open the port automatically?",
    a: "EXPOSE is documentation only — it tells developers and tools which port the application listens on inside the container. It does NOT automatically make the port accessible from the host. You still need to use -p 8080:8080 in docker run (or a Kubernetes port/Service) to actually forward traffic.",
  },
];

export default function Docker2() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Docker · Page 2 of 3</span>
        <h1 className="slide-title">
          Writing Your <span style={{ color: "#2496ed" }}>Dockerfile</span>
        </h1>
        <p className="slide-subtitle">
          A Dockerfile is a recipe for building an image. Learn every instruction and write
          your first single-stage build for a Spring Boot application.
        </p>
      </div>

      {/* Dockerfile instructions reference */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title">
          <span style={{ fontSize: "20px" }}>📄</span> Dockerfile Instructions Reference
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Instruction</th>
              <th>Purpose</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["FROM",       "Base image (always first)",                     "FROM eclipse-temurin:21-jre-alpine"],
              ["WORKDIR",    "Set working directory inside container",         "WORKDIR /app"],
              ["COPY",       "Copy files from host → container",              "COPY pom.xml ."],
              ["ADD",        "Like COPY but also extracts archives",           "ADD app.tar.gz /opt/"],
              ["RUN",        "Execute a shell command during build",           "RUN mvn package -DskipTests"],
              ["ENV",        "Set environment variables",                      "ENV JAVA_OPTS=-Xmx512m"],
              ["ARG",        "Build-time variable (not in final image)",       "ARG VERSION=1.0"],
              ["EXPOSE",     "Document which port the app uses",               "EXPOSE 8080"],
              ["ENTRYPOINT", "Default executable (always runs)",               'ENTRYPOINT ["java","-jar","app.jar"]'],
              ["CMD",        "Default arguments (can be overridden)",          'CMD ["--spring.profiles.active=prod"]'],
              ["USER",       "Run subsequent commands as this user",           "USER nobody"],
              ["VOLUME",     "Declare a mount point for persistent storage",   "VOLUME /data"],
              ["LABEL",      "Add metadata to the image",                      'LABEL maintainer="team@example.com"'],
            ].map(([instr, purpose, example]) => (
              <tr key={instr}>
                <td><code style={{ color: "var(--vscode-keyword)" }}>{instr}</code></td>
                <td style={{ color: "var(--muted)", fontSize: "12px" }}>{purpose}</td>
                <td><code style={{ fontSize: "10.5px" }}>{example}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            Single-Stage Dockerfile
          </div>
          <CodeBlock lang="dockerfile" filename="Dockerfile" code={SINGLE_STAGE_DOCKERFILE} />
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            .dockerignore
          </div>
          <CodeBlock lang="bash" filename=".dockerignore" code={DOCKERIGNORE} />

          <div className="highlight-box warning" style={{ marginTop: "1rem" }}>
            <span className="icon">⚠️</span>
            <div style={{ fontSize: "12px" }}>
              <strong>Layer caching trick:</strong> Always <code>COPY pom.xml</code> and
              run <code>mvn dependency:go-offline</code> <em>before</em> copying <code>src/</code>.
              Dependencies rarely change — this keeps rebuilds fast.
            </div>
          </div>

          <div className="highlight-box danger" style={{ marginTop: "0.75rem" }}>
            <span className="icon">🔴</span>
            <div style={{ fontSize: "12px" }}>
              <strong>Problem with single-stage:</strong> The final image contains the full
              Maven + JDK installation (~600 MB). We ship build tools into production — wasteful
              and a security risk. <em>Multi-stage builds solve this — see page 3.</em>
            </div>
          </div>
        </div>
      </div>

      {/* Build flow */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title">
          <span style={{ fontSize: "20px" }}>🏗️</span> How a Docker Build Works
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            ["1. Build context sent", "Docker CLI sends the entire project directory (minus .dockerignore) to the Docker daemon"],
            ["2. Each instruction executed", "Docker executes each Dockerfile line in order, creating a new layer for each one"],
            ["3. Layer cache checked", "If a layer's instruction and its inputs haven't changed, Docker reuses the cached layer (huge speed win)"],
            ["4. Final image tagged", "The last layer becomes the image. docker build -t my-app:1.0 . tags it"],
            ["5. Push to registry", "docker push uploads each layer to the registry. Layers already in the registry are skipped"],
          ].map(([title, desc]) => (
            <div className="step-item" key={title}>
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
