import React, { useState, useEffect } from "react";

export default function ConditionsPage({ onNavigate, onBack }) {
  const [diagnosisResults, setDiagnosisResults] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Backend URL configuration
  const BACKEND_URL = "http://localhost:8000";
  const PREDICT_ENDPOINT = `${BACKEND_URL}/predict`;

  useEffect(() => {
    const fetchDiagnosis = async () => {
      try {
        // Get selected symptoms from localStorage
        const storedSymptoms = localStorage.getItem('selectedSymptoms');
        const symptomsArray = storedSymptoms ? JSON.parse(storedSymptoms) : [];
        setSelectedSymptoms(symptomsArray);

        // Clear old results
        localStorage.removeItem('diagnosisResults');

        // If no symptoms, show error
        if (symptomsArray.length === 0) {
          setError("No symptoms selected. Please go back and select symptoms.");
          setLoading(false);
          return;
        }

        // Try to fetch from backend
        console.log("Fetching diagnosis from:", PREDICT_ENDPOINT);
        console.log("Symptoms:", symptomsArray);

        const response = await fetch(PREDICT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            symptoms: symptomsArray
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Backend response:", data);
        
        // Check if we got predictions
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Process the response
        const processedData = processBackendResponse(data, symptomsArray);
        setDiagnosisResults(processedData);
        localStorage.setItem('diagnosisResults', JSON.stringify(processedData));
        setError(null);
        
      } catch (err) {
        console.error("Error fetching diagnosis:", err);
        setError(`Unable to get diagnosis: ${err.message}. Please ensure backend is running.`);
        setDiagnosisResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnosis();
  }, []);

  // Process real backend response
  const processBackendResponse = (backendData, symptoms) => {
    console.log("Processing backend data:", backendData);
    
    // Check for different response formats
    if (backendData.conditions && Array.isArray(backendData.conditions)) {
      return backendData;
    } else if (backendData.predictions && Array.isArray(backendData.predictions)) {
      return {
        conditions: backendData.predictions.map((pred, index) => ({
          id: index + 1,
          name: pred.disease || pred.name || `Prediction ${index + 1}`,
          probability: pred.probability || pred.confidence || Math.round((1 / backendData.predictions.length) * 100),
          description: pred.description || `Based on your symptoms: ${symptoms.join(', ')}`,
          symptoms: symptoms,
          severity: pred.severity || 'Moderate',
          urgency: pred.urgency || 'Medium',
          commonTreatments: pred.treatments || ['Consult healthcare provider']
        })),
        primaryCondition: backendData.primaryCondition || (backendData.predictions[0]?.disease || 'Prediction'),
        confidence: backendData.confidence || 85
      };
    } else if (backendData.prediction) {
      return {
        conditions: [{
          id: 1,
          name: backendData.prediction,
          probability: backendData.probability || backendData.confidence || 85,
          description: `Diagnosis based on symptoms: ${symptoms.join(', ')}`,
          symptoms: symptoms,
          severity: 'Moderate',
          urgency: 'Medium',
          commonTreatments: ['Medical consultation recommended']
        }],
        primaryCondition: backendData.prediction,
        confidence: backendData.confidence || 85
      };
    } else {
      throw new Error("Unexpected response format from server");
    }
  };

  const handleConditionSelect = (condition) => {
    setSelectedCondition(condition);
  };

  const handlePrevious = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleViewDetails = () => {
  if (!selectedCondition) {
    alert("Please select a condition to view details");
    return;
  }
  
  // Save selected disease data
  const diseaseData = {
    name: selectedCondition.name,
    probability: selectedCondition.probability,
    symptoms: selectedSymptoms,
    severity: selectedCondition.severity || 'Moderate',
    urgency: selectedCondition.urgency || 'Medium',
    commonTreatments: selectedCondition.commonTreatments || [],
    confidence: selectedCondition.confidence || 85,
    timestamp: new Date().toISOString()
  };
  
  console.log("💾 Saving to localStorage:", diseaseData); // ADD THIS LINE
  localStorage.setItem('selectedDisease', JSON.stringify(diseaseData));
  
  // Navigate to details page
  if (onNavigate) {
    onNavigate("details");
  }
};

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    setDiagnosisResults(null);
    
    const symptomsArray = selectedSymptoms;
    try {
      const response = await fetch(PREDICT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symptoms: symptomsArray
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      const processedData = processBackendResponse(data, symptomsArray);
      setDiagnosisResults(processedData);
      localStorage.setItem('diagnosisResults', JSON.stringify(processedData));
      
    } catch (err) {
      setError(`Retry failed: ${err.message}`);
    } finally {
      setLoading(false);
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
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px 20px",
    },
    header: {
      marginBottom: "40px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "16px",
      color: "#666",
      marginBottom: "20px",
    },
    confidenceBadge: {
      backgroundColor: "#e3f2fd",
      color: "#1976d2",
      padding: "8px 16px",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "500",
      display: "inline-block",
    },
    summaryCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      marginBottom: "30px",
    },
    summaryTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "16px",
    },
    symptomsList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    },
    symptomTag: {
      backgroundColor: "#f0f7ff",
      color: "#4a90e2",
      padding: "6px 12px",
      borderRadius: "16px",
      fontSize: "14px",
      display: "inline-block",
    },
    conditionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "20px",
      marginBottom: "40px",
    },
    conditionCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      border: "2px solid transparent",
      transition: "all 0.3s",
      cursor: "pointer",
    },
    conditionCardSelected: {
      borderColor: "#4a90e2",
      boxShadow: "0 4px 12px rgba(74, 144, 226, 0.2)",
    },
    conditionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "12px",
    },
    conditionName: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "4px",
    },
    conditionProbability: {
      fontSize: "14px",
      color: "#666",
    },
    probabilityBadge: {
      backgroundColor: "#4a90e2",
      color: "white",
      padding: "4px 12px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
    },
    conditionDescription: {
      fontSize: "14px",
      color: "#666",
      lineHeight: "1.6",
      marginBottom: "16px",
    },
    conditionDetails: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginBottom: "16px",
    },
    detailItem: {
      display: "flex",
      flexDirection: "column",
    },
    detailLabel: {
      fontSize: "12px",
      color: "#999",
      marginBottom: "4px",
    },
    detailValue: {
      fontSize: "14px",
      color: "#333",
      fontWeight: "500",
    },
    treatmentsList: {
      listStyle: "none",
      padding: 0,
      margin: "12px 0",
    },
    treatmentItem: {
      fontSize: "14px",
      color: "#666",
      padding: "4px 0",
      display: "flex",
      alignItems: "center",
    },
    treatmentIcon: {
      width: "16px",
      height: "16px",
      marginRight: "8px",
      color: "#4a90e2",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
      fontSize: "18px",
      color: "#666",
    },
    errorContainer: {
      backgroundColor: "#ffebee",
      border: "1px solid #ffcdd2",
      borderRadius: "12px",
      padding: "30px",
      textAlign: "center",
      margin: "40px auto",
      maxWidth: "600px",
    },
    actionButtons: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "40px",
    },
    previousButton: {
      padding: "12px 24px",
      backgroundColor: "white",
      color: "#666",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "15px",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    detailsButton: {
      padding: "12px 24px",
      backgroundColor: "#2196F3",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "15px",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    selectedConditionInfo: {
      backgroundColor: "#e8f5e9",
      borderRadius: "12px",
      padding: "20px",
      margin: "20px 0",
      border: "1px solid #c8e6c9",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.tabsContainer}>
          <button style={styles.tab}>INFO</button>
          <button style={styles.tab}>SYMPTOMS</button>
          <button style={{ ...styles.tab, ...styles.tabActive }}>CONDITIONS</button>
          <button style={styles.tab}>DETAILS</button>
          <button style={styles.tab}>TREATMENT</button>
        </div>
        <div style={styles.loadingContainer}>
          <div style={{textAlign: 'center'}}>
            <div>Analyzing your symptoms...</div>
            <div style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>
              Connecting to medical AI model
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tabsContainer}>
        <button style={styles.tab}>INFO</button>
        <button style={styles.tab}>SYMPTOMS</button>
        <button style={{ ...styles.tab, ...styles.tabActive }}>CONDITIONS</button>
        <button style={styles.tab}>DETAILS</button>
        <button style={styles.tab}>TREATMENT</button>
      </div>

      <div style={styles.content}>
        {error ? (
          <div style={styles.errorContainer}>
            <h3 style={{color: '#c62828', marginBottom: '10px'}}>⚠️ Unable to Get Diagnosis</h3>
            <p>{error}</p>
            <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
              <button
                onClick={handleRetry}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                🔄 Try Again
              </button>
              <button
                onClick={handlePrevious}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ← Go Back
              </button>
            </div>
          </div>
        ) : diagnosisResults ? (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Diagnosis Results</h1>
              <p style={styles.subtitle}>
                Based on your symptoms: {selectedSymptoms.join(', ')}
              </p>
              <div style={styles.confidenceBadge}>
                Model Confidence: {diagnosisResults.confidence || 85}%
              </div>
            </div>

            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Your Symptoms Analyzed</h3>
              <div style={styles.symptomsList}>
                {selectedSymptoms.map((symptom, index) => (
                  <span key={index} style={styles.symptomTag}>
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            <div style={styles.conditionsGrid}>
              {diagnosisResults.conditions?.map((condition, index) => (
                <div
                  key={condition.id || index}
                  style={
                    selectedCondition?.id === condition.id
                      ? { ...styles.conditionCard, ...styles.conditionCardSelected }
                      : styles.conditionCard
                  }
                  onClick={() => handleConditionSelect(condition)}
                >
                  <div style={styles.conditionHeader}>
                    <div>
                      <h3 style={styles.conditionName}>{condition.name}</h3>
                      <p style={styles.conditionProbability}>
                        Probability: {condition.probability}%
                      </p>
                    </div>
                    <div style={styles.probabilityBadge}>
                      {condition.probability}%
                    </div>
                  </div>
                  
                  <p style={styles.conditionDescription}>
                    {condition.description}
                  </p>
                  
                  <div style={styles.conditionDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Severity</span>
                      <span style={styles.detailValue}>{condition.severity}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Urgency</span>
                      <span style={styles.detailValue}>{condition.urgency}</span>
                    </div>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Recommended Actions</span>
                    <ul style={styles.treatmentsList}>
                      {condition.commonTreatments?.slice(0, 3).map((treatment, idx) => (
                        <li key={idx} style={styles.treatmentItem}>
                          <svg
                            style={styles.treatmentIcon}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Condition Information */}
            {selectedCondition && (
              <div style={styles.selectedConditionInfo}>
                <h3 style={{color: '#2e7d32', marginBottom: '15px'}}>
                  ✅ Selected: {selectedCondition.name} ({selectedCondition.probability}% probability)
                </h3>
                <p style={{marginBottom: '15px'}}>
                  <strong>Description:</strong> {selectedCondition.description}
                </p>
                <div style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                  <div>
                    <strong>Severity:</strong> {selectedCondition.severity}
                  </div>
                  <div>
                    <strong>Urgency:</strong> {selectedCondition.urgency}
                  </div>
                </div>
                <p style={{fontSize: '14px', color: '#555'}}>
                  Click the button below to get AI-generated detailed information about {selectedCondition.name}
                </p>
              </div>
            )}

            <div style={styles.actionButtons}>
              <button
                onClick={handlePrevious}
                style={styles.previousButton}
              >
                ← Back to Symptoms
              </button>

              {selectedCondition && (
                <button
                  onClick={handleViewDetails}
                  style={styles.detailsButton}
                >
                  Get AI Details for {selectedCondition.name} →
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={styles.errorContainer}>
            <h3>No Results Available</h3>
            <p>Unable to get diagnosis results. Please try again.</p>
            <button
              onClick={handleRetry}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}