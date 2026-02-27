import QuestionBox from "../components/QuestionBox";

export default function DockerSlide() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 02</span>
        <h2 className="slide-title">🐳 Docker</h2>
        <p className="slide-subtitle">How we package a Spring Boot service into a portable, runnable image.</p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ marginBottom: "1rem", fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px" }}>
            The Problem Docker Solves
          </div>
          <div className="step-list">
            {[
              { icon: "😤", title: "\"Works on my machine\"", desc: "Different JDK versions, OS differences, missing env variables — deployment failures that are impossible to reproduce locally." },
              { icon: "🔒", title: "Dependency isolation", desc: "Service A needs Java 17, Service B needs Java 21. On bare metal, they conflict. In containers, each has its own environment." },
              { icon: "🚀", title: "Reproducible builds", desc: "The Docker image you test locally is exactly what runs in production. Same binary, same JDK, same everything." },
            ].map((item, i) => (
              <div key={i} className="step-item">
                <div className="step-num" style={{ background: "rgba(0,229,255,0.15)", fontSize: "14px", border: "1px solid rgba(0,229,255,0.3)" }}>{item.icon}</div>
                <div className="step-content">
                  <div className="step-title">{item.title}</div>
                  <div className="step-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ marginBottom: "0.75rem", fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px" }}>
            Our Dockerfile (every service)
          </div>
          <div className="code-block">
            <span className="comment"># Stage 1: Build</span>{"\n"}
            <span className="keyword">FROM</span> <span className="value">eclipse-temurin:21-jdk-alpine</span> AS build{"\n"}
            <span className="keyword">WORKDIR</span> /app{"\n"}
            <span className="keyword">COPY</span> . .{"\n"}
            <span className="keyword">RUN</span> ./mvnw package -DskipTests{"\n\n"}
            <span className="comment"># Stage 2: Run</span>{"\n"}
            <span className="keyword">FROM</span> <span className="value">eclipse-temurin:21-jre-alpine</span>{"\n"}
            <span className="keyword">WORKDIR</span> /app{"\n"}
            <span className="keyword">COPY</span> --from=build /app/target/*.jar app.jar{"\n"}
            <span className="keyword">EXPOSE</span> <span className="string">8080</span>{"\n"}
            <span className="keyword">ENTRYPOINT</span> [<span className="string">"java"</span>, <span className="string">"-jar"</span>, <span className="string">"app.jar"</span>]
          </div>
          <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
            <span className="icon">💡</span>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              Multi-stage build: the build stage compiles the code; the run stage only includes the slim JRE and the JAR. Final image is ~180MB instead of ~600MB.
            </div>
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      <div style={{ marginBottom: "1rem", fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px" }}>
        Image → Registry → Cluster
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        {[
          { label: "docker build", sub: "creates image locally", color: "var(--accent)" },
          { label: "→", sub: "", color: "var(--muted)" },
          { label: "docker tag", sub: "ghcr.io/org/service:14", color: "var(--accent3)" },
          { label: "→", sub: "", color: "var(--muted)" },
          { label: "docker push", sub: "uploads to GHCR", color: "#a78bfa" },
          { label: "→", sub: "", color: "var(--muted)" },
          { label: "k8s pulls", sub: "on deployment", color: "var(--accent4)" },
        ].map((item, i) => item.label === "→" ? (
          <span key={i} style={{ color: "var(--muted)", fontSize: "20px" }}>→</span>
        ) : (
          <div key={i} style={{
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "8px 14px",
            textAlign: "center",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: item.color }}>{item.label}</div>
            {item.sub && <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>{item.sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1.5rem" }} className="highlight-box warning">
        <span className="icon">⚠️</span>
        <div>
          <strong style={{ color: "var(--accent3)" }}>In our setup:</strong>
          <span style={{ color: "var(--muted)", fontSize: "12.5px" }}> Jenkins runs docker commands natively on the VPS (not inside Kubernetes). It has access to the Docker socket <code>/var/run/docker.sock</code>. This is why Jenkins runs as a Docker container with socket mount, not as a Kubernetes pod.</span>
        </div>
      </div>

      <QuestionBox
        question="Why do we use a multi-stage Dockerfile instead of a single-stage build?"
        answer="A single-stage build would include the full JDK (~600MB) and Maven dependencies in the final image. Multi-stage: Stage 1 uses the full JDK to compile and package the JAR. Stage 2 uses only the slim JRE (~180MB) and just copies the compiled JAR. The build tools never end up in production. Smaller images = faster pulls = less attack surface."
      />
    </div>
  );
}