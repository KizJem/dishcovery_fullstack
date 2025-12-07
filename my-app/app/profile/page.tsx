"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CollectionForm from "../../components/CollectionForm";
import { onAuthStateChange } from "../../lib/auth";
import { getUserCollections, createCollection, deleteCollection, getCollectionRecipes } from "../../lib/database";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any>({});
  const [sort, setSort] = useState<string>("newest");
  const [sortOpen, setSortOpen] = useState<boolean>(false);
  const [collections, setCollections] = useState<any>({});
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const router = useRouter();

  const storageKey = (userId?: string) => `dishcovery_favorites_${userId || "guest"}`;
  const collectionsKey = (userId?: string) => `dishcovery_collections_${userId || "guest"}`;

  useEffect(() => {
    const subscription = onAuthStateChange((u) => setUser(u));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const key = storageKey(user?.id);
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      setFavorites(parsed || {});
    } catch (e) {
      console.error("Failed to load favorites for profile", e);
      setFavorites({});
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    
    // Load collections from Supabase Database
    async function loadCollections() {
      try {
        console.log("📥 Loading collections from Supabase...");
        const collectionsData = await getUserCollections(user.id);
        console.log("✅ Loaded collections:", collectionsData);
        
        // Convert to the format expected by the UI and load recipes for each
        const collectionsMap: any = {};
        
        // Load all collections with their recipes
        await Promise.all(collectionsData.map(async (col: any) => {
          try {
            const recipes = await getCollectionRecipes(col.id);
            collectionsMap[col.id] = {
              id: col.id,
              title: col.title,
              name: col.title, // Keep both for compatibility
              description: col.description || "",
              cover_image_url: col.cover_image_url || "",
              coverImage: col.cover_image_url || "", // Keep both for compatibility
              recipes: recipes.map((r: any) => ({
                id: r.id,
                title: r.title,
                image: r.image_url,
                image_url: r.image_url,
              })),
              createdAt: new Date(col.created_at).getTime(),
              created_at: col.created_at,
            };
          } catch (recipeError) {
            console.error(`Failed to load recipes for collection ${col.id}:`, recipeError);
            // Still add the collection even if recipes fail to load
            collectionsMap[col.id] = {
              id: col.id,
              title: col.title,
              name: col.title,
              description: col.description || "",
              cover_image_url: col.cover_image_url || "",
              coverImage: col.cover_image_url || "",
              recipes: [],
              createdAt: new Date(col.created_at).getTime(),
              created_at: col.created_at,
            };
          }
        }));
        
        setCollections(collectionsMap);
      } catch (e) {
        console.error("❌ Failed to load collections from Supabase:", e);
        setCollections({});
      }
    }
    
    loadCollections();
  }, [user]);

  const saveFavorites = (next: any) => {
    const key = storageKey(user?.id);
    try {
      localStorage.setItem(key, JSON.stringify(next || {}));
    } catch (e) {
      console.error("Failed to save favorites for profile", e);
    }
  };

  const saveCollections = (next: any) => {
    const key = collectionsKey(user?.id);
    try {
      localStorage.setItem(key, JSON.stringify(next || {}));
    } catch (e) {
      console.error("Failed to save collections", e);
    }
  };

