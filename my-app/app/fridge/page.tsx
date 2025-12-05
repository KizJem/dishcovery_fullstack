"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Fridge() {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Add ingredients
  const addIngredient = () => {
    const v = input.trim().toLowerCase();
    if (!v) return;
    if (!ingredients.includes(v)) setIngredients((prev) => [...prev, v]);
    setInput("");
  };

  const removeIngredient = (name) =>
    setIngredients((prev) => prev.filter((x) => x !== name));

  const clearIngredients = () => {
    setIngredients([]);
    setItems([]);
    setError("");
  };

  // Build API params from ingredients
  const apiParams = useMemo(() => {
    if (!ingredients.length) return null;
    return {
      includeIngredients: ingredients.join(","),
    };
  }, [ingredients]);

  // Fetch recipes whenever ingredients change
  useEffect(() => {
    if (!apiParams) return;

    const key = process.env.NEXT_PUBLIC_SPOONACULAR_KEY;
    if (!key) {
      setError("Missing Spoonacular API key in .env.local");
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        // 1) Find recipes by ingredients (best match uses most of them)
        const byIng = new URL("https://api.spoonacular.com/recipes/findByIngredients");
        byIng.searchParams.set("apiKey", key);
        byIng.searchParams.set("number", "24");
        byIng.searchParams.set("ranking", "1");           // 1=maximize used ingredients
        byIng.searchParams.set("ignorePantry", "true");
        byIng.searchParams.set("ingredients", apiParams.includeIngredients);

        const r1 = await fetch(byIng.toString(), { signal: controller.signal });
        if (!r1.ok) throw new Error(`HTTP ${r1.status}`);
        const list = await r1.json(); // [{id,title,image,...}]
        const ids = (list || []).map((x) => x.id).join(",");
        if (!ids) {
          setItems([]);
          setLoading(false);
          return;
        }

        // 2) Enrich with full info for tags, time, diets, etc.
        const bulk = new URL("https://api.spoonacular.com/recipes/informationBulk");
        bulk.searchParams.set("apiKey", key);
        bulk.searchParams.set("ids", ids);

        const r2 = await fetch(bulk.toString(), { signal: controller.signal });
        if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
        const detailed = await r2.json(); // array of recipes with diets, healthScore, readyInMinutes, image, title

        setItems(Array.isArray(detailed) ? detailed : []);
      } catch (e) {
        if (e.name !== "AbortError") setError("Failed to load recipes.");
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [apiParams]);

  // Simple helper for recipe tags
  const tagsOf = (r) => {
    const out = [];
    if (r.veryHealthy || r.healthScore >= 60) out.push("Healthy");
    if (r.readyInMinutes <= 30) out.push("Quick");
    if (Array.isArray(r.diets)) {
      if (r.diets.includes("vegan")) out.push("Vegan");
      if (r.diets.some((d) => d.includes("vegetarian"))) out.push("Vegetarian");
    }
    return out.slice(0, 3);
  };

  return (
    <>
      <Navbar />
      <div className="nav-spacer" />

      <div style={styles.page}>
        <h2 style={styles.heading}>
          What's in <span style={styles.highlight}>Your Fridge?</span>
        </h2>

        {/* Input Section */}
        <div style={styles.inputRow}>
          <input
            type="text"
            placeholder="Enter ingredients"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addIngredient()}
            style={styles.input}
          />
          <button onClick={addIngredient} style={styles.addBtn}>
            Add
          </button>
          <button onClick={clearIngredients} style={styles.clearBtn} title="Clear all">
            🗑
          </button>
        </div>

        {/* Ingredients Pills */}
        <div style={styles.ingredientsGrid}>
          {ingredients.map((item) => (
            <div
              key={item}
              style={styles.ingPill}
              title={item}
            >
              <span style={styles.ingName}>{item}</span>
              <button
                onClick={() => removeIngredient(item)}
                aria-label={`Remove ${item}`}
                style={styles.ingClose}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Results / Errors */}
        {error && (
          <p style={{ textAlign: "center", color: "#b00020", marginTop: -4, marginBottom: 12 }}>
            {error}
          </p>
        )}

        {/* Recipes Section */}
        <div style={styles.resultsHeader}>
          <h3 style={{ margin: 0, fontSize: 18 }}>
            {ingredients.length
              ? `Recipes using: ${ingredients.join(", ")}`
              : "Add ingredients to see matching recipes"}
          </h3>
          {loading && <span style={{ fontSize: 14, opacity: 0.7 }}>Loading…</span>}
        </div>

        <div style={styles.recipeGrid}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={`skel-${i}`} style={styles.recipeCard}>
                  <div style={styles.skelImg} />
                  <div style={{ padding: 12 }}>
                    <div style={{ width: 160, height: 14, background: "#eee", borderRadius: 6 }} />
                  </div>
                </div>
              ))
            : items.map((r) => {
                const img = r.image || "/food.png";
                const title = r.title || "Untitled Recipe";
                const tags = tagsOf(r);
                return (
                  <div key={r.id} style={styles.recipeCard}>
                    <img src={img} alt={title} style={styles.recipeImg} loading="lazy" />
                    <div style={styles.recipeInfo}>
                      <h3 style={styles.recipeTitle}>{title}</h3>
                      <div style={styles.tags}>
                        {tags.map((t) => (
                          <span key={t} style={styles.tag}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <button
                        style={styles.recipeBtn}
                        onClick={() => router.push(`/recipe/${r.id}`)}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#FF9E00"; e.currentTarget.style.color = "#000"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff"; }}
                      >
                        See Recipe ➝
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      <Footer />
    </>
  );
}

const styles = {
  page: { padding: "20px 60px", fontFamily: "Poppins, sans-serif" },
  heading: { fontSize: 28, fontWeight: 600, textAlign: "center", marginBottom: 20 },
  highlight: { color: "#FF9E00" },

  inputRow: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 },
  input: {
    flex: 1,
    maxWidth: 320,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #ccc",
    outline: "none",
  },
  addBtn: {
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  clearBtn: { padding: "10px 16px", borderRadius: 999, border: "none", background: "#eee", cursor: "pointer" },

  // New pill layout 
  ingredientsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 24,
  },
  ingPill: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderRadius: 16,
    background: "#FF9E00",
    color: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  ingName: {
    fontWeight: 600,
    fontSize: 14,
    textTransform: "capitalize",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingRight: 8,
  },
  ingClose: {
    background: "transparent",
    color: "#fff",
    border: "2px solid #fff",
    width: 28,
    height: 28,
    borderRadius: "50%",
    cursor: "pointer",
    lineHeight: "24px",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },

  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    margin: "6px 2px 10px",
  },

  recipeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 },
  recipeCard: {
    background: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  recipeImg: { width: "100%", height: 160, objectFit: "cover" },
  recipeInfo: { padding: 12, display: "flex", flexDirection: "column", gap: 8, flex: 1 },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: "1.35",
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: 44,
  },
  tags: { display: "flex", gap: 8, flexWrap: "wrap", minHeight: 24 },
  tag: { background: "#f5f5f5", padding: "4px 10px", borderRadius: 12, fontSize: 12 },
  recipeBtn: {
    marginTop: "auto",
    padding: 10,
    borderRadius: 25,
    border: "none",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },

  skelImg: {
    width: "100%",
    height: 160,
    background: "linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)",
    backgroundSize: "400% 100%",
    animation: "shimmer 1.4s ease infinite",
  },
};
