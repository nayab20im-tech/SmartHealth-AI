import React, { Component } from "react";

class Footer extends Component {
  render() {
    return (
      <footer style={styles.footerWrapper}>
        <div style={styles.newsletterSection}>
          <h2 style={styles.title}>Sign up for our free Good Health Newsletter</h2>
          <p style={styles.subtitle}>Get wellness tips to help you live happier and healthier</p>
          <div style={styles.inputGroup}>
            <input type="text" placeholder="Enter your email address" style={styles.input} />
            <button style={styles.btn}>Subscribe</button>
          </div>
        </div>
        
        <div style={styles.bottomLegal}>
          <p>© 2005 - 2026 SmartHealth AI. All rights reserved.</p>
          <div style={styles.legalLinks}>
            <span>Privacy Policy</span> | <span>Cookie Policy</span> | <span>Terms of Use</span>
          </div>
        </div>
      </footer>
    );
  }
}

const styles = {
  footerWrapper: { backgroundColor: "#001a33", color: "white", width: "100%", marginTop: "auto" },
  newsletterSection: { textAlign: "center", padding: "40px 20px", borderBottom: "1px solid #222" },
  title: { fontSize: "22px", marginBottom: "10px" },
  subtitle: { color: "#ccc", fontSize: "14px", marginBottom: "20px" },
  inputGroup: { display: "flex", justifyContent: "center" },
  input: { padding: "12px", width: "300px", border: "none", borderRadius: "4px 0 0 4px" },
  btn: { padding: "12px 25px", border: "none", backgroundColor: "#999", color: "white", borderRadius: "0 4px 4px 0", cursor: 'pointer' },
  bottomLegal: { textAlign: "center", padding: "30px", fontSize: "12px", color: "#aaa" },
  legalLinks: { marginTop: "10px" }
};

export default Footer;