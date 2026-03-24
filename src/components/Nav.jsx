import { useState, useEffect, useRef } from "react";

const SECTION_META = {
  intro:      { label: "Welcome",     color: "var(--accent)" },
  tools:      { label: "Tools",       color: "var(--accent)" },
  docker:     { label: "Docker",      color: "#2496ed" },
  jenkins:    { label: "Jenkins",     color: "#d33833" },
  kubernetes: { label: "Kubernetes",  color: "#326ce5" },
  argocd:     { label: "ArgoCD",      color: "#ef7b4d" },
  ghcr:       { label: "GHCR",        color: "#a78bfa" },
  cicd:       { label: "CI/CD Flow",  color: "var(--accent4)" },
  demo:       { label: "Live Demo",   color: "var(--accent3)" },
};

export default function Nav({ slides, current, goTo }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const activeSectionId = slides[current]?.section ?? "";
  const activeSlide = slides[current];

  const sectionFirstIndex = {};
  slides.forEach((s, i) => {
    if (sectionFirstIndex[s.section] === undefined) {
      sectionFirstIndex[s.section] = i;
    }
  });

  const sections = Object.keys(sectionFirstIndex);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const handleSectionClick = (idx) => {
    goTo(idx);
    setMenuOpen(false);
  };

  const activeMeta = SECTION_META[activeSectionId] ?? { label: activeSectionId, color: "var(--accent)" };

  const renderSectionButton = (sectionId, onClick, extraClass = "") => {
    const meta = SECTION_META[sectionId] ?? { label: sectionId, color: "var(--accent)" };
    const isActive = activeSectionId === sectionId;
    const sectionSlides = slides.filter((s) => s.section === sectionId);
    const sectionPage =
      isActive && sectionSlides.length > 1
        ? sectionSlides.findIndex((s) => s.id === activeSlide.id) + 1
        : null;

    return (
      <button
        key={sectionId}
        className={`nav-section-btn ${isActive ? "nav-section-active" : ""} ${extraClass}`}
        style={{ "--section-color": meta.color }}
        onClick={() => onClick(sectionFirstIndex[sectionId])}
        title={meta.label}
      >
        <span className="nav-section-label">{meta.label}</span>
        {sectionPage !== null && sectionSlides.length > 1 && (
          <span className="nav-section-page">{sectionPage}/{sectionSlides.length}</span>
        )}
      </button>
    );
  };

  return (
    <nav className="top-nav">
      <div className="nav-brand">
        <span className="glow-text">GitOps</span>
        <span className="nav-brand-sub">for Beginners</span>
      </div>

      <div className="nav-sections">
        {sections.map((sectionId) => renderSectionButton(sectionId, goTo))}
      </div>

      <div className="nav-mobile" ref={menuRef}>
        <div
          className="nav-mobile-current"
          style={{ "--section-color": activeMeta.color }}
        >
          <span className="nav-mobile-section-name">{activeMeta.label}</span>
          {activeSlide?.page && activeSlide?.total && (
            <span className="nav-section-page">
              {activeSlide.page}/{activeSlide.total}
            </span>
          )}
        </div>

        <button
          className={`hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {menuOpen && (
          <div className="nav-dropdown">
            {sections.map((sectionId) => {
              const meta = SECTION_META[sectionId] ?? { label: sectionId, color: "var(--accent)" };
              const isActive = activeSectionId === sectionId;
              const sectionSlides = slides.filter((s) => s.section === sectionId);
              const sectionPage =
                isActive && sectionSlides.length > 1
                  ? sectionSlides.findIndex((s) => s.id === activeSlide.id) + 1
                  : null;

              return (
                <button
                  key={sectionId}
                  className={`nav-dropdown-item ${isActive ? "nav-dropdown-active" : ""}`}
                  style={{ "--section-color": meta.color }}
                  onClick={() => handleSectionClick(sectionFirstIndex[sectionId])}
                >
                  <span className="nav-dropdown-dot" />
                  <span className="nav-dropdown-label">{meta.label}</span>
                  {sectionPage !== null && sectionSlides.length > 1 && (
                    <span className="nav-section-page">
                      {sectionPage}/{sectionSlides.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {activeSlide?.page && activeSlide?.total && (
        <div className="nav-page-dots">
          {Array.from({ length: activeSlide.total }, (_, i) => (
            <span
              key={i}
              className={`nav-dot ${i + 1 === activeSlide.page ? "nav-dot-active" : ""}`}
              style={{ "--section-color": SECTION_META[activeSectionId]?.color ?? "var(--accent)" }}
            />
          ))}
        </div>
      )}
    </nav>
  );
}
