import { useState, useEffect, useRef } from "react";
import Nav from "./components/Nav";
import Intro from "./slides/Intro";
import ToolsGlossary from "./slides/ToolsGlossary";
import Docker1 from "./slides/Docker1";
import Docker2 from "./slides/Docker2";
import Docker3 from "./slides/Docker3";
import Jenkins1 from "./slides/Jenkins1";
import Jenkins2 from "./slides/Jenkins2";
import Kubernetes1 from "./slides/Kubernetes1";
import Kubernetes2 from "./slides/Kubernetes2";
import Kubernetes3 from "./slides/Kubernetes3";
import ArgoCD1 from "./slides/ArgoCD1";
import ArgoCD2 from "./slides/ArgoCD2";
import GHCR1 from "./slides/GHCR1";
import GHCR2 from "./slides/GHCR2";
import CICDFlow from "./slides/CICDFlow";
import LiveDemo1 from "./slides/LiveDemo1";
import LiveDemo2 from "./slides/LiveDemo2";

const SLIDES = [
  { id: "intro",    section: "intro",      label: "Welcome",          component: Intro },
  { id: "tools",    section: "tools",      label: "Tools",            component: ToolsGlossary },
  { id: "docker-1", section: "docker",     label: "Docker",           page: 1, total: 3, component: Docker1 },
  { id: "docker-2", section: "docker",     label: "Docker",           page: 2, total: 3, component: Docker2 },
  { id: "docker-3", section: "docker",     label: "Docker",           page: 3, total: 3, component: Docker3 },
  { id: "jenkins-1",section: "jenkins",    label: "Jenkins",          page: 1, total: 2, component: Jenkins1 },
  { id: "jenkins-2",section: "jenkins",    label: "Jenkins",          page: 2, total: 2, component: Jenkins2 },
  { id: "k8s-1",    section: "kubernetes", label: "Kubernetes",       page: 1, total: 3, component: Kubernetes1 },
  { id: "k8s-2",    section: "kubernetes", label: "Kubernetes",       page: 2, total: 3, component: Kubernetes2 },
  { id: "k8s-3",    section: "kubernetes", label: "Kubernetes",       page: 3, total: 3, component: Kubernetes3 },
  { id: "argocd-1", section: "argocd",     label: "ArgoCD",           page: 1, total: 2, component: ArgoCD1 },
  { id: "argocd-2", section: "argocd",     label: "ArgoCD",           page: 2, total: 2, component: ArgoCD2 },
  { id: "ghcr-1",   section: "ghcr",       label: "GHCR",             page: 1, total: 2, component: GHCR1 },
  { id: "ghcr-2",   section: "ghcr",       label: "GHCR",             page: 2, total: 2, component: GHCR2 },
  { id: "cicd",     section: "cicd",       label: "CI/CD Flow",       component: CICDFlow },
  { id: "demo-1",   section: "demo",       label: "Live Demo",        page: 1, total: 2, component: LiveDemo1 },
  { id: "demo-2",   section: "demo",       label: "Live Demo",        page: 2, total: 2, component: LiveDemo2 },
];

export default function App() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState("forward");
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef(null);

  const goTo = (idx) => {
    if (animating || idx === current || idx < 0 || idx >= SLIDES.length) return;
    setDirection(idx > current ? "forward" : "back");
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
      if (containerRef.current) containerRef.current.scrollTop = 0;
    }, 280);
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, animating]);

  const { component: SlideComponent, section } = SLIDES[current];
  const sectionSlides = SLIDES.filter((s) => s.section === section);
  const sectionIdx    = sectionSlides.findIndex((s) => s.id === SLIDES[current].id);

  return (
    <div className="app-root">
      <Nav slides={SLIDES} current={current} goTo={goTo} />

      <main
        ref={containerRef}
        className={`slide-container ${animating ? (direction === "forward" ? "exit-left" : "exit-right") : "enter"}`}
      >
        <SlideComponent />
      </main>

      <footer className="slide-footer">
        <button className="nav-btn" onClick={prev} disabled={current === 0}>
          ← Prev
        </button>

        <div className="footer-center">
          <span className="slide-count">{current + 1} / {SLIDES.length}</span>
          {sectionSlides.length > 1 && (
            <div className="section-page-btns">
              {sectionSlides.map((s, i) => (
                <button
                  key={s.id}
                  className={`page-pip ${i === sectionIdx ? "page-pip-active" : ""}`}
                  onClick={() => goTo(SLIDES.indexOf(s))}
                  title={`Page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <button className="nav-btn" onClick={next} disabled={current === SLIDES.length - 1}>
          Next →
        </button>
      </footer>
    </div>
  );
}
