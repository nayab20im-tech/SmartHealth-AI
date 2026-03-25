import React, { useState, useEffect } from "react";

export default function PrecautionsPage({ onNavigate, onBack }) {
  const [diseaseData, setDiseaseData] = useState(null);
  const [precautions, setPrecautions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:8000";
  const PRECAUTIONS_ENDPOINT = `${BACKEND_URL}/api/precautions`;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get disease data from localStorage
        const storedData = localStorage.getItem('selectedDisease');
        if (!storedData) {
          throw new Error("No disease selected. Please go back and select a condition.");
        }

        const parsedData = JSON.parse(storedData);
        setDiseaseData(parsedData);

        // Fetch AI-generated precautions
        console.log("Fetching AI precautions for:", parsedData.name);
        const response = await fetch(PRECAUTIONS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            disease: parsedData.name,
            symptoms: parsedData.symptoms || [],
            severity: parsedData.severity || 'Moderate'
          })
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setPrecautions(data.precautions);
        } else {
          throw new Error(data.error || "Failed to get precautions");
        }

      } catch (err) {
        console.error("Error loading precautions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleNewDiagnosis = () => {
    localStorage.clear();
    if (onNavigate) {
      onNavigate("symptoms");
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    tabsContainer: {
      backgroundColor: "white",
      borderBottom: "1px solid #e0e0e0",
      display: "flex",
      justifyContent: "center",
      padding: "0",
    },
    tab: {
      padding: "16px 32px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#666",
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      borderBottom: "3px solid transparent",
      transition: "all 0.2s",
    },
    tabActive: {
      color: "#4a90e2",
      borderBottom: "3px solid #4a90e2",
    },
    header: {
      background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
      color: "white",
      padding: "30px 40px",
    },
    headerTitle: {
      fontSize: "2.5rem",
      marginBottom: "10px",
    },
    diseaseBanner: {
      padding: "20px 40px",
      background: "#e8f5e9",
      borderBottom: "1px solid #c8e6c9",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    diseaseInfo: {
      flex: 1,
    },
    diseaseName: {
      fontSize: "1.8rem",
      color: "#2E7D32",
      marginBottom: "5px",
    },
    severityBadge: {
      background: "#ff9800",
      color: "white",
      padding: "8px 20px",
      borderRadius: "20px",
      fontWeight: "600",
    },
    aiBadge: {
      display: "inline-block",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "5px 15px",
      borderRadius: "15px",
      fontSize: "0.8rem",
      marginTop: "5px",
      fontWeight: "600",
    },
    content: {
      padding: "40px",
    },
    loadingContainer: {
      textAlign: "center",
      padding: "60px",
      color: "#666",
    },
    loadingSpinner: {
      width: "50px",
      height: "50px",
      border: "5px solid #f3f3f3",
      borderTop: "5px solid #4CAF50",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 20px",
    },
    errorAlert: {
      background: "#ffebee",
      color: "#c62828",
      padding: "20px",
      borderRadius: "10px",
      borderLeft: "5px solid #c62828",
      margin: "20px 0",
    },
    precautionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "30px",
      marginTop: "20px",
    },
    precautionCard: {
      background: "white",
      borderRadius: "15px",
      padding: "30px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      borderTop: "5px solid",
      transition: "transform 0.3s ease",
      height: "100%",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      marginBottom: "20px",
      paddingBottom: "15px",
      borderBottom: "2px solid #f0f0f0",
    },
    cardIcon: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      color: "white",
      flexShrink: 0,
    },
    cardTitle: {
      fontSize: "1.4rem",
      color: "#333",
      fontWeight: "600",
    },
    adviceList: {
      listStyle: "none",
      paddingLeft: 0,
    },
    adviceListItem: {
      padding: "14px 0",
      borderBottom: "1px solid #f5f5f5",
      display: "flex",
      alignItems: "flex-start",
      lineHeight: "1.6",
    },
    disclaimer: {
      background: "#fff3cd",
      color: "#856404",
      padding: "20px",
      borderRadius: "10px",
      borderLeft: "5px solid #ffc107",
      margin: "30px 0",
      gridColumn: "1 / -1",
    },
    actionButtons: {
      padding: "30px 40px",
      display: "flex",
      gap: "15px",
      justifyContent: "space-between",
      borderTop: "1px solid #eee",
      background: "#f8f9fa",
    },
    button: {
      padding: "15px 30px",
      border: "none",
      borderRadius: "10px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      minWidth: "200px",
      justifyContent: "center",
    },
    primaryButton: {
      background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
      color: "white",
    },
    secondaryButton: {
      background: "white",
      color: "#333",
      border: "2px solid #e0e0e0",
    },
    printButton: {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      background: "#2196F3",
      color: "white",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      cursor: "pointer",
      boxShadow: "0 5px 15px rgba(33, 150, 243, 0.4)",
      zIndex: 1000,
    },
    aiSource: {
      textAlign: "center",
      color: "#666",
      fontSize: "0.9rem",
      marginTop: "30px",
      paddingTop: "20px",
      borderTop: "1px solid #eee",
      gridColumn: "1 / -1",
    },
  };

  // Card configurations
  const cardConfigs = [
    { key: 'precautions', title: '🛡️ Precautions', icon: '🛡️', color: '#2196F3', desc: 'Measures to prevent worsening' },
    { key: 'immediate_actions', title: '⚡ Immediate Actions', icon: '⚡', color: '#FF9800', desc: 'Things to do right now' },
    { key: 'medications', title: '💊 Medications', icon: '💊', color: '#9C27B0', desc: 'Common treatment options' },
    { key: 'home_remedies', title: '🏠 Home Remedies', icon: '🏠', color: '#009688', desc: 'Natural treatment approaches' },
    { key: 'lifestyle_changes', title: '🌿 Lifestyle Changes', icon: '🌿', color: '#3F51B5', desc: 'Long-term improvements' },
    { key: 'diet_advice', title: '🍎 Diet Advice', icon: '🍎', color: '#FF5722', desc: 'Nutritional recommendations' },
    { key: 'activities_to_avoid', title: '🚫 Things to Avoid', icon: '🚫', color: '#795548', desc: 'Activities to avoid' },
    { key: 'when_to_see_doctor', title: '👨‍⚕️ When to See Doctor', icon: '👨‍⚕️', color: '#f44336', desc: 'Warning signs' },
    { key: 'emergency_signs', title: '🚨 Emergency Signs', icon: '🚨', color: '#d32f2f', desc: 'Red flags requiring immediate care' },
    { key: 'prevention_tips', title: '✅ Prevention Tips', icon: '✅', color: '#4CAF50', desc: 'How to prevent recurrence' },
  ];

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.tabsContainer}>
          <button style={styles.tab}>INFO</button>
          <button style={styles.tab}>SYMPTOMS</button>
          <button style={styles.tab}>CONDITIONS</button>
          <button style={styles.tab}>DETAILS</button>
          <button style={{ ...styles.tab, ...styles.tabActive }}>TREATMENT</button>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Generating personalized precautions and treatment advice...</p>
          <p><small>This may take a few moments</small></p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tabsContainer}>
        <button style={styles.tab}>INFO</button>
        <button style={styles.tab}>SYMPTOMS</button>
        <button style={styles.tab}>CONDITIONS</button>
        <button style={styles.tab}>DETAILS</button>
        <button style={{ ...styles.tab, ...styles.tabActive }}>TREATMENT</button>
      </div>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🛡️ Precautions & Treatment Plan</h1>
        <p>AI-generated personalized medical recommendations</p>
      </div>

      {diseaseData && (
        <div style={styles.diseaseBanner}>
          <div style={styles.diseaseInfo}>
            <h2 style={styles.diseaseName}>{diseaseData.name}</h2>
            <div style={styles.aiBadge}>🤖 Powered by DeepSeek AI</div>
          </div>
          <div style={styles.severityBadge}>
            Severity: {diseaseData.severity || 'Moderate'}
          </div>
        </div>
      )}

      <div style={styles.content}>
        {error ? (
          <div style={styles.errorAlert}>
            <h3>⚠️ Error Loading Precautions</h3>
            <p>{error}</p>
            <button
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
              onClick={() => window.location.reload()}
            >
              🔄 Retry
            </button>
          </div>
        ) : precautions && (
          <div style={styles.precautionsGrid}>
            {cardConfigs.map((config) => {
              const items = precautions[config.key];
              if (!items || (Array.isArray(items) && items.length === 0) || 
                  (typeof items === 'string' && items.trim() === '')) {
                return null;
              }

              return (
                <div
                  key={config.key}
                  style={{
                    ...styles.precautionCard,
                    borderTopColor: config.color
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.cardIcon, background: config.color }}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 style={styles.cardTitle}>{config.title}</h3>
                      <p style={{ color: "#666", fontSize: "0.9rem" }}>{config.desc}</p>
                    </div>
                  </div>

                  {Array.isArray(items) ? (
                    <ul style={styles.adviceList}>
                      {items.map((item, index) => (
                        <li key={index} style={styles.adviceListItem}>
                          ✓ {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
                      <p style={{ lineHeight: "1.6", color: "#444" }}>{items}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Disclaimer */}
            <div style={styles.disclaimer}>
              <h4>⚠️ Important Medical Disclaimer</h4>
              <p>This AI-generated advice is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
              <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
                <strong>Generated for:</strong> {diseaseData?.name} • 
                <strong> Date:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* AI Source Info */}
            <div style={styles.aiSource}>
              <p>🤖 AI-powered medical recommendations • Always consult healthcare professional for medical decisions</p>
              {diseaseData?.symptoms && diseaseData.symptoms.length > 0 && (
                <p style={{ marginTop: "5px", fontSize: "0.8rem", color: "#999" }}>
                  Symptoms considered: {diseaseData.symptoms.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={styles.actionButtons}>
        <button
          onClick={handleBack}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          ← Back to Details
        </button>
        <button
          onClick={handleNewDiagnosis}
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          🏥 Start New Diagnosis
        </button>
      </div>

      <div
        style={styles.printButton}
        onClick={handlePrint}
        title="Print Recommendations"
      >
        🖨️
      </div>
    </div>
  );
}