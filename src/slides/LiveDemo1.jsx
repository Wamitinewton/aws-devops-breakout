import { FiFolder, FiInfo, FiZap } from "react-icons/fi";
import CodeBlock from "../components/CodeBlock";

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

export default function LiveDemo1() {
  return (
    <div className="slide">
      <div className="slide-header">
        <span className="slide-tag">Live Demo · Page 1 of 2</span>
        <h1 className="slide-title">
          <span className="glow-amber">Hello DevOps</span> — The Demo Application
        </h1>
        <p className="slide-subtitle">
          A simple REST application written in Java (Spring Boot) — one endpoint, one purpose.
          Java is used here as a concrete example; the DevOps concepts apply equally to any language or framework.
        </p>
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-title"><FiFolder size={17} /> Project Structure</div>
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
            <span className="icon"><FiInfo size={17} /></span>
            <div style={{ fontSize: "12px" }}>
              The <code>/actuator/health</code> endpoint exposes application health status.
              Kubernetes uses this for readiness and liveness probes — essential for zero-downtime deployments.
            </div>
          </div>
        </div>
      </div>

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
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Returns</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["GET /hello",           '{ "message": "Hello, DevOps World!", "status": "running" }'],
                    ["GET /",               '{ "service": "hello-devops", "version": "1.0" }'],
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
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "11px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          pom.xml
        </div>
        <CodeBlock lang="yaml" filename="pom.xml" code={POM_XML} />
      </div>

      <div className="highlight-box success">
        <span className="icon"><FiZap size={17} /></span>
        <div>
          <strong>Run locally first:</strong> <code>mvn spring-boot:run</code> then{" "}
          <code>curl http://localhost:8080/hello</code>. Confirm it works before writing the
          Dockerfile. On the next page we containerise it and deploy through the full pipeline.
        </div>
      </div>
    </div>
  );
}
