// src/pages/Home.tsx

import { Link } from "react-router-dom";

export default function Home() {
  const ajza = Array.from({ length: 30 }, (_, i) => i + 1); // ✅ Build 1..30 list

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Tadabbur Halaqah</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Choose a Juz to view questions and answers (Arabic + English).
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", // ✅ Responsive grid
          gap: 12,
          marginTop: 16,
        }}
      >
        {ajza.map((j) => (
          <Link
            key={j}
            to={`/juz/${j}`}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 12,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontWeight: 700 }}>Juz {j}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Open Q&A</div>
          </Link>
        ))}
      </div>

      {/* NEW: bottom-centered button for the bonus section */}
      <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
        <Link
          to="/juz/bonus" // NEW: routes to the same JuzPage, but loads bonus.json
          style={{
            border: "2px solid #2f2f2f", // NEW: matches the “boxed” look from your screenshot
            borderRadius: 18, // NEW: rounded pill/box feel
            padding: "12px 18px", // NEW: comfortable tap target
            textDecoration: "none",
            color: "inherit",
            fontWeight: 800, // NEW: bold like the Arabic title
            background: "#e7dfbf", // NEW: warm beige similar to the screenshot
          }}
        >
          Advanced Questions
        </Link>
      </div>
    </div>
  );
}