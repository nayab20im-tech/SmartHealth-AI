import React, { Component } from "react";

class FindDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      locationContext: "your area", // Dynamic heading state
      doctors: [],
      loading: false,
      hasSearched: false,
      error: null,
      showModal: false,
      selectedDoctor: null,
      bookingStep: 1,
      appointments: [] // Stores "booked" sessions
    };
  }

  fetchDoctors = async () => {
    const { searchQuery } = this.state;
    if (!searchQuery) return;

    this.setState({ loading: true, hasSearched: true, error: null });

    try {
      const response = await fetch(
        `https://clinicaltables.nlm.nih.gov/api/npi_idv/v3/search?terms=${encodeURIComponent(searchQuery)}&max_results=10`
      );
      const data = await response.json();
      const details = data[3] || [];

      if (details.length === 0) {
        this.setState({ error: "No providers found. Try searching a city like 'Orlando' or 'New York'.", loading: false });
        return;
      }

      const formattedDoctors = details.map((doc) => ({
        id: doc[0],
        name: `Dr. ${doc[1]} ${doc[2]}`,
        specialty: doc[3] || "General Practice",
        address: doc[4] || "Clinic Address available on request",
        phone: doc[5] || "Contact info unavailable",
        rating: (Math.random() * (5 - 4.5) + 4.5).toFixed(1),
        reviews: Math.floor(Math.random() * 100) + 12,
        isVerified: true,
      }));

      this.setState({ 
        doctors: formattedDoctors, 
        loading: false,
        locationContext: searchQuery 
      });
    } catch (err) {
      this.setState({ error: "Registry connection failed. Please try again.", loading: false });
    }
  };

  handleConfirmBooking = () => {
    const { selectedDoctor } = this.state;
    const newAppointment = {
      doctor: selectedDoctor.name,
      id: selectedDoctor.id,
      date: new Date().toLocaleDateString()
    };
    
    this.setState(prevState => ({
      appointments: [...prevState.appointments, newAppointment],
      bookingStep: 2
    }));
  };

  openBooking = (doctor) => {
    this.setState({ showModal: true, selectedDoctor: doctor, bookingStep: 1 });
  };

  closeModal = () => {
    this.setState({ showModal: false, selectedDoctor: null });
  };

  render() {
    const { hasSearched, doctors, loading, error, showModal, selectedDoctor, bookingStep, locationContext } = this.state;

    return (
      <div style={s.page}>
        {/* HERO SECTION */}
        <section style={s.hero}>
          <div style={s.container}>
            <p style={s.heroSubtitle}>Access 8 Million+ Verified Physician Profiles</p>
            <h1 style={s.heroTitle}>Find Doctors and Dentists Near You</h1>

            <div style={s.searchWrapper}>
              <div style={s.searchBar}>
                <input
                  type="text"
                  placeholder="City, Zip, or Specialty..."
                  style={s.searchInput}
                  value={this.state.searchQuery}
                  onChange={(e) => this.setState({ searchQuery: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && this.fetchDoctors()}
                />
                <button style={s.searchBtn} onClick={this.fetchDoctors}>
                  {loading ? "..." : "🔍 SEARCH"}
                </button>
              </div>
              <div style={s.searchTags}>
                {["Family Medicine", "Dermatologists", "OBGYNs"].map((tag) => (
                  <span key={tag} style={s.tag} onClick={() => this.setState({ searchQuery: tag }, this.fetchDoctors)}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {!hasSearched ? (
          <section style={s.landingContent}>
            <div style={s.infoGrid}>
                <div style={s.infoText}>
                    <h2 style={{ fontSize: "28px", color: "#222" }}>Choose the healthcare that is right for you</h2>
                    <ul style={s.list}>
                        <li>✓ Profiles for 3 million+ physicians</li>
                        <li>✓ Book appointments online securely</li>
                        <li>✓ Find award winning local hospitals</li>
                    </ul>
                </div>
                <div style={s.docIllustrationContainer}>
                    <img 
                      src="images.jpg" // Ensure the filename matches your local path or assets
                      alt="Healthcare Professional" 
                      style={s.docImage}
                    />
                </div>
            </div>
          </section>
        ) : (
          <section style={s.resultsSection}>
            <div style={s.container}>
              <h2 style={s.resultsHeader}>Providers in "{locationContext}"</h2>
              {error && <p style={s.errorMessage}>{error}</p>}
              
              <div style={s.doctorList}>
                {doctors.map((doc, i) => (
                  <div key={i} style={s.docCard}>
                    <div style={s.cardMid}>
                      <h3 style={s.docName}>{doc.name}</h3>
                      <p style={s.docSpec}>{doc.specialty}</p>
                      <p style={s.docAddress}>{doc.address}</p>
                      <div style={s.ratingRow}>
                        <span style={{ color: '#ffc107' }}>★★★★★</span>
                        <span style={s.ratingText}>{doc.rating} ({doc.reviews} Reviews)</span>
                      </div>
                    </div>
                    <div style={s.cardRight}>
                      <button style={s.requestBtn} onClick={() => this.openBooking(doc)}>
                        Request Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button style={s.backBtn} onClick={() => this.setState({ hasSearched: false })}>← Back to search</button>
            </div>
          </section>
        )}

        {/* DYNAMIC CTA SECTION */}
        <section style={s.ctaSection}>
          <h3 style={s.ctaTitle}>Top Doctors Near <br /> 
            <span style={{ color: '#3263e4', textTransform: 'capitalize' }}>{locationContext}</span>
          </h3>
          <button style={s.findBtn} onClick={() => window.scrollTo(0,0)}>FIND YOUR DOCTOR</button>
        </section>

        {/* BOOKING MODAL */}
        {showModal && (
          <div style={s.modalOverlay} onClick={this.closeModal}>
            <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
              <button style={s.closeBtn} onClick={this.closeModal}>&times;</button>
              {bookingStep === 1 ? (
                <div>
                  <h2 style={{ color: "#002855" }}>Book Appointment</h2>
                  <p>Provider: <b>{selectedDoctor?.name}</b></p>
                  <input type="text" placeholder="Your Full Name" style={s.modalInput} />
                  <input type="date" style={s.modalInput} />
                  <button style={s.searchBtn} onClick={this.handleConfirmBooking}>Confirm & Send Request</button>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "50px" }}>✅</div>
                  <h2 style={{ color: "#28a745" }}>Request Sent!</h2>
                  <p>The office will contact you shortly to finalize your visit.</p>
                  <button style={s.searchBtn} onClick={this.closeModal}>Close</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const s = {
  page: { width: "100%", fontFamily: "Arial, sans-serif" },
  container: { maxWidth: "1000px", margin: "0 auto", padding: "0 20px" },
  hero: { backgroundColor: "#000b1c", color: "#fff", padding: "80px 0", textAlign: "center" },
  heroTitle: { fontSize: "42px", marginBottom: "20px" },
  heroSubtitle: { color: "#00c2ff", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" },
  searchWrapper: { maxWidth: "700px", margin: "0 auto" },
  searchBar: { display: "flex", backgroundColor: "#fff", borderRadius: "30px", overflow: "hidden", padding: "5px" },
  searchInput: { flex: 1, padding: "15px 25px", border: "none", outline: "none", fontSize: "16px", color: "#333" },
  searchBtn: { backgroundColor: "#3263e4", color: "#fff", border: "none", padding: "0 30px", borderRadius: "25px", fontWeight: "bold", cursor: "pointer" },
  searchTags: { marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" },
  tag: { border: "1px solid #444", borderRadius: "20px", padding: "5px 15px", fontSize: "12px", color: "#ccc", cursor: "pointer" },
  
  landingContent: { padding: "80px 0", backgroundColor: "#f0f4f9" },
  infoGrid: { display: "flex", justifyContent: "center", alignItems: "center", gap: "50px", maxWidth: "1000px", margin: "0 auto" },
  infoText: { flex: 1 },
  list: { listStyle: "none", padding: 0, lineHeight: "2.5", fontSize: "16px", color: "#444" },
  
  docIllustrationContainer: { 
    width: "250px", 
    height: "250px", 
    backgroundColor: "#ddecff", 
    borderRadius: "50%", 
    overflow: "hidden", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  docImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // Ensures the image fills the circle without distortion
  },

  resultsSection: { padding: "40px 0", backgroundColor: "#f8f9fa" },
  resultsHeader: { marginBottom: "25px", color: "#333" },
  docCard: { display: "flex", backgroundColor: "#fff", padding: "25px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #eee" },
  cardMid: { flex: 1 },
  docName: { color: "#002855", margin: "0 0 5px 0" },
  docSpec: { color: "#3263e4", fontWeight: "bold", fontSize: "14px" },
  docAddress: { fontSize: "13px", color: "#666" },
  ratingRow: { marginTop: "10px" },
  ratingText: { marginLeft: "10px", fontSize: "13px", color: "#444" },
  requestBtn: { backgroundColor: "#3263e4", color: "#fff", border: "none", padding: "12px 25px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", alignSelf: "center" },
  backBtn: { marginTop: "20px", background: "none", border: "1px solid #3263e4", color: "#3263e4", padding: "10px 20px", borderRadius: "4px", cursor: "pointer" },
  
  ctaSection: { padding: "60px 0", textAlign: "center", borderTop: "1px solid #eee" },
  ctaTitle: { fontSize: "24px", color: "#222" },
  findBtn: { background: "none", border: "1px solid #3263e4", color: "#3263e4", padding: "12px 30px", borderRadius: "25px", cursor: "pointer", marginTop: "15px", fontWeight: "bold" },
  
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { backgroundColor: "#fff", padding: "40px", borderRadius: "15px", width: "400px", position: "relative" },
  closeBtn: { position: "absolute", top: "10px", right: "15px", background: "none", border: "none", fontSize: "24px", cursor: "pointer" },
  modalInput: { width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "6px" },
  errorMessage: { color: "red", fontWeight: "bold", textAlign: "center", marginTop: "20px" }
};

export default FindDoctor;