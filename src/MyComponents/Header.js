import React, { useState } from "react";

export default function Header({ onLoginClick, onNavigate }) {
  const [open, setOpen] = useState(null);

  return (
    <header style={s.header}>
      <div style={s.topNav}>
        {/* LOGO */}
        <div style={s.logo} onClick={() => onNavigate("home")}>
          <span role="img" aria-label="stethoscope">🩺</span> <span style={{ color: "#00c2ff" }}>Smart</span>Health AI
        </div>

        {/* NAV */}
        <div style={s.nav}>
          {["Find a Doctor", "Drugs", "Well-Being"].map((item) => (
            <div
              key={item}
              onMouseEnter={() => item !== "Find a Doctor" && setOpen(item)}
              onMouseLeave={() => setOpen(null)}
              style={s.navItem}
              onClick={() => item === "Find a Doctor" && onNavigate("find-doctor")}
            >
              {/* Only show the arrow if it's not "Find a Doctor" since it has no menu */}
              {item} {item !== "Find a Doctor" && "▾"}

              {/* DROPDOWN - Only renders if item is NOT "Find a Doctor" */}
              {open === item && item !== "Find a Doctor" && (
                <div style={s.dropdown}>
                  <div style={s.dropdownItem}>Overview</div>
                  <div style={s.dropdownItem}>Symptoms</div>
                  <div style={s.dropdownItem}>Treatment</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AUTH */}
        <div style={s.auth}>
          <button style={s.btn}>Subscribe</button>
          <span style={s.loginLink} onClick={onLoginClick}>Login</span>
        </div>
      </div>
    </header>
  );
}

const s = {
  header: { fontFamily: "Arial, sans-serif", width: "100%" },
  topNav: {
    background: "#002855",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 50px",
    alignItems: "center"
  },
  logo: { fontSize: 22, fontWeight: "bold", cursor: "pointer" },
  nav: { display: "flex", gap: 30 },
  navItem: { position: "relative", cursor: "pointer", fontSize: "14px" },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    background: "white",
    color: "#333",
    padding: "10px 0",
    borderRadius: "4px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    zIndex: 10,
    minWidth: "160px" 
  },
  dropdownItem: {
    padding: "10px 15px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#333",
    borderBottom: "1px solid #eee",
    textAlign: "left"
  },
  auth: { display: "flex", gap: 15, alignItems: "center" },
  loginLink: { cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  btn: {
    background: "transparent",
    border: "1px solid white",
    color: "white",
    padding: "5px 14px",
    borderRadius: "4px",
    cursor: "pointer"
  }
};