import { ImageResponse } from "next/og";

// The preview picture shown when the link is shared (LinkedIn, WhatsApp, Slack and so on).
export const alt = "UrbanVoice: report problems, track fixes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const chip = (label: string) => (
    <div style={{ display: "flex", padding: "10px 20px", borderRadius: 999, background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 24, fontWeight: 600 }}>{label}</div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(150deg,#0a3f00 0%,#0f5c00 55%,#1b8500 100%)", color: "#fff", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 660 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", width: 64, height: 64, borderRadius: 18, background: "#fff", alignItems: "center", justifyContent: "center" }}>
              <svg width="38" height="38" viewBox="0 0 64 64"><path d="M32 8c-9.4 0-17 7.2-17 16.4C15 36.6 32 56 32 56s17-19.4 17-31.6C49 15.2 41.4 8 32 8z" fill="#1b8500" /><circle cx="32" cy="24.5" r="6.5" fill="#fff" /></svg>
            </div>
            <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>UrbanVoice</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Report it. Track it. See it fixed.</div>
            <div style={{ display: "flex", marginTop: 24, fontSize: 28, lineHeight: 1.35, color: "rgba(255,255,255,0.78)" }}>A civic complaint platform for residents and city staff.</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>{chip("Map-based reports")}{chip("Live tracking")}{chip("Staff portal")}</div>
        </div>
        <div style={{ display: "flex", flex: 1, position: "relative", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 400, background: "#fff", color: "#1c2230", borderRadius: 32, padding: 28, boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", padding: "6px 14px", borderRadius: 999, background: "#fdebdc", color: "#b4470b", fontSize: 20, fontWeight: 700 }}>Roads</div>
              <div style={{ display: "flex", padding: "6px 14px", borderRadius: 999, background: "#dbeefc", color: "#075985", fontSize: 20, fontWeight: 700 }}>In progress</div>
            </div>
            <div style={{ display: "flex", marginTop: 20, fontSize: 32, fontWeight: 800, lineHeight: 1.15 }}>Deep pothole outside the church gate</div>
            <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
              {[1, 1, 1, 0].map((on, i) => <div key={i} style={{ display: "flex", flex: 1, height: 10, borderRadius: 999, background: on ? "#1b8500" : "#e2e8f0" }} />)}
            </div>
            <div style={{ display: "flex", marginTop: 12, fontSize: 20, fontWeight: 700, color: "#0f5c00" }}>Step 3 of 4 · In progress</div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 20, color: "#64748b" }}>Bole · 350 m away</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
