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
  const activeSectionId = slides[current]?.section ?? "";
  const activeSlide = slides[current];

  // Build section groups: find first slide index per section
  const sectionFirstIndex = {};
  slides.forEach((s, i) => {
    if (sectionFirstIndex[s.section] === undefined) {
      sectionFirstIndex[s.section] = i;
    }
  });

  const sections = Object.keys(sectionFirstIndex);

  return (
    <nav className="top-nav">
      <div className="nav-brand">
        <span className="glow-text">GitOps</span>
        <span className="nav-brand-sub">for Beginners</span>
      </div>

      <div className="nav-sections">
        {sections.map((sectionId) => {
          const meta = SECTION_META[sectionId] ?? { label: sectionId, color: "var(--accent)" };
          const isActive = activeSectionId === sectionId;
          // Count how many slides belong to this section
          const sectionSlides = slides.filter((s) => s.section === sectionId);
          const sectionPage = isActive && sectionSlides.length > 1
            ? sectionSlides.findIndex((s) => s.id === activeSlide.id) + 1
            : null;

          return (
            <button
              key={sectionId}
              className={`nav-section-btn ${isActive ? "nav-section-active" : ""}`}
              style={{ "--section-color": meta.color }}
              onClick={() => goTo(sectionFirstIndex[sectionId])}
              title={meta.label}
            >
              <span className="nav-section-label">{meta.label}</span>
              {sectionPage !== null && sectionSlides.length > 1 && (
                <span className="nav-section-page">{sectionPage}/{sectionSlides.length}</span>
              )}
            </button>
          );
        })}
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
