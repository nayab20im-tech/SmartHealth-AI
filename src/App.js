import React, { Component } from "react";
import Header from "./MyComponents/Header";
import Footer from "./MyComponents/Footer";
import Home from "./MyComponents/Home";
import Login from "./MyComponents/Login"; 
import FindDoctor from "./MyComponents/FindDoctor";
import Symptoms from "./MyComponents/Symptoms";
import Conditions from "./MyComponents/Conditions";
import DetailsPage from './MyComponents/DetailsPage';        // ADDED
import PrecautionsPage from './MyComponents/PrecautionsPage'; // ADDED

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogin: false,
      currentPage: "home",
      diagnosisData: null,
      selectedDisease: null
    };
  }

  toggleLogin = () => {
    this.setState({ showLogin: !this.state.showLogin });
  };

  // Function to switch pages
  navigateTo = (page, data = {}) => {
    console.log(`🔄 Navigating to: ${page}`, data);
    
    if (page === "conditions" && data.diagnosisData) {
      this.setState({ 
        currentPage: page, 
        diagnosisData: data.diagnosisData 
      });
    } else if ((page === "details" || page === "precautions") && data.disease) {
      this.setState({ 
        currentPage: page, 
        selectedDisease: data.disease 
      });
    } else {
      this.setState({ 
        currentPage: page,
        // Clear data when navigating to other pages
        diagnosisData: null,
        selectedDisease: null
      });
    }
  };

  // Function to go back to previous page
  goBack = () => {
    const { currentPage } = this.state;
    console.log(`🔙 Going back from: ${currentPage}`);
    
    if (currentPage === "symptoms") {
      this.navigateTo("home");
    } else if (currentPage === "conditions") {
      this.navigateTo("symptoms");
    } else if (currentPage === "details") {
      this.navigateTo("conditions");
    } else if (currentPage === "precautions") {
      this.navigateTo("details");
    }
  };

  render() {
    const { currentPage, diagnosisData, selectedDisease } = this.state;
    
    console.log(`📱 Current Page: ${currentPage}`);
    console.log(`💾 Diagnosis Data:`, diagnosisData);
    console.log(`🦠 Selected Disease:`, selectedDisease);

    return (
      <div style={styles.appRoot}>
        {/* Header */}
        <Header
          onLoginClick={this.toggleLogin}
          onNavigate={this.navigateTo}
        />

        <main style={styles.mainContainer}>
          {/* Pages */}
          {currentPage === "home" && (
            <Home onContinue={() => this.navigateTo("symptoms")} />
          )}

          {currentPage === "symptoms" && (
            <Symptoms 
              onNavigate={this.navigateTo}
              onBack={() => this.navigateTo("home")}
            />
          )}

          {currentPage === "conditions" && (
            <Conditions 
              onNavigate={this.navigateTo}
              onBack={() => this.navigateTo("symptoms")}
            />
          )}

          {/* ✅ ADD THESE TWO PAGES - This is what was missing! */}
          {currentPage === "details" && (
            <DetailsPage 
              onNavigate={this.navigateTo}
              onBack={() => this.navigateTo("conditions")}
            />
          )}

          {currentPage === "precautions" && (
            <PrecautionsPage 
              onNavigate={this.navigateTo}
              onBack={() => this.navigateTo("details")}
            />
          )}

          {currentPage === "find-doctor" && <FindDoctor />}

          {/* Login Modal */}
          {this.state.showLogin && (
            <div style={styles.overlay} onClick={this.toggleLogin}>
              <div
                style={styles.loginModal}
                onClick={(e) => e.stopPropagation()}
              >
                <Login onClose={this.toggleLogin} />
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    );
  }
}

const styles = {
  appRoot: { 
    display: "flex", 
    flexDirection: "column", 
    minHeight: "100vh" 
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    position: "relative"
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },
  loginModal: {
    width: "90%",
    maxWidth: "850px",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  }
};

export default App;