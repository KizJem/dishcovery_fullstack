"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [sort, setSort] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [collections, setCollections] = useState({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const router = useRouter();

  const storageKey = (userId) => `dishcovery_favorites_${userId || "guest"}`;
  const collectionsKey = (userId) => `dishcovery_collections_${userId || "guest"}`;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const key = storageKey(user?.uid);
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
    const key = collectionsKey(user?.uid);
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      setCollections(parsed || {});
    } catch (e) {
      console.error("Failed to load collections", e);
      setCollections({});
    }
  }, [user]);

  const saveFavorites = (next) => {
    const key = storageKey(user?.uid);
    try {
      localStorage.setItem(key, JSON.stringify(next || {}));
    } catch (e) {
      console.error("Failed to save favorites for profile", e);
    }
  };

  const saveCollections = (next) => {
    const key = collectionsKey(user?.uid);
    try {
      localStorage.setItem(key, JSON.stringify(next || {}));
    } catch (e) {
      console.error("Failed to save collections", e);
    }
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    const newId = Date.now().toString();
    const newCollection = {
      id: newId,
      name: newCollectionName.trim(),
      description: newCollectionDesc.trim(),
      recipes: [],
      createdAt: Date.now(),
    };
    const updated = { ...collections, [newId]: newCollection };
    setCollections(updated);
    saveCollections(updated);
    setNewCollectionName("");
    setNewCollectionDesc("");
    setShowCreateDialog(false);
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
    flexDirection: "column",
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
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: 44,
  },
  cardImg: {
    width: "100%",
    height: 180,
    flexShrink: 0,
    borderRadius: 12,
    objectFit: "cover",
    display: "block",
  },
  tags: { display: "flex", gap: 8, flexWrap: "wrap", minHeight: 28, marginTop: 6 },
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

  const handleUnfavorite = (id) => {
    const sid = String(id);
    setFavorites((prev) => {
      const next = { ...(prev || {}) };
      delete next[sid];
      saveFavorites(next);
      return next;
    });
  };

  const sortedList = (() => {
    const arr = Object.values(favorites || {}).slice();
    switch (sort) {
      case "oldest":
        return arr.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
      case "az":
        return arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      case "za":
        return arr.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
      case "newest":
      default:
        return arr.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    }
  })();

  return (
    <>
      <Navbar />
      <div className="nav-spacer" />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px" }}>
        <section style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img
            src={user?.photoURL || "/food.png"}
            alt="avatar"
            style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
          />
          <div>
            <h2 style={{ color: "#FF9E00", margin: 0 }}>{user?.displayName || "user 01"}</h2>
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
              {sortedList.map((r) => (
                <div key={r.id} style={profileStyles.card}>
                  <div style={profileStyles.cardHeader}>
                    <h3 style={profileStyles.titleClamp}>{r.title}</h3>
                    <button onClick={() => handleUnfavorite(r.id)} style={profileStyles.heartButton} aria-label="unfavorite">❤</button>
                  </div>
                  <img src={r.image || "/food.png"} alt={r.title} style={profileStyles.cardImg} />
                  <div style={profileStyles.tags}>{(r.tags || []).map((t, i) => <span key={i} style={profileStyles.tag}>{t}</span>)}</div>
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
              {Object.values(collections).map((col) => {
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
                    onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                    onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
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
                      {firstRecipes.length === 0 ? (
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
                          {firstRecipes.slice(0, 2).map((recipe, idx) => (
                            <img
                              key={idx}
                              src={recipe.image || "/food.png"}
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
                                src={firstRecipes[2].image || "/food.png"}
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
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{col.name}</h4>
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
          }}
          onClick={() => {
            setShowCreateDialog(false);
            setNewCollectionName("");
            setNewCollectionDesc("");
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              maxWidth: 480,
              width: "90%",
              boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px 0", fontSize: 20 }}>Create new collection</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Collection name
              </label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter collection name"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Description (optional)
              </label>
              <textarea
                value={newCollectionDesc}
                onChange={(e) => setNewCollectionDesc(e.target.value)}
                placeholder="Add a description"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  minHeight: 80,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewCollectionName("");
                  setNewCollectionDesc("");
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
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: newCollectionName.trim() ? "#FF9E00" : "#ccc",
                  color: "#fff",
                  cursor: newCollectionName.trim() ? "pointer" : "not-allowed",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
