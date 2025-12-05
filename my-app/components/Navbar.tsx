"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { signOutUser } from "../lib/firebase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <header className="nav">
        <div className="nav-inner">
          {/* LEFT */}
          <div className="brand">Dishcovery</div>

          {/* RIGHT */}
          <div className="right-section">
            <nav className="links">
              <Link href="/" className={pathname === "/" ? "active" : ""}>
                Home
              </Link>
              <Link href="/about" className={pathname === "/about" ? "active" : ""}>
                About
              </Link>
              <Link href="/explore" className={pathname === "/explore" ? "active" : ""}>
                Explore
              </Link>
              <Link href="/fridge" className={pathname === "/fridge" ? "active" : ""}>
                What's in Your Fridge
              </Link>
            </nav>

            <div style={{ position: "relative" }}>
              <button
                className="profile"
                aria-label="Profile"
                onClick={() => user && setOpen((s) => !s)}
                title={user ? user.displayName || "Profile" : "Sign in required"}
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 12a5 5 0 1 0-0.001-10.001A5 5 0 0 0 12 12Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                      fill="#FF9E00"
                    />
                  </svg>
                )}
              </button>

              {user && open && (
                <div className="profile-dropdown" onMouseLeave={() => setOpen(false)}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setOpen(false);
                      router.push("/profile");
                    }}
                  >
                    {user.displayName || "Profile"}
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={async () => {
                      setOpen(false);
                      await signOutUser();
                      router.push("/");
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <style jsx>{`
        * { font-family: 'Poppins', sans-serif; }

        .nav { position: fixed; top: 0; left: 0; right: 0; background:#fff; z-index:1000; border-bottom:1px solid #eee; }
        .nav-inner { max-width:1440px; margin:0 auto; padding:18px 32px; display:flex; align-items:center; justify-content:space-between; gap:32px; }
        .brand { font-weight:800; font-size:32px; color:#FF9E00; letter-spacing:0.3px; }
        .right-section { display:flex; align-items:center; gap:32px; }
        .links { display:flex; gap:32px; }
        .links a { text-decoration:none; color:#222; font-size:18px; font-weight:500; }
        .links a.active { color:#FF9E00; font-weight:600; }
        .links a:hover { color:#FF9E00; }
        .profile { width:48px; height:48px; border-radius:50%; border:none; background:#222; color:#fff; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; }
        .profile img { display:block; }
        .profile-dropdown { position:absolute; right:0; top:58px; background:#fff; border:1px solid #eee; box-shadow:0 6px 18px rgba(0,0,0,0.08); border-radius:8px; overflow:hidden; min-width:160px; z-index:1200; }
        .dropdown-item { display:block; width:100%; padding:10px 14px; text-align:left; background:transparent; border:none; cursor:pointer; font-weight:500; color:#222; }
        .dropdown-item:hover { background:#f7f7f7; }
        .nav-spacer { height:84px; }

        @media (max-width: 980px) {
          .nav-inner { flex-wrap: wrap; }
          .right-section { width: 100%; justify-content: flex-start; gap: 16px; }
          .links { flex-wrap: wrap; gap: 16px; }
        }
      `}</style>
    </>
  );
}
