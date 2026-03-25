import React, { useState, useEffect } from "react";

export default function DetailsPage({ onNavigate, onBack }) {
  const [diseaseData, setDiseaseData] = useState(null);
  const [aiDetails, setAiDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiSource, setAiSource] = useState(null);

  const BACKEND_URL = "http://localhost:8000";
  const DETAILS_ENDPOINT = `${BACKEND_URL}/api/disease-details`;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get disease data from localStorage
        const storedData = localStorage.getItem('selectedDisease');
        console.log("Stored disease data:", storedData);
        
        if (!storedData) {
          throw new Error("No disease selected. Please go back and select a condition.");
        }

        const parsedData = JSON.parse(storedData);
        console.log("Parsed disease data:", parsedData);
        setDiseaseData(parsedData);

        // Fetch AI-generated details
        console.log("Fetching AI details for:", parsedData.name);
        console.log("Endpoint:", DETAILS_ENDPOINT);
        
        const requestBody = {
          disease: parsedData.name,
          symptoms: parsedData.symptoms || []
        };
        
        console.log("Request body:", requestBody);

        const response = await fetch(DETAILS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response error:", errorText);
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("AI Details API Response:", data);
        
        if (data.success) {
          setAiDetails(data.details);
          setAiSource(data.ai_source || 'deepseek');
          console.log("AI Details loaded:", data.details);
        } else {
          throw new Error(data.error || "Failed to get AI details");
        }

      } catch (err) {
        console.error("Error loading details:", err);
        setError(err.message);
        
        // Show fallback data if API fails
        if (diseaseData) {
          setAiDetails(getFallbackDetails(diseaseData.name));
          setAiSource('fallback');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Fallback data if API fails
  const getFallbackDetails = (diseaseName) => {
    return {
      overview: `${diseaseName} is a medical condition that requires proper diagnosis and treatment. Consult a healthcare professional for accurate information.`,
      causes: [
        "Various factors may contribute to this condition",
        "Genetic predisposition in some cases",
        "Environmental factors",
        "Lifestyle choices"
      ],
      complications: [
        "Can worsen if left untreated",
        "May affect quality of life",
        "Potential for secondary health issues"
      ],
      diagnosis_methods: [
        "Clinical examination by healthcare provider",
        "Review of medical history",
        "Diagnostic tests if needed",
        "Symptom assessment"
      ],
      treatment_approaches: [
        "Medication as prescribed by doctor",
        "Lifestyle modifications",
        "Therapy or rehabilitation if needed",
        "Regular follow-up appointments"
      ],
      key_facts: [
        "Medical consultation is essential",
        "Follow prescribed treatment plan",
        "Monitor symptoms regularly",
        "Maintain open communication with healthcare provider"
      ],
      prognosis: "With proper medical care and following doctor's advice, most conditions have good outcomes."
    };
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleViewPrecautions = () => {
    if (onNavigate) {
      onNavigate("precautions");
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setAiDetails(null);
    setAiSource(null);
    
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
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
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "30px 40px",
    },
    headerTitle: {
      fontSize: "2.5rem",
      marginBottom: "10px",
    },
    diseaseHeader: {
      padding: "25px 40px",
      background: "#f8f9fa",
      borderBottom: "1px solid #e0e0e0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    diseaseTitle: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },
    diseaseIcon: {
      width: "60px",
      height: "60px",
      background: "#667eea",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.8rem",
      color: "white",
    },
    diseaseName: {
      fontSize: "1.8rem",
      color: "#333",
    },
    probabilityBadge: {
      background: "#4CAF50",
      color: "white",
      padding: "10px 25px",
      borderRadius: "25px",
      fontWeight: "600",
      fontSize: "1.1rem",
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
      borderTop: "5px solid #667eea",
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
    successAlert: {
      background: "#e8f5e9",
      color: "#2e7d32",
      padding: "15px",
      borderRadius: "8px",
      margin: "20px 0",
      borderLeft: "5px solid #4CAF50",
    },
    detailsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
      gap: "25px",
      marginTop: "20px",
    },
    detailCard: {
      background: "white",
      borderRadius: "15px",
      padding: "25px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      borderLeft: "5px solid #667eea",
      transition: "transform 0.3s ease",
    },
    overviewCard: {
      gridColumn: "1 / -1",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
      borderLeft: "5px solid #4CAF50",
    },
    cardTitle: {
      fontSize: "1.3rem",
      color: "#333",
      marginBottom: "20px",
      paddingBottom: "10px",
      borderBottom: "2px solid #f0f0f0",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    infoList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    infoListItem: {
      padding: "12px 0",
      borderBottom: "1px solid #f5f5f5",
      display: "flex",
      alignItems: "flex-start",
      lineHeight: "1.5",
    },
    overviewText: {
      fontSize: "1.1rem",
      lineHeight: "1.7",
      color: "#444",
    },
    prognosisCard: {
      background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
      borderLeft: "5px solid #4CAF50",
    },
    prognosisText: {
      fontSize: "1.1rem",
      lineHeight: "1.7",
      color: "#2e7d32",
      fontWeight: "500",
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
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
    },
    secondaryButton: {
      background: "white",
      color: "#333",
      border: "2px solid #e0e0e0",
    },
    aiSource: {
      textAlign: "center",
      color: "#666",
      fontSize: "0.9rem",
      marginTop: "20px",
      paddingTop: "20px",
      borderTop: "1px solid #eee",
    },
    nextStepInfo: {
      backgroundColor: "#e8f5e9",
      borderRadius: "12px",
      padding: "20px",
      margin: "30px 0",
      border: "1px solid #c8e6c9",
      textAlign: "center",
    },
  };

  // Add CSS animation for spinner
  const spinAnimation = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{spinAnimation}</style>
        <div style={styles.tabsContainer}>
          <button style={styles.tab}>INFO</button>
          <button style={styles.tab}>SYMPTOMS</button>
          <button style={styles.tab}>CONDITIONS</button>
          <button style={{ ...styles.tab, ...styles.tabActive }}>DETAILS</button>
          <button style={styles.tab}>TREATMENT</button>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Generating comprehensive disease information...</p>
          <p><small>Fetching AI-powered insights from DeepSeek</small></p>
          <div style={{fontSize: '14px', color: '#999', marginTop: '10px'}}>
            Disease: {diseaseData?.name || 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{spinAnimation}</style>
      <div style={styles.tabsContainer}>
        <button style={styles.tab}>INFO</button>
        <button style={styles.tab}>SYMPTOMS</button>
        <button style={styles.tab}>CONDITIONS</button>
        <button style={{ ...styles.tab, ...styles.tabActive }}>DETAILS</button>
        <button style={styles.tab}>TREATMENT</button>
      </div>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📋 Disease Details</h1>
        <p>AI-generated comprehensive disease information</p>
      </div>

      {diseaseData && (
        <div style={styles.diseaseHeader}>
          <div style={styles.diseaseTitle}>
            <div style={styles.diseaseIcon}>❤️</div>
            <div>
              <h2 style={styles.diseaseName}>{diseaseData.name}</h2>
              <div style={styles.aiBadge}>
                {aiSource === 'deepseek' ? '🤖 Powered by DeepSeek AI' : '📝 Using General Information'}
              </div>
            </div>
          </div>
          <div style={styles.probabilityBadge}>
            {diseaseData.probability}% Probability
          </div>
        </div>
      )}

      <div style={styles.content}>
        {error && aiSource === 'fallback' && (
          <div style={styles.errorAlert}>
            <h3>⚠️ Note: Using General Information</h3>
            <p>Could not fetch AI details: {error}</p>
            <p>Showing general medical information instead.</p>
            <button
              onClick={handleRetry}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              🔄 Try Fetching AI Data Again
            </button>
          </div>
        )}

        {aiSource === 'deepseek' && !error && (
          <div style={styles.successAlert}>
            <strong>✅ AI-generated information loaded successfully!</strong>
            <p style={{marginTop: '5px', fontSize: '14px'}}>
              Comprehensive details generated by DeepSeek AI
            </p>
          </div>
        )}

        {aiDetails ? (
          <>
            <div style={styles.detailsGrid}>
              {/* Overview */}
              <div style={{ ...styles.detailCard, ...styles.overviewCard }}>
                <h3 style={styles.cardTitle}>📝 Overview</h3>
                <p style={styles.overviewText}>{aiDetails.overview || "No overview available."}</p>
              </div>

              {/* Causes */}
              {aiDetails.causes && aiDetails.causes.length > 0 && (
                <div style={styles.detailCard}>
                  <h3 style={styles.cardTitle}>🔍 Causes & Risk Factors</h3>
                  <ul style={styles.infoList}>
                    {aiDetails.causes.map((cause, index) => (
                      <li key={index} style={styles.infoListItem}>
                        <span style={{marginRight: '10px', color: '#4CAF50'}}>•</span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Complications */}
              {aiDetails.complications && aiDetails.complications.length > 0 && (
                <div style={styles.detailCard}>
                  <h3 style={styles.cardTitle}>⚠️ Potential Complications</h3>
                  <ul style={styles.infoList}>
                    {aiDetails.complications.map((complication, index) => (
                      <li key={index} style={styles.infoListItem}>
                        <span style={{marginRight: '10px', color: '#4CAF50'}}>•</span>
                        {complication}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diagnosis Methods */}
              {aiDetails.diagnosis_methods && aiDetails.diagnosis_methods.length > 0 && (
                <div style={styles.detailCard}>
                  <h3 style={styles.cardTitle}>🔬 Diagnosis Methods</h3>
                  <ul style={styles.infoList}>
                    {aiDetails.diagnosis_methods.map((method, index) => (
                      <li key={index} style={styles.infoListItem}>
                        <span style={{marginRight: '10px', color: '#4CAF50'}}>•</span>
                        {method}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment Approaches */}
              {aiDetails.treatment_approaches && aiDetails.treatment_approaches.length > 0 && (
                <div style={styles.detailCard}>
                  <h3 style={styles.cardTitle}>💊 Treatment Approaches</h3>
                  <ul style={styles.infoList}>
                    {aiDetails.treatment_approaches.map((treatment, index) => (
                      <li key={index} style={styles.infoListItem}>
                        <span style={{marginRight: '10px', color: '#4CAF50'}}>•</span>
                        {treatment}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Facts */}
              {aiDetails.key_facts && aiDetails.key_facts.length > 0 && (
                <div style={styles.detailCard}>
                  <h3 style={styles.cardTitle}>💡 Key Facts</h3>
                  <ul style={styles.infoList}>
                    {aiDetails.key_facts.map((fact, index) => (
                      <li key={index} style={styles.infoListItem}>
                        <span style={{marginRight: '10px', color: '#4CAF50'}}>•</span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prognosis */}
              {aiDetails.prognosis && (
                <div style={{ ...styles.detailCard, ...styles.prognosisCard }}>
                  <h3 style={styles.cardTitle}>📈 Prognosis & Outlook</h3>
                  <p style={styles.prognosisText}>{aiDetails.prognosis}</p>
                </div>
              )}
            </div>

            {/* Next Step Information */}
            <div style={styles.nextStepInfo}>
              <h3 style={{color: '#2e7d32', marginBottom: '15px'}}>
                🛡️ Ready for Personalized Precautions?
              </h3>
              <p style={{marginBottom: '15px'}}>
                Now that you have detailed information about <strong>{diseaseData.name}</strong>, 
                get personalized precautions and treatment recommendations.
              </p>
              <p style={{fontSize: '14px', color: '#555'}}>
                The next page will provide AI-generated precautions, lifestyle changes, 
                emergency signs, and recovery guidance specific to your condition.
              </p>
            </div>
          </>
        ) : error && aiSource !== 'fallback' ? (
          <div style={styles.errorAlert}>
            <h3>❌ Unable to Load Details</h3>
            <p>{error}</p>
            <button
              onClick={handleRetry}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              🔄 Try Again
            </button>
          </div>
        ) : (
          <div style={styles.detailCard}>
            <h3 style={styles.cardTitle}>Loading Information</h3>
            <p>Details for {diseaseData?.name} are being loaded...</p>
            <button
              onClick={handleRetry}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>

      <div style={styles.actionButtons}>
        <button
          onClick={handleBack}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          ← Back to Conditions
        </button>
        
        {aiDetails && (
          <button
            onClick={handleViewPrecautions}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            Get AI Precautions for {diseaseData.name} →
          </button>
        )}
      </div>

      <div style={styles.aiSource}>
        {aiSource === 'deepseek' 
          ? 'AI-generated content by DeepSeek • Consult healthcare professional for medical advice'
          : 'General medical information • Consult healthcare professional for medical advice'}
      </div>
    </div>
  );
}