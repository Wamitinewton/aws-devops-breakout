import { useState, useEffect } from "react";
import Intro from "./slides/Intro";
import ToolsGlossary from "./slides/ToolsGlossary";
import CICDFlow from "./slides/CICDFlow";
import DockerSlide from "./slides/DockerSlide";
import JenkinsSlide from "./slides/JenkinsSlide";
import ArgoCDSlide from "./slides/ArgoCDSlide";
import KubernetesSlide from "./slides/KubernetesSlide";
import APIGateway from "./slides/APIGateway";
import LiveDemo from "./slides/LiveDemo";
import Nav from "./components/Nav";

const SLIDES = [
  { id: "intro", label: "Welcome", component: Intro },
  { id: "tools", label: "Tools", component: ToolsGlossary },
  { id: "docker", label: "Docker", component: DockerSlide },
  { id: "jenkins", label: "Jenkins", component: JenkinsSlide },
  { id: "kubernetes", label: "Kubernetes", component: KubernetesSlide },
  { id: "argocd", label: "ArgoCD", component: ArgoCDSlide },
  { id: "cicd", label: "CI/CD Flow", component: CICDFlow },
  { id: "gateway", label: "API Gateway", component: APIGateway },
  { id: "demo", label: "Live Demo", component: LiveDemo },
];

export default function App() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState("forward");
  const [animating, setAnimating] = useState(false);

  const goTo = (idx) => {
    if (animating || idx === current) return;
    setDirection(idx > current ? "forward" : "back");
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 300);
  };

  const next = () => goTo(Math.min(current + 1, SLIDES.length - 1));
  const prev = () => goTo(Math.max(current - 1, 0));

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, animating]);

  const SlideComponent = SLIDES[current].component;

  return (
    <div className="app-root">
      <Nav slides={SLIDES} current={current} goTo={goTo} />
      <main className={`slide-container ${animating ? (direction === "forward" ? "exit-left" : "exit-right") : "enter"}`}>
        <SlideComponent />
      </main>
      <footer className="slide-footer">
        <button className="nav-btn" onClick={prev} disabled={current === 0}>← Prev</button>
        <span className="slide-count">{current + 1} / {SLIDES.length}</span>
        <button className="nav-btn" onClick={next} disabled={current === SLIDES.length - 1}>Next →</button>
      </footer>
    </div>
  );
}