"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import {
  FaUtensils, FaClock, FaFireAlt, FaHatCowboy, FaChevronLeft, FaDownload,
  FaHeart, FaRegHeart, FaInstagram, FaTwitter, FaPinterest, FaFacebook
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
    position: "relative" as const,
    borderRadius: 16,
    overflow: "hidden",
    height: 260,
    marginBottom: 24,
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
  },
  heroOverlay: {
    position: "absolute" as const,
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.55) 100%)",
  },
  titleBlock: {
    position: "absolute" as const,
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
  tagsWrap: { display: "flex", gap: 10, flexWrap: "wrap" as const },
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
    gridTemplateColumns: "minmax(0,1fr) 280px",
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
    textAlign: "left" as const,
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
    position: "sticky" as const,
    top: 90,
    alignSelf: "start",
  },
  sideTitle: { margin: "0 0 6px 0", fontSize: 20, fontWeight: 700 },
  sideKcal: { color: "#777", fontSize: 13, marginBottom: 8 },

  barRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "8px 0",
  },
  barTrack: {
    height: 8,
    borderRadius: 6,
    background: "#EDEDED",
    overflow: "hidden",
  },
  barFill: (w: number) => ({
    width: `${w}%`,
    height: "100%",
    background: "#FF9E00",
  }),
  barLabel: { fontSize: 13 },
  barVal: { fontSize: 12, color: "#555", textAlign: "right" as const },

  skel: {
    background:
      "linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)",
    backgroundSize: "400% 100%",
    animation: "shimmer 1.4s ease infinite",
  },
};