const profileStyles = {
  recipeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    alignItems: "start",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    padding: 15,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    transition: "transform 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    minHeight: 48,
  },
  heartButton: { background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#FF4D6D", flexShrink: 0 },
  titleClamp: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: "1.35",
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as any,
    overflow: "hidden",
    minHeight: 44,
  },
  cardImg: {
    width: "100%",
    height: 180,
    flexShrink: 0,
    borderRadius: 12,
    objectFit: "cover" as const,
    display: "block",
  },
  tags: { display: "flex", gap: 8, flexWrap: "wrap" as const, minHeight: 28, marginTop: 6 },
  tag: { background: "#f5f5f5", padding: "4px 10px", borderRadius: 12, fontSize: 12 },
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
    transition: "all 0.2s ease",
  },
};

  const handleUnfavorite = (id: string | number) => {
    const sid = String(id);
    setFavorites((prev: any) => {
      const next = { ...(prev || {}) };
      delete next[sid];
      saveFavorites(next);
      return next;
    });
  };

  const sortedList = (() => {
    const arr: any[] = Object.values(favorites || {}).slice();
    switch (sort) {
      case "oldest":
        return arr.sort((a: any, b: any) => (a.addedAt || 0) - (b.addedAt || 0));
      case "az":
        return arr.sort((a: any, b: any) => (a.title || "").localeCompare(b.title || ""));
      case "za":
        return arr.sort((a: any, b: any) => (b.title || "").localeCompare(a.title || ""));
      case "newest":
      default:
        return arr.sort((a: any, b: any) => (b.addedAt || 0) - (a.addedAt || 0));
    }
  })();

  return (
    <>
      <Navbar />
      <div className="nav-spacer" />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px" }}>
        <section style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img
            src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "/food.png"}
            alt="avatar"
            style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
          />
          <div>
            <h2 style={{ color: "#FF9E00", margin: 0 }}>
              {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "user 01"}
            </h2>
            <p style={{ marginTop: 6, color: "#666" }}>✏️ Edit profile</p>
          </div>
        </section>

        <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #ddd" }} />

        <h3 style={{ color: "#FF9E00" }}>My favorites</h3>
        <p style={{ color: "#666" }}>Your favorite recipes will show up here.</p>

        {/* Favorites grid + sort control */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setSortOpen((s) => !s)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid #eee", background: "#fff", cursor: "pointer" }}
                aria-expanded={sortOpen}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M6 12h12M10 18h4" stroke="#222" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontWeight: 600 }}>{sort === "newest" ? "Newest" : sort === "oldest" ? "Oldest" : sort === "az" ? "A - Z" : "Z - A"}</span>
              </button>

              {sortOpen && (
                <div style={{ position: "absolute", left: 0, top: 42, background: "#fff", border: "1px solid #eee", boxShadow: "0 6px 18px rgba(0,0,0,0.08)", borderRadius: 8, overflow: "hidden", zIndex: 1200 }}>
                  <button className="dropdown-item" onClick={() => { setSort("newest"); setSortOpen(false); }} style={{ display: 'block', padding: '8px 12px', width: '200px', textAlign: 'left', background: 'transparent', border: 'none' }}>Newest</button>
                  <button className="dropdown-item" onClick={() => { setSort("oldest"); setSortOpen(false); }} style={{ display: 'block', padding: '8px 12px', width: '200px', textAlign: 'left', background: 'transparent', border: 'none' }}>Oldest</button>
                  <button className="dropdown-item" onClick={() => { setSort("az"); setSortOpen(false); }} style={{ display: 'block', padding: '8px 12px', width: '200px', textAlign: 'left', background: 'transparent', border: 'none' }}>A - Z</button>
                  <button className="dropdown-item" onClick={() => { setSort("za"); setSortOpen(false); }} style={{ display: 'block', padding: '8px 12px', width: '200px', textAlign: 'left', background: 'transparent', border: 'none' }}>Z - A</button>
                </div>
              )}
            </div>
          </div>

          {sortedList.length === 0 ? (
            <p style={{ color: "#666", marginTop: 12 }}>You have no favorite recipes yet. Click the ♥ on Explore to add some!</p>
          ) : (
            <div style={profileStyles.recipeGrid}>
              {sortedList.map((r: any) => (
                <div key={r.id} style={profileStyles.card}>
                  <div style={profileStyles.cardHeader}>
                    <h3 style={profileStyles.titleClamp}>{r.title}</h3>
                    <button onClick={() => handleUnfavorite(r.id)} style={profileStyles.heartButton} aria-label="unfavorite">❤</button>
                  </div>
                  <img src={r.image || "/food.png"} alt={r.title} style={profileStyles.cardImg} />
                  <div style={profileStyles.tags}>{(r.tags || []).map((t: string, i: number) => <span key={i} style={profileStyles.tag}>{t}</span>)}</div>
                  <button style={profileStyles.seeRecipe} onClick={() => router.push(`/recipe/${r.id}`)}>See Recipe ➝</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Collection Section */}
        <section style={{ marginTop: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ color: "#FF9E00", margin: 0 }}>My collection</h3>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 25,
                border: "1px solid #FF9E00",
                background: "#fff",
                color: "#FF9E00",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              New Collection +
            </button>
          </div>

          {Object.keys(collections).length === 0 ? (
            <p style={{ color: "#666", marginTop: 12 }}>
              You have no collections yet. Create one to organize your recipes!
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 20,
                marginTop: 16,
              }}
            >
              {Object.values(collections).map((col: any) => {
                const firstRecipes = col.recipes?.slice(0, 3) || [];
                const hasMore = (col.recipes?.length || 0) > 3;
                return (
                  <div
                    key={col.id}
                    onClick={() => router.push(`/collection/${col.id}`)}
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.transform = "translateY(-4px)")}
                    onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: firstRecipes.length === 1 ? "1fr" : "repeat(2, 1fr)",
                        gap: 2,
                        background: "#f5f5f5",
                        minHeight: 180,
                        position: "relative",
                      }}
                    >
                      {(col.coverImage || col.cover_image_url) ? (
                        <img
                          src={col.coverImage || col.cover_image_url}
                          alt={col.title || col.name}
                          style={{
                            gridColumn: "1 / -1",
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                          }}
                        />
                      ) : firstRecipes.length === 0 ? (
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#999",
                          }}
                        >
                          No recipes yet
                        </div>
                      ) : (
                        <>
                          {firstRecipes.slice(0, 2).map((recipe: any, idx: number) => (
                            <img
                              key={idx}
                              src={recipe.image || recipe.image_url || "/food.png"}
                              alt={recipe.title}
                              style={{
                                width: "100%",
                                height: firstRecipes.length === 1 ? 180 : 90,
                                objectFit: "cover",
                              }}
                            />
                          ))}
                          {firstRecipes[2] && (
                            <div style={{ position: "relative", gridColumn: "1 / -1" }}>
                              <img
                                src={firstRecipes[2].image || firstRecipes[2].image_url || "/food.png"}
                                alt={firstRecipes[2].title}
                                style={{
                                  width: "100%",
                                  height: 90,
                                  objectFit: "cover",
                                }}
                              />
                              {hasMore && (
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "rgba(0,0,0,0.5)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontSize: 24,
                                    fontWeight: 700,
                                  }}
                                >
                                  +{col.recipes.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div style={{ padding: 16 }}>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{col.title || col.name}</h4>
                      <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#666" }}>
                        {col.recipes?.length || 0} {(col.recipes?.length || 0) === 1 ? "Recipe" : "Recipes"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Create Collection Dialog */}
      {showCreateDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 20,
          }}
          onClick={() => setShowCreateDialog(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              maxWidth: 600,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CollectionForm
              userId={user.id}
              onSuccess={async () => {
                setShowCreateDialog(false);
                // Refresh collections from database
                const updatedCollections = await getUserCollections(user.id);
                const collectionsMap: any = {};
                
                // Load recipes for each collection
                await Promise.all(updatedCollections.map(async (col: any) => {
                  try {
                    const recipes = await getCollectionRecipes(col.id);
                    collectionsMap[col.id] = {
                      id: col.id,
                      title: col.title,
                      name: col.title,
                      description: col.description || "",
                      cover_image_url: col.cover_image_url || "",
                      coverImage: col.cover_image_url || "",
                      recipes: recipes.map((r: any) => ({
                        id: r.id,
                        title: r.title,
                        image: r.image_url,
                        image_url: r.image_url,
                      })),
                      createdAt: new Date(col.created_at).getTime(),
                      created_at: col.created_at,
                    };
                  } catch (recipeError) {
                    collectionsMap[col.id] = {
                      id: col.id,
                      title: col.title,
                      name: col.title,
                      description: col.description || "",
                      cover_image_url: col.cover_image_url || "",
                      coverImage: col.cover_image_url || "",
                      recipes: [],
                      createdAt: new Date(col.created_at).getTime(),
                      created_at: col.created_at,
                    };
                  }
                }));
                
                setCollections(collectionsMap);
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
