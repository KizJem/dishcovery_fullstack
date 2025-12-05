"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import {
  FaUtensils, FaClock, FaFireAlt, FaHatCowboy, FaChevronLeft, FaDownload,
  FaHeart, FaRegHeart
} from "react-icons/fa";

const styles = {
  page: { padding: "20px 80px 20px", fontFamily: "Poppins, sans-serif" },

  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #eee",
    background: "#fff",
    cursor: "pointer",
    marginBottom: 16,
  },

  heroWrap: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    height: 260,
    marginBottom: 24,
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.55) 100%)",
  },
  titleBlock: {
    position: "absolute",
    left: 20,
    bottom: 18,
    color: "#fff",
  },
  title: { fontSize: 36, lineHeight: 1.1, margin: 0, fontWeight: 700 },
  highlight: { color: "#FF9E00" },

  metaRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  metaCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    borderRadius: 14,
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },

  tagsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    margin: "8px 0 18px",
  },
  tagsWrap: { display: "flex", gap: 10, flexWrap: "wrap" },
  pill: {
    padding: "6px 12px",
    background: "#FF9E00",
    borderRadius: 999,
    fontSize: 12,
    color: "#fff",
    fontWeight: 500,
  },
  dlBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 18px",
    borderRadius: 999,
    border: "none",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 340px",
    gap: 24,
  },

  sectionCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  h3: { margin: "0 0 14px 0", fontSize: 18 },

  ingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
  },
  ingItem: {
    padding: "8px 10px",
    fontSize: 14,
  },

  step: {
    display: "flex",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 12,
    background: "#FAFAFA",
    border: "1px solid #EFEFEF",
    alignItems: "center",
    maxWidth: "900px",
    margin: "0 0",
    textAlign: "left",
  },
  stepNum: {
    minWidth: 28,
    height: 28,
    borderRadius: "50%",
    background: "#fff",
    color: "#FF9E00",
    fontWeight: 700,
    display: "grid",
    placeItems: "center",
    marginTop: 2,
  },

  sideCard: {
    background: "#F9F9F9",
    border: "1px solid #eee",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
    position: "sticky",
    top: 90,
    alignSelf: "start",
  },
  sideTitle: { margin: "0 0 6px 0", fontSize: 20, fontWeight: 700 },
  sideKcal: { color: "#777", fontSize: 13, marginBottom: 8 },

  barRow: {
    display: "grid",
    gridTemplateColumns: "110px 1fr 48px",
    gap: 10,
    alignItems: "center",
    margin: "8px 0",
  },
  barTrack: {
    height: 8,
    borderRadius: 6,
    background: "#EDEDED",
    overflow: "hidden",
  },
  barFill: (w) => ({
    width: `${w}%`,
    height: "100%",
    background: "#FF9E00",
  }),
  barLabel: { fontSize: 13 },
  barVal: { fontSize: 12, color: "#555", textAlign: "right" },

  skel: {
    background:
      "linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)",
    backgroundSize: "400% 100%",
    animation: "shimmer 1.4s ease infinite",
  },
};

