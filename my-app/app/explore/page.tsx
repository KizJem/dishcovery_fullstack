"use client";

// Explore page - converted for Next.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { onAuthStateChange } from "../../lib/auth";
import {
  FaHeart, FaRegHeart, FaThLarge, FaCarrot, FaUtensils,
  FaIceCream, FaGlassMartiniAlt, FaLeaf, FaSeedling, FaAppleAlt, FaBookmark, FaRegBookmark,
} from "react-icons/fa";

export default function Explore() {
  const [liked, setLiked] = useState<any>({});
  const [favorites, setFavorites] = useState<any>({});
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState("All Recipes");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collections, setCollections] = useState<any>({});
  const [showAddToCollectionDialog, setShowAddToCollectionDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const router = useRouter();

  // one-time keyframes injection for skeleton shimmer
  useEffect(() => {
    const id = "shimmer-anim";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = "@keyframes shimmer{0%{background-position:100% 0}100%{background-position:0 0}}";
    document.head.appendChild(style);
  }, []);

  const categories = [
    { name: "All Recipes", icon: <FaThLarge /> },
    { name: "Appetizers", icon: <FaCarrot /> },
    { name: "Main Dishes", icon: <FaUtensils /> },
    { name: "Desserts", icon: <FaIceCream /> },
    { name: "Drinks", icon: <FaGlassMartiniAlt /> },
    { name: "Vegetarian", icon: <FaLeaf /> },
    { name: "Vegan", icon: <FaSeedling /> },
    { name: "Healthy", icon: <FaAppleAlt /> },
  ];

  const toggleLike = (id: string | number) => setLiked((p: any) => ({ ...p, [id]: !p[id] }));

  // Persist favorite recipes to localStorage per-user (or guest)
  const storageKey = (userId?: string) => `dishcovery_favorites_${userId || "guest"}`;
  const collectionsKey = (userId?: string) => `dishcovery_collections_${userId || "guest"}`;

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const subscription = onAuthStateChange((u) => setUser(u));
    return () => subscription.unsubscribe();
  }, []);

  // Load favorites for current user from localStorage
  useEffect(() => {
    const key = storageKey(user?.id);
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      setFavorites(parsed || {});
      // set liked map from favorites
      const likedMap = Object.keys(parsed || {}).reduce((acc, id) => ({ ...acc, [id]: true }), {});
      setLiked(likedMap);
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  }, [user]);

  // Load collections for current user from Supabase Database
  useEffect(() => {
    if (!user?.id) return;
    
    async function loadCollections() {
      try {
        const { getUserCollections } = await import('../../lib/database');
        const collectionsData = await getUserCollections(user.id);
        
        // Convert to the format expected by the UI
        const collectionsMap: { [key: string]: any } = {};
        collectionsData.forEach((col) => {
          collectionsMap[col.id] = {
            id: col.id,
            name: col.title,
            description: col.description || "",
            coverImage: col.cover_image_url || "",
            recipes: [],
            createdAt: new Date(col.created_at).getTime(),
          };
        });
        setCollections(collectionsMap);
      } catch (e) {
        console.error("Failed to load collections from Supabase", e);
        setCollections({});
      }
    }
    
    loadCollections();
  }, [user]);

  // Toggle and persist favorite
  const handleToggleFavorite = (recipe: any) => {
    // If user isn't signed in, ask them to sign in first
    if (!user) {
      setPendingRecipe(recipe);
      setShowSignInModal(true);
      return;
    }
    const id = String(recipe.id);
    const key = storageKey(user?.id);
    setFavorites((prev: any) => {
      const next = { ...(prev || {}) };
      if (next[id]) {
        delete next[id];
      } else {
        // store minimal data needed for profile view
        next[id] = {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image || "/food.png",
          tags: buildTags(recipe),
          addedAt: Date.now(),
        };
      }
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save favorites", e);
      }
      // keep liked state in sync
      setLiked((p: any) => ({ ...p, [id]: !!next[id] }));
      return next;
    });
  };

  const apiParams = useMemo(() => {
    switch (activeCategory) {
      case "Appetizers": return { type: "appetizer" };
      case "Main Dishes": return { type: "main course" };
      case "Desserts": return { type: "dessert" };
      case "Drinks": return { type: "beverage" };
      case "Vegetarian": return { diet: "vegetarian" };
      case "Vegan": return { diet: "vegan" };
      default: return {};
    }
  }, [activeCategory]);

  useEffect(() => {
    const rawKey = process.env.NEXT_PUBLIC_SPOONACULAR_KEY;
    const key = (typeof rawKey === "string" ? rawKey.trim() : "");
    if (!key) {
      setError("Missing Spoonacular API key. Add NEXT_PUBLIC_SPOONACULAR_KEY to .env.local and restart.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const base = new URL("https://api.spoonacular.com/recipes/complexSearch");
        base.searchParams.set("apiKey", key);
        base.searchParams.set("number", "24");
        base.searchParams.set("addRecipeInformation", "true");
        base.searchParams.set("instructionsRequired", "true");
        base.searchParams.set("imageType", "jpg");

        if (!submittedQuery.trim()) base.searchParams.set("sort", "random");
        if (apiParams.type) base.searchParams.set("type", apiParams.type);
        if (apiParams.diet) base.searchParams.set("diet", apiParams.diet);
        if (submittedQuery.trim()) base.searchParams.set("query", submittedQuery.trim());

        const res = await fetch(base.toString(), { signal: controller.signal });

        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const errJson = await res.json();
            if (errJson?.message) msg = errJson.message;
          } catch {}
          if (res.status === 401) setError("Invalid API key. Double-check NEXT_PUBLIC_SPOONACULAR_KEY.");
          else if (res.status === 402) setError("Spoonacular daily quota exceeded (HTTP 402). Try again tomorrow or upgrade your plan.");
          else if (res.status === 429) setError("Too many requests (HTTP 429). Slow down a bit and try again.");
          else setError(`Failed to load recipes: ${msg}`);
          setItems([]);
          return;
        }

        const data = await res.json();
        let results = data?.results ?? [];
        if (activeCategory === "Healthy") {
          results = results.filter((r: any) => r.veryHealthy || (r.healthScore ?? 0) >= 60);
        }
        setItems(results);
      } catch (e) {
        if ((e as any).name !== "AbortError") {
          console.error(e);
          setError("Network error while loading recipes. Check your internet and try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [activeCategory, apiParams, submittedQuery]);

  const buildTags = (r: any) => {
    const tags = [];
    if (Array.isArray(r.diets)) {
      if (r.diets.includes("vegan")) tags.push("Vegan");
      if (r.diets.some((d: any) => d.includes("vegetarian"))) tags.push("Vegetarian");
    }
    if (r.veryHealthy || r.healthScore >= 60) tags.push("Healthy");
    if (r.readyInMinutes <= 30) tags.push("Quick");
    return tags.slice(0, 3);
  };

  const handleAddToCollection = (recipe: any) => {
    if (!user) {
      setPendingRecipe(recipe);
      setShowSignInModal(true);
      return;
    }
    setSelectedRecipe(recipe);
    // Check which collections already have this recipe
    const recipeInCollections = Object.keys(collections).filter((cid) =>
      collections[cid].recipes?.some((r: any) => r.id === recipe.id)
    );
    setSelectedCollections(recipeInCollections);
    setShowAddToCollectionDialog(true);
  };

  const handleConfirmAddToCollection = async () => {
    if (!selectedRecipe || !user?.id) return;
    
    try {
      const { addRecipeToCollection } = await import('../../lib/database');
      
      // Add recipe to each selected collection in Supabase
      for (const collectionId of selectedCollections) {
        const recipeData = {
          id: String(selectedRecipe.id),
          title: selectedRecipe.title,
          image: selectedRecipe.image || "/food.png",
          description: selectedRecipe.summary || "",
        };
        
        await addRecipeToCollection(collectionId, recipeData);
      }
      
      // Reload collections to reflect changes
      const { getUserCollections } = await import('../../lib/database');
      const collectionsData = await getUserCollections(user.id);
      
      const collectionsMap: { [key: string]: any } = {};
      collectionsData.forEach((col) => {
        collectionsMap[col.id] = {
          id: col.id,
          name: col.title,
          description: col.description || "",
          coverImage: col.cover_image_url || "",
          recipes: [],
          createdAt: new Date(col.created_at).getTime(),
        };
      });
      setCollections(collectionsMap);
      
      console.log("✅ Recipe added to collections successfully");
    } catch (e) {
      console.error("❌ Failed to add recipe to collections:", e);
      alert("Failed to add recipe to collections");
    }

    setShowAddToCollectionDialog(false);
    setSelectedRecipe(null);
    setSelectedCollections([]);
  };

  const toggleCollectionSelection = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const onSubmitSearch = (e: any) => {
    e.preventDefault();
    setSubmittedQuery(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSubmittedQuery("");
  };

  return (
    <>
      <Navbar />
      <div className="nav-spacer" />

      <div style={styles.page}>
        {/* What to Cook? */}
        <section style={styles.recipeContainer}>
          <h2 style={styles.heading}>
            What to <span style={styles.highlight}>Cook?</span>
          </h2>

          {/* Search */}
          <form onSubmit={onSubmitSearch} style={styles.searchRow} role="search" aria-label="Recipe search">
            <div style={styles.searchWrap}>
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  style={styles.clearInside}
                >
                  ×
                </button>
              )}
            </div>
            <button type="submit" style={styles.searchBtn}>Search</button>
          </form>

          {/* Categories */}
          <div style={styles.categories}>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                style={{
                  ...styles.categoryButton,
                  ...(activeCategory === cat.name ? styles.activeCategory : {}),
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span style={{ marginRight: 8, color: "#FF9E00" }}>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {error && (
            <p style={{ textAlign: "center", color: "#b00020", marginTop: -20, marginBottom: 20 }}>
              {error}
            </p>
          )}

          {/* Recipes Grid */}
          <div style={styles.recipeGrid}>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={`skel-${i}`} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div style={{ width: 170, height: 16, background: "#eee", borderRadius: 6 }} />
                      <span style={{ width: 18, height: 18, background: "#eee", borderRadius: "50%" }} />
                    </div>
                    <div style={styles.skelImg} />
                    <div style={styles.tags}>
                      <span style={styles.tag}> </span>
                      <span style={styles.tag}> </span>
                    </div>
                    <button style={styles.seeRecipe} disabled>See Recipe →</button>
                  </div>
                ))
              : items.map((r) => {
                  const img = r.image || "/food.png";
                  const title = r.title || "Untitled Recipe";
                  const id = r.id;
                  const tags = buildTags(r);

                  return (
                    <div
                      key={id}
                      style={styles.card}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.transition = "transform 0.3s ease";
                      }}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      <div style={styles.cardHeader}>
                        <h3 style={styles.titleClamp}>{title}</h3>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                          <button
                            onClick={() => handleAddToCollection(r)}
                            style={styles.heartButton}
                            aria-label="Add to collection"
                          >
                            <FaRegBookmark size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleFavorite(r)}
                            style={styles.heartButton}
                            aria-label="like"
                          >
                            {liked[id] ? <FaHeart color="red" size={18} /> : <FaRegHeart size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* FIXED-HEIGHT IMAGE = ALIGNED ROWS */}
                      <img src={img} alt={title} style={styles.cardImg} loading="lazy" />

                      <div style={styles.tags}>
                        {tags.map((t, i) => (
                          <span key={i} style={styles.tag}>{t}</span>
                        ))}
                      </div>

                      <button
                        style={styles.seeRecipe}
                        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#FF9E00"; (e.target as HTMLButtonElement).style.color = "#000"; }}
                        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "#000"; (e.target as HTMLButtonElement).style.color = "#fff"; }}
                        onClick={() => router.push(`/recipe/${id}`)}
                      >
                        See Recipe ➝
                      </button>
                    </div>
                  );
                })}
          </div>
        </section>
      </div>

        {/* Sign-in required modal for unauthenticated favorites */}
        {showSignInModal && (
          <div style={styles.modalOverlay} role="dialog" aria-modal="true">
            <div style={styles.modalBox}>
              <h2 style={{ marginTop: 0 }}>Sign In Required</h2>
              <p style={{ color: "#444" }}>You need to sign in to your account before you can add this to your favorites.</p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 18 }}>
                <button
                  onClick={() => { setShowSignInModal(false); setPendingRecipe(null); }}
                  style={styles.modalCancel}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowSignInModal(false); setPendingRecipe(null); router.push('/'); }}
                  style={styles.modalConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add to Collection Dialog */}
        {showAddToCollectionDialog && selectedRecipe && (
          <div
            style={styles.modalOverlay}
            onClick={() => {
              setShowAddToCollectionDialog(false);
              setSelectedRecipe(null);
              setSelectedCollections([]);
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 0,
                maxWidth: 720,
                width: "90%",
                boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
                display: "flex",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left side - Recipe preview */}
              <div style={{ flex: "0 0 320px", background: "#f9f9f9", padding: 24 }}>
                <img
                  src={selectedRecipe.image || "/food.png"}
                  alt={selectedRecipe.title}
                  style={{
                    width: "100%",
                    height: 240,
                    borderRadius: 12,
                    objectFit: "cover",
                    marginBottom: 16,
                  }}
                />
                <h3 style={{ margin: "0 0 8px 0", fontSize: 18 }}>
                  {selectedRecipe.title}
                </h3>
              </div>

              {/* Right side - Collections list */}
              <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: 20 }}>Add to collections</h3>

                {Object.keys(collections).length === 0 ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "#666", textAlign: "center" }}>
                      No collections yet. Create one from your profile!
                    </p>
                  </div>
                ) : (
                  <div style={{ flex: 1, overflowY: "auto", marginBottom: 20 }}>
                    {Object.values(collections).map((col: any) => (
                      <label
                        key={col.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "background 0.2s",
                          marginBottom: 8,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(col.id)}
                          onChange={() => toggleCollectionSelection(col.id)}
                          style={{
                            width: 18,
                            height: 18,
                            cursor: "pointer",
                          }}
                        />
                        <span style={{ fontSize: 15, fontWeight: 500 }}>{col.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowAddToCollectionDialog(false);
                    setSelectedRecipe(null);
                    setSelectedCollections([]);
                    router.push("/profile");
                  }}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 25,
                    border: "1px solid #FF9E00",
                    background: "#fff",
                    color: "#FF9E00",
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  New Collection +
                </button>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => {
                      setShowAddToCollectionDialog(false);
                      setSelectedRecipe(null);
                      setSelectedCollections([]);
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      borderRadius: 12,
                      border: "1px solid #ddd",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAddToCollection}
                    disabled={selectedCollections.length === 0}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      borderRadius: 12,
                      border: "none",
                      background: selectedCollections.length > 0 ? "#FF9E00" : "#ccc",
                      color: "#fff",
                      cursor: selectedCollections.length > 0 ? "pointer" : "not-allowed",
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
    </>
  );
}

const styles = {
  page: { padding: "10px 80px", fontFamily: "'Poppins', sans-serif" },

  recipeContainer: { marginTop: 10 },
  heading: { fontSize: 28, fontWeight: 600, textAlign: "center" as const, marginBottom: 12 },
  highlight: { color: "#FF9E00" },

  searchRow: {
    display: "flex", justifyContent: "center", alignItems: "center",
    gap: 12, margin: "10px 0 26px", padding: "0 16px", flexWrap: "wrap" as const,
  },
  searchWrap: { position: "relative" as const, width: "min(640px, 100%)" },
  searchInput: {
    width: "100%", height: 44, padding: "0 48px 0 14px",
    border: "1px solid #e5e5e5", borderRadius: 9999, fontSize: 14,
    outline: "none", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", boxSizing: "border-box" as const,
  },
  clearInside: {
    position: "absolute" as const, right: 12, top: "50%", transform: "translateY(-50%)",
    border: "none", background: "transparent", fontSize: 22, lineHeight: 1, cursor: "pointer", color: "#999",
  },
  searchBtn: {
    height: 44, padding: "0 20px", border: "none", borderRadius: 9999,
    background: "#000", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
  },

  categories: { display: "flex", flexWrap: "wrap" as const, gap: 12, justifyContent: "center", marginBottom: 24 },
  categoryButton: {
    display: "flex", alignItems: "center", padding: "10px 20px",
    borderRadius: 25, border: "none", background: "#f1f1f1", cursor: "pointer",
    fontSize: 14, fontWeight: 500, transition: "transform 0.2s ease",
  },
  activeCategory: { background: "#000", color: "#fff" },

  // Uniform grid; cards start from top
  recipeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    alignItems: "start",
  },

  // Card uses flex column so the button can stick to the bottom via marginTop:auto
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    padding: 15,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    transition: "transform 0.3s ease",
  },

  // 🔒 FIX: Reserve equal space for titles so images align
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    minHeight: 48, // consistent header height (2 lines of title + heart)
  },
  heartButton: { background: "none", border: "none", cursor: "pointer", flexShrink: 0 },

  // 2-line clamp and equal block height
  titleClamp: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: "1.35",
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
    minHeight: 44, // equal title area for all cards
  },

  // 🔒 FIX: Fixed image height so all pictures line up perfectly
  cardImg: {
    width: "100%",
    height: 180,          // <- adjust if you want taller/shorter
    flexShrink: 0,
    borderRadius: 12,
    objectFit: "cover" as const,
    objectPosition: "center",
    display: "block",
  },

  // keep tags block consistent too
  tags: { display: "flex", gap: 8, flexWrap: "wrap" as const, minHeight: 28 },
  tag: { background: "#f5f5f5", padding: "4px 10px", borderRadius: 12, fontSize: 12 },

  // push to bottom so card heights feel consistent
  seeRecipe: {
    marginTop: "auto",
    padding: 10,
    borderRadius: 25,
    border: "none",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.3s ease",
  },

  // skeleton image (same fixed height as real image)
  skelImg: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    background: "linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)",
    backgroundSize: "400% 100%",
    animation: "shimmer 1.4s ease infinite",
  },
  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modalBox: {
    width: "min(520px, 92%)",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
  },
  modalCancel: {
    padding: "10px 20px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },
  modalConfirm: {
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    background: "#FF9E00",
    color: "#fff",
    cursor: "pointer",
  },
};
