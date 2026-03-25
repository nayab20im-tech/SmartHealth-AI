import React, { Component } from "react";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      age: "", 
      sex: "",
      isDisclaimerOpen: false,
      ageError: false,
      currentTab: "INFO"
    };
  }

  toggleDisclaimer = () => {
    this.setState({ isDisclaimerOpen: !this.state.isDisclaimerOpen });
  };

  handleAgeChange = (e) => {
    const value = e.target.value;
    this.setState({ age: value });

    if (value !== "" && (parseInt(value) <= 0 || parseInt(value) > 120)) {
      this.setState({ ageError: true });
    } else {
      this.setState({ ageError: false });
    }
  };

  render() {
    const { age, sex, isDisclaimerOpen, ageError, currentTab } = this.state;
    const isDisabled = !age || !sex || ageError;

    const getTabStyle = (tabName) => {
      return currentTab === tabName ? s.activeTab : s.tab;
    };

    return (
      <div style={s.card}>
        {/* Tabs */}
        <div style={s.tabs}>
          <div style={getTabStyle("INFO")}>INFO</div>
          <div style={getTabStyle("SYMPTOMS")}>SYMPTOMS</div>
          <div style={getTabStyle("CONDITIONS")}>CONDITIONS</div>
          <div style={getTabStyle("DETAILS")}>DETAILS</div>
          <div style={getTabStyle("TREATMENT")}>TREATMENT</div>
        </div>

        {/* Content */}
        <div style={s.content}>
          <h1 style={s.heading}>
            <span style={{ color: "#0077c8" }}>SmartHealth AI</span> Symptom Checker
            <span style={s.bodyMap}> WITH BODY MAP</span>
          </h1>

          <p style={s.subtitle}>
            Identify possible conditions and treatment related to your symptoms.
          </p>

          {/* Disclaimer */}
          <div style={s.disclaimerBox}>
            <p style={s.disclaimerText}>
              This tool does not provide medical advice.
              {isDisclaimerOpen && (
                <span style={{ display: "block", marginTop: "10px" }}>
                  This tool is not intended to be a substitute for professional medical advice,
                  diagnosis, or treatment. Always seek the advice of your physician or other
                  qualified health provider with any questions you may have regarding a medical
                  condition. If you think you may have a medical emergency, call your doctor or
                  911 immediately.
                </span>
              )}
            </p>

            <span style={s.link} onClick={this.toggleDisclaimer}>
              {isDisclaimerOpen
                ? "See less information ▴"
                : "See additional information ▾"}
            </span>
          </div>

          {/* Age & Sex */}
          <div style={s.formRow}>
            <div style={s.inputCol}>
              <label style={s.label}>Age</label>
              <input
                type="number"
                value={age}
                onChange={this.handleAgeChange}
                style={{
                  ...s.ageInput,
                  borderColor: ageError ? "#ff5c62" : "#ccc"
                }}
              />
            </div>

            <div style={s.inputCol}>
              <label style={s.label}>Sex</label>
              <div style={s.sexGroup}>
                <button
                  onClick={() => this.setState({ sex: "Male" })}
                  style={{
                    ...s.sexBtn,
                    backgroundColor: sex === "Male" ? "#e6f3fb" : "white",
                    borderColor: sex === "Male" ? "#0077c8" : "#ccc"
                  }}
                >
                  Male
                </button>

                <button
                  onClick={() => this.setState({ sex: "Female" })}
                  style={{
                    ...s.sexBtn,
                    backgroundColor: sex === "Female" ? "#e6f3fb" : "white",
                    borderColor: sex === "Female" ? "#0077c8" : "#ccc"
                  }}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {ageError && (
            <div style={s.errorBox}>
              Please enter a valid age
            </div>
          )}

          {/* ✅ CONTINUE BUTTON (CONNECTED TO APP) */}
          <button 
            disabled={isDisabled}
            onClick={this.props.onContinue}
            style={{
              ...s.continue,
              background: isDisabled ? "#e5e5e5" : "#0077c8",
              color: isDisabled ? "#999" : "white",
              cursor: isDisabled ? "not-allowed" : "pointer"
            }}
          >
            Continue ❯
          </button>
        </div>
      </div>
    );
  }
}

const s = {
  card: {
    background: "white",
    width: "100%",
    maxWidth: "700px",
    borderRadius: "2px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
    margin: "0 auto"
  },
  tabs: {
    display: "flex",
    background: "#f8f9fa",
    borderBottom: "1px solid #dee2e6"
  },
  activeTab: {
    padding: "12px 20px",
    borderTop: "3px solid #00a6b2",
    background: "white",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center"
  },
  tab: {
    padding: "12px 20px",
    fontSize: "12px",
    color: "#6c757d",
    borderRight: "1px solid #eee",
    flex: 1,
    textAlign: "center"
  },
  content: { textAlign: "center", padding: "40px" },
  heading: { fontSize: "24px", fontWeight: "bold", marginBottom: "10px" },
  bodyMap: { fontSize: "10px", color: "#0077c8", marginLeft: "5px" },
  subtitle: { fontSize: "16px", color: "#555", marginBottom: "25px" },
  disclaimerBox: { border: "1px solid #eee", padding: "15px", marginBottom: "30px" },
  disclaimerText: { fontSize: "12px", color: "#888", lineHeight: "1.5" },
  link: { color: "#0077c8", cursor: "pointer", fontSize: "12px", textDecoration: "underline" },
  errorBox: {
    backgroundColor: "#ff5c62",
    color: "white",
    padding: "8px 15px",
    borderRadius: "4px",
    fontSize: "13px",
    margin: "-10px auto 20px"
  },
  formRow: { display: "flex", justifyContent: "center", gap: "50px", marginBottom: "30px" },
  inputCol: { display: "flex", flexDirection: "column", alignItems: "center" },
  label: { marginBottom: "10px", fontSize: "16px", fontWeight: "bold" },
  ageInput: {
    width: "60px",
    height: "40px",
    border: "1px solid #ccc",
    textAlign: "center",
    fontSize: "18px",
    borderRadius: "4px"
  },
  sexGroup: { display: "flex", border: "1px solid #ccc", borderRadius: "4px" },
  sexBtn: { width: "100px", height: "40px", border: "none", cursor: "pointer" },
  continue: {
    padding: "12px 60px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "bold"
  }
};

export default Home;
