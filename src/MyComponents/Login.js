import React from "react";

export default function Login({ onClose }) {
  return (
    <div style={s.container}>
      {/* Left Side - Info */}
      <div style={s.infoSide}>
        <h3 style={s.infoTitle}>Get access to everything SmartHealth offers</h3>
        <ul style={s.list}>
          <li style={s.listItem}>🩺 Personalized tools for managing your health</li>
          <li style={s.listItem}>📧 Health and wellness updates delivered to your inbox</li>
          <li style={s.listItem}>📄 Saved articles, conditions and medications</li>
          <li style={s.listItem}>👨‍⚕️ Expert insights and patient stories</li>
        </ul>
      </div>

      {/* Right Side - Form */}
      <div style={s.formSide}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
        <h2 style={s.formTitle}>Log In</h2>
        <div style={s.inputGroup}>
          <input type="email" placeholder="Email" style={s.input} />
          <div style={s.passwordWrapper}>
            <input type="password" placeholder="Password" style={s.input} />
            <span style={s.showText}>SHOW</span>
          </div>
        </div>
        <div style={s.forgotRow}>
          <span style={s.link}>Forgot Password?</span>
          <label style={{display:'flex', alignItems:'center', gap:'5px'}}>
            <input type="checkbox" /> Remember me
          </label>
        </div>
        <button style={s.loginBtn}>Log In</button>
        <p style={s.footerText}>
          Don't have an account? <span style={s.link}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

const s = {
  container: { display: "flex", minHeight: "500px", width: "100%" },
  infoSide: { flex: 1, backgroundColor: "#e0e7ff", padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center" },
  infoTitle: { fontSize: "20px", fontWeight: "bold", marginBottom: "30px" },
  list: { listStyle: "none", padding: 0 },
  listItem: { marginBottom: "20px", fontSize: "14px", color: "#333", display: 'flex', alignItems: 'center', gap: '10px' },
  formSide: { flex: 1, padding: "50px", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: 'white' },
  closeBtn: { position: "absolute", top: "15px", right: "20px", border: "none", background: "none", fontSize: "20px", cursor: "pointer" },
  formTitle: { textAlign: "center", marginBottom: "30px", fontSize: '24px', fontWeight: 'bold' },
  input: { width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: 'border-box' },
  passwordWrapper: { position: "relative" },
  showText: { position: "absolute", right: "10px", top: "12px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", color: '#333' },
  forgotRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "20px", alignItems: 'center' },
  link: { color: "#2563eb", cursor: "pointer", textDecoration: "underline", fontWeight: '500' },
  loginBtn: { width: "100%", padding: "14px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" },
  footerText: { textAlign: "center", marginTop: "25px", fontSize: "14px" }
};