"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function CollectionView() {
  const params = useParams();
  const collectionId = params.collectionId;
  const [user, setUser] = useState(null);
  const [collection, setCollection] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [sort, setSort] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const storageKey = (userId) => `dishcovery_collections_${userId || "guest"}`;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const key = storageKey(user?.uid);
    try {
      const raw = localStorage.getItem(key);
      const collections = raw ? JSON.parse(raw) : {};
      const currentCollection = collections[collectionId];
      if (currentCollection) {
        setCollection(currentCollection);
        setRecipes(currentCollection.recipes || []);
      } else {
        router.push("/profile");
      }
    } catch (e) {
      console.error("Failed to load collection", e);
      router.push("/profile");
    }
  }, [user, collectionId, router]);

  const handleDeleteCollection = () => {
    const key = storageKey(user?.uid);
    try {
      const raw = localStorage.getItem(key);
      const collections = raw ? JSON.parse(raw) : {};
      delete collections[collectionId];
      localStorage.setItem(key, JSON.stringify(collections));
      router.push("/profile");
    } catch (e) {
      console.error("Failed to delete collection", e);
    }
  };

  const handleRemoveFromCollection = (recipeId) => {
    const key = storageKey(user?.uid);
    try {
      const raw = localStorage.getItem(key);
      const collections = raw ? JSON.parse(raw) : {};
      if (collections[collectionId]) {
        collections[collectionId].recipes = collections[collectionId].recipes.filter(
          (r) => r.id !== recipeId
        );
        localStorage.setItem(key, JSON.stringify(collections));
        setRecipes(collections[collectionId].recipes);
      }
    } catch (e) {
      console.error("Failed to remove recipe from collection", e);
    }
  };

  const sortedList = (() => {
    const arr = [...recipes];
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

  const collectionStyles = {
    recipeGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 20,
      alignItems: "start",
      marginTop: 20,
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
    heartButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 18,
      color: "#FF4D6D",
      flexShrink: 0,
    },
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

  if (!collection) return null;

  return (
    <>
      <Navbar />
      <div className="nav-spacer" />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <button
              onClick={() => router.push("/profile")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                color: "#666",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ← Back
            </button>
            <h2 style={{ color: "#FF9E00", margin: 0 }}>{collection.name}</h2>
            {collection.description && (
              <p style={{ color: "#666", marginTop: 8 }}>{collection.description}</p>
            )}
            <p style={{ color: "#999", fontSize: 14, marginTop: 4 }}>
              {recipes.length} {recipes.length === 1 ? "Recipe" : "Recipes"}
            </p>
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((m) => !m)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 24,
                padding: 8,
              }}
              aria-label="More options"
            >
              ⋯
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 40,
                  background: "#fff",
                  border: "1px solid #eee",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                  borderRadius: 8,
                  overflow: "hidden",
                  zIndex: 1200,
                  minWidth: 180,
                }}
              >
                <button
                  onClick={() => {
                    setShowDeleteDialog(true);
                    setMenuOpen(false);
                  }}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Delete Collection
                </button>
              </div>
            )}
          </div>
        </div>

        <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #ddd" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setSortOpen((s) => !s)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #eee",
                background: "#fff",
                cursor: "pointer",
              }}
              aria-expanded={sortOpen}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6h18M6 12h12M10 18h4"
                  stroke="#222"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontWeight: 600 }}>
                {sort === "newest"
                  ? "Newest"
                  : sort === "oldest"
                  ? "Oldest"
                  : sort === "az"
                  ? "A - Z"
                  : "Z - A"}
              </span>
            </button>

            {sortOpen && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 42,
                  background: "#fff",
                  border: "1px solid #eee",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  borderRadius: 8,
                  overflow: "hidden",
                  zIndex: 1200,
                }}
              >
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setSort("newest");
                    setSortOpen(false);
                  }}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    width: "200px",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Newest
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setSort("oldest");
                    setSortOpen(false);
                  }}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    width: "200px",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Oldest
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setSort("az");
                    setSortOpen(false);
                  }}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    width: "200px",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  A - Z
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setSort("za");
                    setSortOpen(false);
                  }}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    width: "200px",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Z - A
                </button>
              </div>
            )}
          </div>
        </div>

        {sortedList.length === 0 ? (
          <p style={{ color: "#666", marginTop: 12 }}>
            No recipes in this collection yet. Add recipes from the Explore page!
          </p>
        ) : (
          <div style={collectionStyles.recipeGrid}>
            {sortedList.map((r) => (
              <div key={r.id} style={collectionStyles.card}>
                <div style={collectionStyles.cardHeader}>
                  <h3 style={collectionStyles.titleClamp}>{r.title}</h3>
                  <button
                    onClick={() => handleRemoveFromCollection(r.id)}
                    style={collectionStyles.heartButton}
                    aria-label="Remove from collection"
                  >
                    ❤
                  </button>
                </div>
                <img
                  src={r.image || "/food.png"}
                  alt={r.title}
                  style={collectionStyles.cardImg}
                />
                <div style={collectionStyles.tags}>
                  {(r.tags || []).map((t, i) => (
                    <span key={i} style={collectionStyles.tag}>
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  style={collectionStyles.seeRecipe}
                  onClick={() => router.push(`/recipe/${r.id}`)}
                >
                  See Recipe ➝
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Collection Dialog */}
      {showDeleteDialog && (
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
          onClick={() => setShowDeleteDialog(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              maxWidth: 440,
              width: "90%",
              boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: 20 }}>Delete Collection</h3>
            <p style={{ color: "#666", marginBottom: 24 }}>
              You are about to permanently delete this collection. This action cannot be undone.
              Do you wish to proceed?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowDeleteDialog(false)}
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
                onClick={handleDeleteCollection}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: "#FF9E00",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
