"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useEffect, useState, useRef } from "react";

export default function About() {
  const [activeId, setActiveId] = useState("about-us");
  const contentRef = useRef(null);

  useEffect(() => {
    const ids = [
      "about-us",
      "about-dishcovery",
      "systems-features",
      "about-project",
      "credits",
      "team",
      "write",
    ];

    // wait until contentRef is set
    const rootEl = contentRef.current || null;

    const sections = ids.map((id) => (rootEl ? rootEl.querySelector(`#${id}`) : document.getElementById(id))).filter(Boolean);
    if (!sections.length) return;

    // Enhanced intersection observer with better position detection
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // Get the element's position relative to the viewport
          const rect = entry.target.getBoundingClientRect();
          const windowHeight = window.innerHeight || document.documentElement.clientHeight;
          
          // Consider a section "active" if its top is near the top of the viewport
          // Adds a small buffer zone to prevent unwanted switches
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        root: null,
        // Adjusted margins to better detect section boundaries
        rootMargin: "-10% 0px -70% 0px",
        threshold: [0, 0.1, 0.5, 1.0]
      }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  function handleNavClick(e, id) {
    e.preventDefault();
    const rootEl = contentRef.current || document;
    const target = rootEl.querySelector ? rootEl.querySelector(`#${id}`) : document.getElementById(id);
    if (target) {
      // First update the active ID
      setActiveId(id);
      // Add a small delay before scrolling to ensure proper sync
      requestAnimationFrame(() => {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 100; // Offset for navbar
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    }
  }

  return (
    <>
      <Navbar />
      <div className="nav-spacer" />

      <div style={styles.container}>
        <aside style={styles.sidebar} className="about-sidebar">
          <div style={styles.sidebarInner} className="side-inner">
            <div style={styles.sideTitle} className="side-title">In this page</div>
            <nav style={styles.sideNav} className="side-nav" aria-label="In this page">
              <button type="button" onClick={(e)=>handleNavClick(e,'about-us')} className={`side-link ${activeId === "about-us" ? "active" : ""}`} aria-current={activeId === "about-us" ? "true" : undefined}>About Us</button>
              <button type="button" onClick={(e)=>handleNavClick(e,'about-dishcovery')} className={`side-link ${activeId === "about-dishcovery" ? "active" : ""}`} aria-current={activeId === "about-dishcovery" ? "true" : undefined}>About Dishcovery</button>
              <button type="button" onClick={(e)=>handleNavClick(e,'systems-features')} className={`side-link ${activeId === "systems-features" ? "active" : ""}`} aria-current={activeId === "systems-features" ? "true" : undefined}>Systems Features</button>
              <button type="button" onClick={(e)=>handleNavClick(e,'about-project')} className={`side-link ${activeId === "about-project" ? "active" : ""}`} aria-current={activeId === "about-project" ? "true" : undefined}>About the Project</button>
              <button type="button" onClick={(e)=>handleNavClick(e,'credits')} className={`side-link ${activeId === "credits" ? "active" : ""}`} aria-current={activeId === "credits" ? "true" : undefined}>Credits</button>
              <button type="button" onClick={(e)=>handleNavClick(e,'team')} className={`side-link ${activeId === "team" ? "active" : ""}`} aria-current={activeId === "team" ? "true" : undefined}>Meet the Team</button>
              <button type="button" onClick={(e)=>handleNavClick(e,'write')} className={`side-link ${activeId === "write" ? "active" : ""}`} aria-current={activeId === "write" ? "true" : undefined}>Write for Us</button>
            </nav>
          </div>
        </aside>

        <main style={styles.main}>
          <div ref={contentRef} style={styles.content} className="about-content">
          <section id="about-us">
            <h2 style={styles.h2}>About Us</h2>
            <p style={styles.p}>
              Dishcovery is a friendly web app for home cooks and food lovers who want to
              discover new recipes, explore cuisines, and get inspired in the kitchen. We
              combine a clean, modern user interface with powerful recipe search and
              ingredient-based recommendations so you can find recipes that match your taste
              and what's in your fridge. Whether you're a beginner or an experienced cook,
              Dishcovery helps you discover delicious ideas, plan meals, and try new dishes
              with confidence.
            </p>
          </section>

          <section id="about-dishcovery">
            <h2 style={styles.h2}>About Dishcovery</h2>
            <p style={styles.p}>
              Dishcovery is a recipe discovery and meal exploration platform that connects
              users with a wide variety of recipes and nutrition details. Core capabilities
              include browsing curated categories, searching recipes by text, exploring
              recipes that match ingredients you already have, and viewing detailed
              step-by-step instructions and nutrition information for each recipe. The app
              uses a responsive React front end, client-side routing, and integrates with
              third-party services for authentication and recipe data. Dishcovery is
              designed to be easy to use: enter ingredients, filter by category, or search
              for a dish and immediately get recipe suggestions and full details to start
              cooking.
            </p>
          </section>

          <section id="systems-features">
            <h2 style={styles.h2}>Systems Features</h2>
            <ul style={styles.featureList}>
              <li>
                <strong>Google Sign-In / Authentication</strong>
                <div style={styles.featureSub}>Sign-in with Google using Firebase Auth. Auth state is tracked throughout the app so the UI updates automatically when a user signs in or out.</div>
              </li>
              <li>
                <strong>Browse &amp; Search Recipes</strong>
                <div style={styles.featureSub}>Full-text search and category filters to find recipes by name, cuisine, or type.</div>
              </li>
              <li>
                <strong>Ingredient-based Search (Fridge feature)</strong>
                <div style={styles.featureSub}>Enter ingredients you have and get recipe suggestions that include those ingredients.</div>
              </li>
              <li>
                <strong>Recipe Details &amp; Nutrition</strong>
                <div style={styles.featureSub}>Detailed recipe pages with ingredients, step-by-step instructions, macro/micronutrient breakdowns, and estimated cooking time.</div>
              </li>
              <li>
                <strong>Profile &amp; Favorites (UI)</strong>
                <div style={styles.featureSub}>Profile area showing the signed-in user's name and avatar.</div>
              </li>
              <li>
                <strong>Client-side Routing &amp; Responsive UI</strong>
                <div style={styles.featureSub}>Routes for the main app sections and components optimized for different screen sizes.</div>
              </li>
              <li>
                <strong>Environment-driven API key usage</strong>
                <div style={styles.featureSub}>External recipe requests use an environment variable (e.g., NEXT_PUBLIC_SPOONACULAR_KEY) so production keys are not hard-coded.</div>
              </li>
            </ul>
          </section>

          <section id="about-project">
            <h2 style={styles.h2}>About the Project</h2>
            <p style={styles.p}>
              This project was developed as a full-stack application in partial fulfillment
              of the requirements for the degree of Bachelor of Science in Information
              Technology. It demonstrates practical skills learned in ICE 415 — Professional
              Elective 5 — including front-end component design using React, client-side
              routing, authentication with Firebase, asynchronous API integration, state
              management, and responsive UI design. The implementation showcases how to
              integrate third-party services, manage environment configuration for API
              keys, and build a user-focused experience that supports searching, filtering,
              and viewing recipe content. This project reflects both technical competency
              and product-oriented design thinking.
            </p>
          </section>

          <section id="credits">
            <h2 style={styles.h2}>Credits and External Data Sources</h2>
            <p style={styles.p}>
              Recipe and nutrition data used by this project is provided by the Spoonacular
              API. We thank Spoonacular for the recipe search and nutrition endpoints that
              make Dishcovery's content possible. Authentication is provided by Firebase
              Authentication (Google provider).
            </p>
          </section>

          <section id="team">
            <h2 style={styles.h2}>Meet the TEAM</h2>
            <p style={styles.p}><strong>Bongato, KC M.</strong> — Full-stack Developer<br />(Worked on API integration, Explore/Fridge features, and recipe search.)</p>
            <p style={styles.p}><strong>Cal, Jenifer O.</strong> — Full-stack Developer<br />(Contributed to core front-end components, routing, and UI layout.)</p>
            <p style={styles.p}><strong>Morales, Rolyn L.</strong> — Full-stack Developer<br />(Implemented RecipeDetails, profile handling, and styling.)</p>
          </section>

          <section id="write">
            <h2 style={styles.h2}>Write for Us</h2>
            <p style={styles.p}>
              Love cooking or writing about food? We welcome guest contributions. If you'd
              like to submit a recipe, a how-to guide, a cooking tip, or a short article
              about food culture, send us a brief pitch with your name, a short bio, and a
              summary of what you want to write. Selected contributions may be published on
              Dishcovery with full attribution to the author. Email submissions or
              contribution requests to the project contact (or open an issue on the project
              repo) and we'll get back to you.
            </p>
          </section>
          </div>
        </main>
      
        <style>{`
          /* Smooth scrolling for in-page anchors */
          html { scroll-behavior: smooth; }

          /* Sidebar card design that matches the provided image */
          /* Keep the sidebar fixed/sticky in the viewport so only the right pane scrolls */
          .about-sidebar { align-self: flex-start; position: sticky; top: 84px; z-index: 900; }
          .about-sidebar .side-inner { position: static; background: #fafafa; padding: 20px; border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.04); border: 1px solid #f0f0f0; }
          .side-title { font-weight: 800; color: #222; font-size: 18px; margin-bottom: 14px; }

          .side-nav { position: relative; padding-left: 10px; display: flex; flex-direction: column; gap: 6px; }
          /* extend divider to start above the first item (About Us) */
          .side-nav::before { content: ""; position: absolute; left: 20px; top: 20px; bottom: 24px; width: 1px; background: #e6e6e6; }

          .side-link { display: block; color: #222; background: transparent; border: none; text-align: left; text-decoration: none; padding: 8px 8px 8px 48px; font-weight: 500; font-size: 15px; border-radius: 6px; cursor: pointer; }
          .side-link:hover { color: #FF9E00; }

          /* Active state with orange chevron icon similar to the image */
          .side-link.active { color: #111; font-weight: 700; position: relative; }
          .side-link.active::before { content: ""; position: absolute; left: 5px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-top: 7px solid transparent; border-bottom: 7px solid transparent; border-left: 11px solid #FF9E00; }

          /* Ensure sections don't hide under the fixed navbar */
          section { scroll-margin-top: 100px; padding-top: 20px; padding-bottom: 20px; }

          @media (max-width: 980px) {
            .about-sidebar { display: none; }
            .nav-spacer { height: 70px; }
          }
        `}</style>
      </div>

      <Footer />
    </>
  );
}

const styles = {
  container: { display: "flex", gap: 80, padding: "40px 80px", fontFamily: "Poppins, sans-serif" },
  sidebar: { width: 300, flex: "0 0 300px" },
  sidebarInner: { background: "#fafafa", padding: 18, borderRadius: 8, border: "1px solid #f0f0f0" },
  sideTitle: { fontWeight: 700, color: "#555", marginBottom: 12 },
  sideNav: { display: "flex", flexDirection: "column", gap: 8 },
  main: { flex: 1, maxWidth: 920 },
  h1: { margin: 0, fontSize: 32, fontWeight: 700, color: "#222" },
  h2: { marginTop: 6, fontSize: 22, fontWeight: 700, color: "#FF9E00" },
  p: { marginTop: 12, fontSize: 16, color: "#555", lineHeight: 1.8 },
  featureList: { marginTop: 12, paddingLeft: 18, color: "#444" },
  featureSub: { marginBottom: 20, color: "#666", fontSize: 15 },
  plainList: { marginTop: 12, paddingLeft: 18 },
};