function useRecipeDetails(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_SPOONACULAR_KEY;
    if (!key) {
      setErr("Missing Spoonacular API key in .env.local");
      setLoading(false);
      return;
    }
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const url = new URL(`https://api.spoonacular.com/recipes/${id}/information`);
        url.searchParams.set("apiKey", key);
        url.searchParams.set("includeNutrition", "true");
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        if (e.name !== "AbortError") setErr("Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id]);

  return { data, loading, err };
}

function formatMinutes(mins) {
  if (!mins && mins !== 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function RecipeDetails() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const { data, loading, err } = useRecipeDetails(id);

  const [liked, setLiked] = useState(false);

  const get = (name) =>
    data?.nutrition?.nutrients?.find(
      (n) => n.name?.toLowerCase() === name.toLowerCase()
    );
  const calories = get("Calories")?.amount ?? null;

  const macroBars = useMemo(() => {
    const p = get("Protein")?.amount ?? 0;
    const c = get("Carbohydrates")?.amount ?? 0;
    const f = get("Fat")?.amount ?? 0;
    const total = p + c + f || 1;
    return [
      { label: "Protein", value: `${Math.round(p)} g`, pct: Math.min(100, (p / total) * 100) },
      { label: "Carbs", value: `${Math.round(c)} g`, pct: Math.min(100, (c / total) * 100) },
      { label: "Fat", value: `${Math.round(f)} g`, pct: Math.min(100, (f / total) * 100) },
    ];
  }, [data]);

  const micronutrients = [
    "Sugar",
    "Sodium",
    "Potassium",
    "Vitamin A",
    "Vitamin C",
    "Iron",
  ].map((n) => {
    const item = get(n);
    return {
      label: n,
      value: item ? `${Math.round(item.amount)} ${item.unit}` : "—",
      pct: 70,
    };
  });

  const steps =
    data?.analyzedInstructions?.[0]?.steps
      ?.map((s) => s.step)
      ?.filter(Boolean) ??
    (data?.instructions
      ? data.instructions
        .replace(/<\/?ol>|<\/?ul>|<\/?li>/g, " ")
        .split(/\d+\.\s|(?:Step\s*\d+:)/i)
        .map((s) => s.trim())
        .filter(Boolean)
      : []);

  const tagList = [
    ...(data?.dishTypes || []),
    ...(data?.diets || []),
    ...(data?.cuisines || []),
  ];

  return (
    <>
      <Navbar />
      <div className="nav-spacer" />

      <section style={styles.page}>
        <button style={styles.backBtn} onClick={() => router.back()}>
          <FaChevronLeft /> Back
        </button>

        {/* HERO */}
        <div style={styles.heroWrap}>
          {loading ? (
            <div style={{ ...styles.heroImg, ...styles.skel }} />
          ) : (
            <img
              src={data?.image || "/food.png"}
              alt={data?.title || "Recipe image"}
              style={styles.heroImg}
            />
          )}
          <div style={styles.heroOverlay} />
          <div style={styles.titleBlock}>
            <h1 style={styles.title}>
              {loading ? (
                <span
                  style={{
                    ...styles.skel,
                    width: 240,
                    height: 30,
                    display: "inline-block",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <>
                  {data?.title?.split(" ").slice(0, -1).join(" ") || "Recipe"}{" "}
                  <span style={styles.highlight}>
                    {data?.title?.split(" ").slice(-1)[0] || ""}
                  </span>
                </>
              )}
            </h1>
          </div>
          {/* Like icon */}
          <div style={{ position: "absolute", right: 16, top: 16 }}>
            <div
              title="Add to favorites"
              onClick={() => setLiked(!liked)}
              style={{ cursor: "pointer", transition: "transform .15s ease", padding: 6 }}
            >
              {liked ? (
                <FaHeart color="red" size={28} />
              ) : (
                <FaRegHeart color="#fff" size={28} style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,.4))" }} />
              )}
            </div>
          </div>
        </div>

        {/* META */}
        <div style={styles.metaRow}>
          <div style={styles.metaCard}>
            <FaUtensils color="#FF9E00" />
            <div>
              <div style={{ fontSize: 12, color: "#777" }}>Cuisine</div>
              <div style={{ fontWeight: 600 }}>{data?.cuisines?.[0] || "—"}</div>
            </div>
          </div>
          <div style={styles.metaCard}>
            <FaHatCowboy color="#FF9E00" />
            <div>
              <div style={{ fontSize: 12, color: "#777" }}>Servings</div>
              <div style={{ fontWeight: 600 }}>{data?.servings ?? "—"}</div>
            </div>
          </div>
          <div style={styles.metaCard}>
            <FaClock color="#FF9E00" />
            <div>
              <div style={{ fontSize: 12, color: "#777" }}>Prep Time</div>
              <div style={{ fontWeight: 600 }}>{formatMinutes(data?.preparationMinutes)}</div>
            </div>
          </div>
          <div style={styles.metaCard}>
            <FaClock color="#FF9E00" />
            <div>
              <div style={{ fontSize: 12, color: "#777" }}>Cook Time</div>
              <div style={{ fontWeight: 600 }}>{formatMinutes(data?.cookingMinutes)}</div>
            </div>
          </div>
          <div style={styles.metaCard}>
            <FaFireAlt color="#FF9E00" />
            <div>
              <div style={{ fontSize: 12, color: "#777" }}>Difficulty</div>
              <div style={{ fontWeight: 600 }}>
                {data?.readyInMinutes ? (data.readyInMinutes > 45 ? "Intermediate" : "Easy") : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* TAGS + DOWNLOAD */}
        <div style={styles.tagsRow}>
          <div style={styles.tagsWrap}>
            {tagList.slice(0, 12).map((t, i) => (
              <span key={i} style={styles.pill}>
                {t}
              </span>
            ))}
          </div>

          <button
            style={styles.dlBtn}
            onClick={() => window.print()}
            title="Download Recipe PDF"
          >
            <FaDownload /> Download Recipe PDF
          </button>
        </div>

        {/* MAIN GRID */}
        <div style={styles.mainGrid}>
          <div style={{ display: "grid", gap: 18 }}>
            {/* INGREDIENTS */}
            <div style={styles.sectionCard}>
              <h3 style={styles.h3}>Ingredients</h3>
              {loading ? (
                <div style={{ ...styles.skel, height: 140, borderRadius: 12 }} />
              ) : (
                <div style={styles.ingGrid}>
                  {(data?.extendedIngredients || []).map((ing) => (
                    <div key={ing.id || ing.original} style={styles.ingItem}>
                      {IngText(ing)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* INSTRUCTIONS */}
            <div style={styles.sectionCard}>
              <h3 style={styles.h3}>Cooking Instructions</h3>
              {loading ? (
                <div style={{ ...styles.skel, height: 220, borderRadius: 12 }} />
              ) : steps.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {steps.map((s, i) => (
                    <div key={i} style={styles.step}>
                      <div style={styles.stepNum}>{i + 1}</div>
                      <div style={{ flex: 1, fontSize: 14, lineHeight: 1.6 }}>{s}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#777" }}>No instructions available.</div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside style={styles.sideCard}>
            <h3 style={styles.sideTitle}>Nutritional Info</h3>
            <div style={styles.sideKcal}>
              {calories ? `${Math.round(calories)} kcal` : "—"}
            </div>

            {/* Macro bars */}
            {macroBars.map((m) => (
              <div key={m.label} style={styles.barRow}>
                <div style={styles.barLabel}>{m.label}</div>
                <div style={styles.barTrack}>
                  <div style={styles.barFill(m.pct)} />
                </div>
                <div style={styles.barVal}>{m.value}</div>
              </div>
            ))}

            <div style={{ height: 6 }} />

            {/* Selected micro list */}
            {micronutrients.map((n) => (
              <div key={n.label} style={styles.barRow}>
                <div style={styles.barLabel}>{n.label}</div>
                <div style={styles.barTrack}>
                  <div style={styles.barFill(n.pct)} />
                </div>
                <div style={styles.barVal}>{n.value}</div>
              </div>
            ))}
          </aside>
        </div>

        {err && (
          <p style={{ color: "#b00020", marginTop: 16 }}>
            {err}
          </p>
        )}
      </section>
      <Footer />
    </>
  );
}

function IngText(ing) {
  if (!ing) return "";
  if (ing.original) return ing.original;
  const amount = ing.amount ? Math.round(ing.amount * 10) / 10 : "";
  const unit = ing.unit || "";
  const name = ing.name || "";
  return [amount, unit, name].filter(Boolean).join(" ");
}
