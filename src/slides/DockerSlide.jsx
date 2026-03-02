import QuestionBox from "../components/QuestionBox";
import CodeBlock from "../components/CodeBlock";

const DockerLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.186.186 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z" fill="#2496ED"/>
  </svg>
);

const dockerfile = `FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`;

export default function DockerSlide() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Section 02</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <DockerLogo />
          <h2 className="slide-title">Docker</h2>
        </div>
        <p className="slide-subtitle">How we package a Spring Boot service into a portable, runnable image.</p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ marginBottom: "1rem", fontFamily: "var(--font-head)", fontWeight: 700, color: "#fff", fontSize: "15px" }}>
            The Problem Docker Solves
          </div>
          <div className="step-list">
            {[
              {
                title: "Works on my machine",
                desc: "Different JDK versions, OS differences, missing env variables — deployment failures that are impossible to reproduce locally.",
              },
              {
                title: "Dependency isolation",
                desc: "Service A needs Java 17, Service B needs Java 21. On bare metal, they conflict. In containers, each has its own environment.",
              },
              {
                title: "Reproducible builds",
                desc: "The Docker image you test locally is exactly what runs in production. Same binary, same JDK, same everything.",
              },
            ].map((item, i) => (
              <div key={i} className="step-item">
                <div className="step-num" style={{ background: "rgba(36,150,237,0.15)", border: "1px solid rgba(36,150,237,0.4)", fontFamily: "var(--font-mono)", fontSize: "13px", color: "#2496ED" }}>
                  {i + 1}
                </div>
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
            Our Dockerfile
          </div>
          <CodeBlock code={dockerfile} lang="dockerfile" filename="Dockerfile" />
          <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              <strong style={{ color: "var(--accent)" }}>Multi-stage build:</strong> Stage 1 compiles with the full JDK. Stage 2 ships only the slim JRE and the compiled JAR. Final image is ~180 MB instead of ~600 MB.
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
          null,
          { label: "docker tag", sub: "ghcr.io/org/service:14", color: "var(--accent3)" },
          null,
          { label: "docker push", sub: "uploads to GHCR", color: "#a78bfa" },
          null,
          { label: "k8s pulls", sub: "on deployment", color: "var(--accent4)" },
        ].map((item, i) => item === null ? (
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

      <QuestionBox
        question="Why do we use a multi-stage Dockerfile instead of a single-stage build?"
        answer="A single-stage build would include the full JDK (~600MB) and Maven dependencies in the final image. Multi-stage: Stage 1 uses the full JDK to compile and package the JAR. Stage 2 uses only the slim JRE (~180MB) and just copies the compiled JAR. The build tools never end up in production. Smaller images = faster pulls = less attack surface."
      />
    </div>
  );
}