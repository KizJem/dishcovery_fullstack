"use client";

import { useState, useEffect } from "react";
import { FaFacebookF, FaTwitter, FaPinterestP, FaInstagram } from "react-icons/fa";

export default function Footer() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const id = "smooth-scroll-style";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `html{scroll-behavior:smooth}`;
      document.head.appendChild(style);
    }
  }, []);

  const styles = {
    wrap: { marginTop: 60, padding: "50px 80px", background: "#fff", fontFamily: "Poppins, sans-serif", color: "#222", borderTop: "1px solid #eee" },
    grid: { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.4fr", gap: 28, alignItems: "start" },
    brand: { fontSize: 22, fontWeight: 700, color: "#FF9E00", marginBottom: 10 },
    small: { fontSize: 13, lineHeight: 1.6, color: "#666", maxWidth: 260 },
    colHead: { fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#222" },
    link: { display: "block", fontSize: 13, color: "#333", textDecoration: "none", margin: "8px 0" },
    newsHead: { fontSize: 20, fontWeight: 700, color: "#FF9E00", marginBottom: 8 },
    newsSmall: { fontSize: 12, color: "#777", marginBottom: 10, maxWidth: 300 },
    form: { display: "flex", gap: 8 },
    input: { flex: 1, padding: "10px 12px", borderRadius: 6, border: "1px solid #ddd", outline: "none", fontSize: 13 },
    btn: { background: "#FF9E00", color: "#fff", border: "none", borderRadius: 6, padding: "10px 12px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
    socialsRow: { display: "flex", gap: 10, marginTop: 22 },
    iconBtn: { width: 26, height: 26, borderRadius: "50%", background: "#FF9E00", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, cursor: "pointer" },
    bottomBar: { marginTop: 26, borderTop: "1px solid #eee", paddingTop: 14, fontSize: 12, color: "#777", textAlign: "center" },
  };

  return (
    <footer id="contact-footer" style={styles.wrap}>
      <div style={styles.grid}>
        {/* Brand & blurb */}
        <div>
          <div style={styles.brand}>Dishcovery</div>
          <p style={styles.small}>
            Dishecovery is a recipe website with a wide variety of delicious recipes,
            easy-to-use search function. Join our community and let's cook together!
          </p>
          <div style={styles.socialsRow}>
            <div style={styles.iconBtn}><FaFacebookF /></div>
            <div style={styles.iconBtn}><FaTwitter /></div>
            <div style={styles.iconBtn}><FaPinterestP /></div>
            <div style={styles.iconBtn}><FaInstagram /></div>
          </div>
        </div>

        {/* Company */}
        <div>
          <div style={styles.colHead}>Company</div>
          <a href="/" style={styles.link}>Home</a>
          <a href="/explore" style={styles.link}>Explore</a>
          <a href="/about" style={styles.link}>About us</a>
          <a href="/recipe" style={styles.link}>Activity</a>
        </div>

        {/* Resources */}
        <div>
          <div style={styles.colHead}>Resources</div>
          <a href="#" style={styles.link}>Blog</a>
          <a href="#" style={styles.link}>Use Cases</a>
          <a href="#" style={styles.link}>Testimonials</a>
          <a href="#" style={styles.link}>Insights</a>
        </div>

        {/* Newsletter */}
        <div>
          <div style={styles.newsHead}>Dishcovery</div>
          <div style={styles.newsSmall}>
            Ut vitae mattis mauris in faucibus toedsi iaculis purus accumsan aliquan.
          </div>
          <form
            style={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              alert(`Subscribed: ${email}`);
              setEmail("");
            }}
          >
            <input
              style={styles.input}
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button style={styles.btn} type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div style={styles.bottomBar}>
        © {new Date().getFullYear()} Dishcovery. All rights reserved.
      </div>
    </footer>
  );
}
