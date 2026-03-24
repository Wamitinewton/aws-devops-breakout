import CodeBlock from "../components/CodeBlock";
import FAQ from "../components/FAQ";

const CONTROLLER_JAVA = `package com.devops.hellodevops;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of(
            "message", "Hello, DevOps World!",
            "status",  "running"
        );
    }

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of("service", "hello-devops", "version", "1.0");
    }
}`;

const MAIN_CLASS = `package com.devops.hellodevops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HelloDevopsApplication {
    public static void main(String[] args) {
        SpringApplication.run(HelloDevopsApplication.class, args);
    }
}`;

const APPLICATION_YML = `server:
  port: 8080

spring:
  application:
    name: hello-devops

management:
  endpoints:
    web:
      exposure:
        include: health, info
  endpoint:
    health:
      show-details: always

logging:
  level:
    root: INFO
    com.devops: DEBUG`;

const POM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
           https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
  </parent>

  <groupId>com.devops</groupId>
  <artifactId>hello-devops</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>hello-devops</name>

  <properties>
    <java.version>21</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <!-- Health endpoints for Kubernetes probes -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>`;

const FAQ_ITEMS = [
  {
    q: "Why use application.yml instead of application.properties?",
    a: (
      <>
        <p><code>application.yml</code> uses YAML format, which supports hierarchical structure natively. Compare:</p>
        <ul>
          <li><strong>properties:</strong> <code>management.endpoints.web.exposure.include=health,info</code></li>
          <li><strong>yml:</strong> Nested <code>management.endpoints.web.exposure.include: health,info</code></li>
        </ul>
        <p>YAML is more readable for complex configurations and is the industry standard for Kubernetes-deployed Spring Boot apps. It also supports comments, lists, and multi-document files with <code>---</code>.</p>
      </>
    ),
  },
  {
    q: "What does spring-boot-starter-actuator give us?",
    a: "Actuator adds production-ready features: /actuator/health returns the application health status (used by Kubernetes readiness/liveness probes), /actuator/info provides build metadata, and many other monitoring endpoints. Without actuator, Kubernetes cannot check if your Spring Boot app is actually healthy — it can only check if the container is running.",
  },
  {
    q: "Why do we use Map.of() instead of a plain String return?",
    a: "Returning a Java Map causes Spring to serialize the response as JSON automatically. curl http://localhost:8080/hello returns {\"message\": \"Hello, DevOps World!\", \"status\": \"running\"}. A plain String would return the raw text. JSON is the correct format for REST APIs — it is structured, versioned, and easy for any client to consume.",
  },
  {
    q: "Do we need Spring Security for this demo?",
    a: "No. This is a beginner demo with no authentication. Adding Spring Security would require configuration and would block the health endpoints that Kubernetes needs. In a real application you would add security, but for learning the DevOps pipeline, we keep the application as simple as possible so we can focus on the infrastructure.",
  },
];

export default function LiveDemo1() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Live Demo · Page 1 of 2</span>
        <h1 className="slide-title">
          <span className="glow-amber">Hello DevOps</span> — The Application
        </h1>
        <p className="slide-subtitle">
          A simple Spring Boot REST application — one endpoint, one purpose. We will build,
          containerise, and deploy it using the full CI/CD pipeline we have learned.
        </p>
      </div>

      {/* Project structure */}
      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-title"><span style={{ fontSize: "20px" }}>📁</span> Project Structure</div>
          <div className="arch-box">{`hello-devops/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/devops/hellodevops/
│   │   │       ├── HelloDevopsApplication.java
│   │   │       └── HelloController.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/
│           └── com/devops/hellodevops/
│               └── HelloControllerTest.java
├── Dockerfile
├── Jenkinsfile
├── pom.xml
└── .dockerignore`}</div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            application.yml
          </div>
          <CodeBlock lang="yaml" filename="src/main/resources/application.yml" code={APPLICATION_YML} />
          <div className="highlight-box info" style={{ marginTop: "0.75rem" }}>
            <span className="icon">💡</span>
            <div style={{ fontSize: "12px" }}>
              Spring Boot Actuator exposes <code>/actuator/health</code> which returns the
              application health status. Kubernetes uses this for readiness and liveness probes.
            </div>
          </div>
        </div>
      </div>

      {/* Java code */}
      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            HelloController.java
          </div>
          <CodeBlock lang="java" filename="HelloController.java" code={CONTROLLER_JAVA} />
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            HelloDevopsApplication.java
          </div>
          <CodeBlock lang="java" filename="HelloDevopsApplication.java" code={MAIN_CLASS} />

          <div style={{ marginTop: "1rem" }}>
            <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
              Available Endpoints
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Returns</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["GET /hello",          '{ "message": "Hello, DevOps World!", "status": "running" }'],
                  ["GET /",              '{ "service": "hello-devops", "version": "1.0" }'],
                  ["GET /actuator/health", '{ "status": "UP", "components": {...} }'],
                  ["GET /actuator/info",   "Build info, Git commit, app version"],
                ].map(([ep, resp]) => (
                  <tr key={ep}>
                    <td><code style={{ fontSize: "10.5px" }}>{ep}</code></td>
                    <td style={{ fontSize: "11px", color: "var(--muted)" }}>{resp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* pom.xml */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          pom.xml
        </div>
        <CodeBlock lang="yaml" filename="pom.xml" code={POM_XML} />
      </div>

      <div className="highlight-box success">
        <span className="icon">🚀</span>
        <div>
          <strong>Run locally first:</strong> <code>mvn spring-boot:run</code> then{" "}
          <code>curl http://localhost:8080/hello</code>. Confirm it works before writing the
          Dockerfile. On the next page we containerise it and deploy through the full pipeline.
        </div>
      </div>

      <FAQ items={FAQ_ITEMS} />
    </div>
  );
}
