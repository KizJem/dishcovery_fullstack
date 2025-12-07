"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import CollectionForm from "../../../components/CollectionForm";
import { onAuthStateChange } from "../../../lib/auth";
import { 
  getCollection, 
  getCollectionRecipes, 
  deleteCollection, 
  removeRecipeFromCollection 
} from "../../../lib/database";

export default function CollectionView() {
  const params = useParams();
  const collectionId = params.collectionId as string;
  const [user, setUser] = useState<any>(null);
  const [collection, setCollection] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [sort, setSort] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const subscription = onAuthStateChange((u) => setUser(u));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuOpen || sortOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          setMenuOpen(false);
          setSortOpen(false);
        }
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen, sortOpen]);

  useEffect(() => {
    if (!user || !collectionId) return;
    
    async function loadCollectionData() {
      try {
        setLoading(true);
        console.log("📥 Loading collection:", collectionId);
        
        // Fetch collection details
        const collectionData = await getCollection(collectionId);
        if (!collectionData) {
          console.error("Collection not found");
          router.push("/profile");
          return;
        }
        
        console.log("✅ Collection loaded:", collectionData);
        setCollection(collectionData);
        
        // Fetch recipes in the collection
        const recipesData = await getCollectionRecipes(collectionId);
        console.log("✅ Recipes loaded:", recipesData.length);
        setRecipes(recipesData);
      } catch (e) {
        console.error("Failed to load collection", e);
        router.push("/profile");
      } finally {
        setLoading(false);
      }
    }
    
    loadCollectionData();
  }, [user, collectionId, router]);

  const handleDeleteCollection = async () => {
    try {
      console.log("🗑️ Deleting collection:", collectionId);
      const success = await deleteCollection(collectionId);
      if (success) {
        console.log("✅ Collection deleted");
        router.push("/profile");
      } else {
        console.error("Failed to delete collection");
        alert("Failed to delete collection. Please try again.");
      }
    } catch (e) {
      console.error("Failed to delete collection", e);
      alert("Failed to delete collection. Please try again.");
    }
  };

  const handleRemoveFromCollection = async (recipeId: string) => {
    try {
      console.log("🗑️ Removing recipe from collection:", recipeId);
      const success = await removeRecipeFromCollection(collectionId, recipeId);
      if (success) {
        console.log("✅ Recipe removed");
        // Refresh recipes list
        const updatedRecipes = await getCollectionRecipes(collectionId);
        setRecipes(updatedRecipes);
      } else {
        console.error("Failed to remove recipe");
        alert("Failed to remove recipe. Please try again.");
      }
    } catch (e) {
      console.error("Failed to remove recipe from collection", e);
      alert("Failed to remove recipe. Please try again.");
    }
  };

  const sortedList = (() => {
    const arr = [...recipes];
    switch (sort) {
      case "oldest":
        return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "az":
        return arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      case "za":
        return arr.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
      case "newest":
      default:
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
      WebkitBoxOrient: "vertical" as const,
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="nav-spacer" />
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px", textAlign: "center" }}>
          <p style={{ color: "#666" }}>Loading collection...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!collection) return null;

  return (
    <>
      <Navbar />
      <div className="nav-spacer" />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px" }}>
        {/* Cover Image Banner with Collection Title */}
        <div
          style={{
            width: "100%",
            height: 280,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 24,
            position: "relative",
            background: collection.cover_image_url 
              ? `url(${collection.cover_image_url}) center/cover` 
              : "linear-gradient(135deg, #FF9E00 0%, #FF6B00 100%)",
          }}
        >
          {collection.cover_image_url && (
            <>
              <img
                src={collection.cover_image_url}
                alt={collection.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)",
                }}
              />
            </>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              color: "#fff",
              zIndex: 10,
            }}
          >
            <h1 style={{ 
              margin: 0, 
              fontSize: 36,
              fontWeight: 700,
              textShadow: "0 2px 12px rgba(0,0,0,0.3)"
            }}>
              {collection.title}
            </h1>
            {collection.description && (
              <p style={{ 
                margin: "8px 0 0 0", 
                fontSize: 16,
                textShadow: "0 1px 6px rgba(0,0,0,0.3)"
              }}>
                {collection.description}
              </p>
            )}
          </div>
          
          {/* Menu Button */}
          <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
            <button
              onClick={() => setMenuOpen((m) => !m)}
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "none",
                cursor: "pointer",
                fontSize: 24,
                width: 44,
                height: 44,
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                  top: 48,
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
                    setShowEditDialog(true);
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
                    color: "#222",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  Edit Collection
                </button>
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
                    color: "#dc2626",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  Delete Collection
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <p style={{ color: "#999", fontSize: 14, margin: 0 }}>
            {recipes.length} {recipes.length === 1 ? "Recipe" : "Recipes"}
          </p>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setSortOpen((s) => !s)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: 0,
                border: "none",
                background: "transparent",
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
              <span style={{ fontWeight: 600, color: "#222" }}>
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
                  right: 0,
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
                  src={r.image_url || "/food.png"}
                  alt={r.title}
                  style={collectionStyles.cardImg}
                />
                {r.description && (
                  <p style={{ 
                    fontSize: 13, 
                    color: "#666", 
                    margin: "8px 0 0 0",
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {r.description}
                  </p>
                )}
                <button
                  style={collectionStyles.seeRecipe}
                  onClick={() => router.push(`/recipe/${r.id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#333"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#000"}
                >
                  See Recipe ➝
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Collection Dialog */}
      {showEditDialog && user && (
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
          onClick={() => setShowEditDialog(false)}
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
              existingCollection={{
                id: collection.id,
                title: collection.title,
                description: collection.description,
                cover_image_url: collection.cover_image_url,
              }}
              onSuccess={async () => {
                setShowEditDialog(false);
                // Refresh collection data
                const updatedCollection = await getCollection(collectionId);
                if (updatedCollection) {
                  setCollection(updatedCollection);
                }
              }}
              onCancel={() => setShowEditDialog(false)}
            />
          </div>
        </div>
      )}

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
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#222",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCollection}
                style={{
                  flex: 1,
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "none",
                  background: "#FF9E00",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FF8C00")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#FF9E00")}
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
