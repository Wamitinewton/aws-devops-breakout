import { FiXCircle, FiCheckCircle, FiSliders, FiZap, FiLock, FiBox, FiHardDrive, FiRefreshCw, FiStar } from "react-icons/fi";
import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

const SINGLE_STAGE = `# Single-stage — ships the entire build toolchain
FROM maven:3.9-eclipse-temurin-21

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "target/hello-devops.jar"]

# Final image size: ~600 MB
# Contains: JDK 21 + Maven + all source code`;

const MULTI_STAGE = `# Multi-stage — only the JRE reaches production

# ── Stage 1: Build ──────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Leverage layer caching: copy descriptor before source
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S devops && adduser -S devops -G devops

# Copy ONLY the compiled JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

USER devops

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

# Final image size: ~85 MB
# Contains: JRE 21 + JAR only — no Maven, no source`;

const FAQ_ITEMS = [
  {
    q: "In a multi-stage build, does the builder stage end up in the final image?",
    a: "No. Docker discards all intermediate stages. Only the final FROM stage becomes the image you push to the registry. The builder stage is used purely during the build process — none of its layers, tools, or source code are included in the final image.",
  },
  {
    q: "Can a Dockerfile have more than two stages?",
    a: (
      <>
        <p>Yes — you can have as many stages as you need. For example, you might have:</p>
        <ul>
          <li><strong>deps</strong> stage — downloads dependencies (cached separately)</li>
          <li><strong>test</strong> stage — runs unit tests</li>
          <li><strong>builder</strong> stage — compiles the artifact</li>
          <li><strong>runtime</strong> stage — the final slim image</li>
        </ul>
        <p>Each stage is a separate FROM instruction with an AS alias.</p>
      </>
    ),
  },
  {
    q: "Why use a JRE-based alpine image instead of a full JDK image?",
    a: "Two reasons: (1) JRE vs JDK — JRE is the Java Runtime Environment; it can only run compiled code. JDK also includes compilers and dev tools which are unnecessary at runtime. (2) Alpine Linux is a minimal 5 MB Linux distribution instead of the default Debian/Ubuntu (~130 MB). Together they drastically reduce image size and attack surface.",
  },
  {
    q: "What is the security benefit of running as a non-root user inside the container?",
    a: "By default, containers run as root — if an attacker exploits a vulnerability in your app, they have root access inside the container and potentially the host. Creating a dedicated user and switching with USER limits the blast radius: the process can only access files owned by that user, making privilege escalation much harder.",
  },
];

const BENEFITS = [
  { icon: FiSliders, label: "Image Size",        bad: "~600 MB (full build toolchain)",              good: "~85 MB (runtime + artifact only)" },
  { icon: FiZap,     label: "Pull Speed",         bad: "Slow — all layers pulled on every node",     good: "Fast — smaller layers, faster cold starts" },
  { icon: FiLock,    label: "Security Surface",   bad: "Build tools, compiler, source in production", good: "Only runtime and compiled artifact" },
  { icon: FiBox,     label: "Cleanliness",        bad: "Build tools pollute the runtime environment", good: "Strict separation of build vs runtime" },
  { icon: FiHardDrive, label: "Registry Storage", bad: "More storage = higher cost at scale",         good: "7x smaller image reduces storage and bandwidth" },
  { icon: FiRefreshCw, label: "Layer Caching",    bad: "Dependency layer mixes with source",          good: "Dependency layer cached independently" },
];

export default function Docker3() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Docker · Page 3 of 3</span>
        <h1 className="slide-title">
          Multi-Stage <span style={{ color: "#2496ed" }}>Builds</span>
        </h1>
        <p className="slide-subtitle">
          The single most impactful Dockerfile technique for production — smaller images,
          faster deployments, and a dramatically reduced security surface.
        </p>
      </div>

      <div className="highlight-box danger" style={{ marginBottom: "1.5rem" }}>
        <span className="icon"><FiXCircle size={17} /></span>
        <div>
          <strong>The single-stage problem:</strong> A full build toolchain image can be ~600 MB.
          Every container pull, every Kubernetes node, every CI artifact carries that weight.
          Worse — build tools and your raw source code are shipped to production.
          That is unnecessary and a security risk.
        </div>
      </div>

      <div className="compare-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="compare-card bad">
          <div className="compare-title"><FiXCircle size={14} /> Single-Stage Build</div>
          <CodeBlock lang="dockerfile" filename="Dockerfile (single)" code={SINGLE_STAGE} />
        </div>
        <div className="compare-card good">
          <div className="compare-title"><FiCheckCircle size={14} /> Multi-Stage Build</div>
          <CodeBlock lang="dockerfile" filename="Dockerfile (multi-stage)" code={MULTI_STAGE} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title"><FiSliders size={17} /> Why Multi-Stage Wins</div>
        <div className="card-grid" style={{ marginTop: "0.5rem" }}>
          {BENEFITS.map(({ icon: Icon, label, bad, good }) => (
            <div key={label} style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "1rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "13px", color: "#fff", marginBottom: "0.5rem" }}>
                <Icon size={15} style={{ color: "var(--accent)", flexShrink: 0 }} /> {label}
              </div>
              <div style={{ fontSize: "12px", color: "var(--danger)", marginBottom: "0.25rem" }}>✗ {bad}</div>
              <div style={{ fontSize: "12px", color: "var(--accent4)" }}>✓ {good}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title"><FiStar size={17} /> Multi-Stage Best Practices</div>
        <div className="step-list">
          {[
            ["Use minimal runtime base images", "Alpine-based or distroless runtimes keep the image small, fast, and secure"],
            ["Always create a non-root user", "RUN addgroup + adduser then USER keeps the container from running as root"],
            ["COPY --from=builder selectively", "Only copy what the app needs to run — not the entire build output directory"],
            ["Pin base image versions", "Use specific version tags, not :latest — ensures reproducible builds"],
            ["Separate dependency download from compilation", "Download dependencies before copying source to maximise cache hits"],
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
