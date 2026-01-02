import { createRoot } from "react-dom/client";
import { useState } from "react";
import App from "./App";
import "./index.css";

function PasswordGate() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(
    localStorage.getItem("unlocked") === "yes"
  );

  if (unlocked) return <App />;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui"
    }}>
      <div style={{ textAlign: "center" }}>
        <h2>Coming Soon!</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Great and exciting things are on the horizon for 2026.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && password === "test123gi") {
              localStorage.setItem("unlocked", "yes");
              setUnlocked(true);
            }
          }}
          placeholder="Password"
          style={{ 
            padding: "8px", 
            fontSize: "16px",
            border: "1px solid black",
            backgroundColor: "white"
          }}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<PasswordGate />);