function useRecipeDetails(id: string | string[]) {
  const [data, setData] = useState<any>(null);
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
      } catch (e: any) {
        if (e.name !== "AbortError") setErr("Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id]);

  return { data, loading, err };
}

function formatMinutes(mins: number | undefined) {
  if (!mins && mins !== 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function RecipeDetails() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, loading, err } = useRecipeDetails(id);

  const [liked, setLiked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const get = (name: string) =>
    data?.nutrition?.nutrients?.find(
      (n: any) => n.name?.toLowerCase() === name.toLowerCase()
    );
  const calories = get("Calories")?.amount ?? null;

  const downloadRecipePDF = async () => {
    if (!data || downloading) return;
    setDownloading(true);
    
    try {
      // Create a hidden div for PDF content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '800px';
      pdfContainer.style.background = '#fff';
      pdfContainer.style.fontFamily = 'Poppins, sans-serif';
      pdfContainer.style.padding = '40px';
      
      // Build the PDF content HTML
      const tagList = [
        ...(data?.dishTypes || []),
        ...(data?.diets || []),
        ...(data?.cuisines || []),
      ];
      
      const ingredients = data?.extendedIngredients || [];
      const halfIndex = Math.ceil(ingredients.length / 2);
      const ingredientsCol1 = ingredients.slice(0, halfIndex);
      const ingredientsCol2 = ingredients.slice(halfIndex);
      
      const imageUrl = data?.image || '/food.png';
      
      pdfContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
          <img id="recipe-pdf-image" src="${imageUrl}" 
               style="width: 400px; height: 250px; object-fit: cover; border-radius: 16px; margin: 0 auto; display: block;" 
               crossorigin="anonymous" />
        </div>
        
        <h1 style="text-align: center; font-size: 32px; margin: 16px 0; font-weight: 700;">
          <span style="color: #000;">${data?.title?.split(" ").slice(0, -1).join(" ") || "Recipe"}</span>
          <span style="color: #FF9E00;"> ${data?.title?.split(" ").slice(-1)[0] || ""}</span>
        </h1>
        
        <div style="display: flex; justify-content: space-between; margin: 20px 0; gap: 12px;">
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 11px; color: #777; margin-bottom: 4px;">Cuisine</div>
            <div style="font-weight: 600; font-size: 14px;">${data?.cuisines?.[0] || "American Food"}</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 11px; color: #777; margin-bottom: 4px;">Servings</div>
            <div style="font-weight: 600; font-size: 14px;">${data?.servings ? data.servings + " persons" : "—"}</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 11px; color: #777; margin-bottom: 4px;">Prep Time</div>
            <div style="font-weight: 600; font-size: 14px;">${formatMinutes(data?.preparationMinutes)}</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 11px; color: #777; margin-bottom: 4px;">Cook Time</div>
            <div style="font-weight: 600; font-size: 14px;">${formatMinutes(data?.cookingMinutes)}</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 11px; color: #777; margin-bottom: 4px;">Difficulty</div>
            <div style="font-weight: 600; font-size: 14px;">${data?.readyInMinutes ? (data.readyInMinutes > 45 ? "Intermediate Level" : "Easy") : "—"}</div>
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">Tags</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${tagList.slice(0, 8).map((t: string) => `
              <span style="padding: 6px 12px; background: #FF9E00; border-radius: 999px; 
                           font-size: 11px; color: #fff; font-weight: 500;">${t}</span>
            `).join('')}
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 240px; gap: 20px; margin-top: 24px;">
          <div>
            <div style="background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; 
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Ingredients</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>
                  ${ingredientsCol1.map((ing: any) => `
                    <div style="padding: 6px 0; font-size: 13px; line-height: 1.4;">
                      ${IngText(ing)}
                    </div>
                  `).join('')}
                </div>
                <div>
                  ${ingredientsCol2.map((ing: any) => `
                    <div style="padding: 6px 0; font-size: 13px; line-height: 1.4;">
                      ${IngText(ing)}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
          
          <div style="background: #F9F9F9; border: 1px solid #eee; border-radius: 12px; 
                      padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
            <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">Nutritional Info</h3>
            <div style="font-size: 12px; color: #777; margin-bottom: 8px;">
              ${calories ? Math.round(calories) + " kcal" : "—"}
            </div>
            ${macroBars.map((m: any) => `
              <div style="display: flex; justify-content: space-between; margin: 6px 0; font-size: 12px;">
                <span>${m.label}</span>
                <span style="color: #555;">${m.value}</span>
              </div>
            `).join('')}
            ${micronutrients.map((n: any) => `
              <div style="display: flex; justify-content: space-between; margin: 6px 0; font-size: 12px;">
                <span>${n.label}</span>
                <span style="color: #555;">${n.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="background: #fff; border-radius: 12px; padding: 16px; margin-top: 16px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Cooking Instructions</h3>
          <div style="display: grid; gap: 8px;">
            ${steps.map((s: string, i: number) => `
              <div style="display: flex; gap: 10px; padding: 10px 12px; border-radius: 10px; 
                          background: #FAFAFA; border: 1px solid #EFEFEF; align-items: flex-start;">
                <div style="min-width: 24px; height: 24px; border-radius: 50%; background: #fff; 
                            color: #FF9E00; font-weight: 700; display: flex; align-items: center; 
                            justify-content: center; font-size: 12px; flex-shrink: 0; margin-top: 2px;">
                  ${i + 1}
                </div>
                <div style="flex: 1; font-size: 13px; line-height: 1.5;">${s}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee;">
          <div style="font-size: 13px; color: #777; margin-bottom: 8px;">
            © ${new Date().getFullYear()} Dishcovery | All Rights Reserved
          </div>
          <div style="display: flex; justify-content: center; gap: 16px; font-size: 18px;">
            <span style="color: #777;">ⓘ</span>
            <span style="color: #777;">⊕</span>
            <span style="color: #777;">⊞</span>
            <span style="color: #777;">ⓕ</span>
          </div>
        </div>
      `;
      
      document.body.appendChild(pdfContainer);
      
      // Wait for the image to load
      const img = document.getElementById('recipe-pdf-image') as HTMLImageElement;
      if (img && !img.complete) {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails to load
          setTimeout(resolve, 3000); // Timeout after 3 seconds
        });
      }
      
      // Wait a bit more for rendering
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate canvas from the container
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
      });
      
      // Remove the temporary container
      document.body.removeChild(pdfContainer);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${data.title.replace(/\s+/g, '_')}_recipe.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

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
      ?.map((s: any) => s.step)
      ?.filter(Boolean) ??
    (data?.instructions
      ? data.instructions
        .replace(/<\/?ol>|<\/?ul>|<\/?li>/g, " ")
        .split(/\d+\.\s|(?:Step\s*\d+:)/i)
        .map((s: string) => s.trim())
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
            {tagList.slice(0, 12).map((t: string, i: number) => (
              <span key={i} style={styles.pill}>
                {t}
              </span>
            ))}
          </div>

          <button
            style={styles.dlBtn}
            onClick={downloadRecipePDF}
            title="Download Recipe PDF"
            disabled={downloading || loading}
          >
            <FaDownload /> {downloading ? "Generating PDF..." : "Download Recipe PDF"}
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
                  {(data?.extendedIngredients || []).map((ing: any) => (
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
                  {steps.map((s: string, i: number) => (
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
                <div style={styles.barVal}>{m.value}</div>
              </div>
            ))}

            <div style={{ height: 6 }} />

            {/* Selected micro list */}
            {micronutrients.map((n) => (
              <div key={n.label} style={styles.barRow}>
                <div style={styles.barLabel}>{n.label}</div>
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

function IngText(ing: any) {
  if (!ing) return "";
  if (ing.original) return ing.original;
  const amount = ing.amount ? Math.round(ing.amount * 10) / 10 : "";
  const unit = ing.unit || "";
  const name = ing.name || "";
  return [amount, unit, name].filter(Boolean).join(" ");
}
