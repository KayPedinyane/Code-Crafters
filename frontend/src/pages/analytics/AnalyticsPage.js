import { useEffect, useMemo, useState } from "react";
import ReportSelector from "./ReportSelector";
import SuccessRateChart from "./SuccessRateChart";
import CustomFilterPanel from "./CustomFilterPanel";
import { useNavigate } from "react-router-dom";
import ApplicationVolumeChart from "./ApplicationVolumeChart";

function AnalyticsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [report, setReport] = useState("volume");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/analytics/applications`
        );

        if (!res.ok) throw new Error("Failed to fetch analytics");

        const data = await res.json();

        setApplications(data || []);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------- KPI METRICS ---------------- */

  const totalApplications = applications.length;

  const totalPlaced = applications.filter(
    (app) => app.status?.toLowerCase() === "accepted"
  ).length;

  const activeOpportunities = new Set(
    applications
      .filter((app) => app.opportunityStatus === "open")
      .map((app) => app.opportunityTitle)
  ).size;

const avgPlacementRate = useMemo(() => {
  const total  = applications.length;
  const placed = applications.filter(a => a.status?.toLowerCase() === "accepted").length;
  return total > 0 ? (placed / total) * 100 : 0;
}, [applications]);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return <div style={styles.loading}>Loading analytics...</div>;
  }

  return (
    <div style={styles.page}>
      <button style={styles.backButton} onClick={() => navigate("/AdminProfile")}>← Back</button>
      <h1 style={styles.heading}>Analytics Dashboard</h1>

      {/* KPI CARDS */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <p style={styles.cardLabel}>Total Applications</p>
          <h2 style={styles.cardValue}>{totalApplications}</h2>
          <p style={styles.customText}>
            Across all opportunities 
          </p>  
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.cardLabel}>Successfully Placed</p>
          <h2 style={styles.cardValueSP}>{totalPlaced}</h2>
          <p style={styles.customText}>
            Applicants 
          </p>  
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.cardLabel}>Avg Placement Rate</p>
          <h2 style={styles.cardValueAvg}>
            {avgPlacementRate.toFixed(1)}%
          </h2>
          <p style={styles.customText}>
            Across all sectors 
          </p>  
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.cardLabel}>Active Opportunities</p>
          <h2 style={styles.cardValueAO}>{activeOpportunities}</h2>
          <p style={styles.customText}>
            Open for applications 
          </p>  
        </div>
      </div>

      {/* REPORT SELECTOR */}
      <ReportSelector report={report} setReport={setReport} />

      {/* APPLICATION VOLUME */}
      {report === "volume" && (
          <ApplicationVolumeChart data={applications} />
      )}

      {/* SUCCESS RATE */}
      {report === "success" && (
          <SuccessRateChart data={applications} />
      )}

      {/* CUSTOM */}
      {report === "custom" && (
          <CustomFilterPanel data={applications} />
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    padding: "24px",
    background: "#f4f7fb",
    minHeight: "100vh",
  },

  heading: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0a1628",
    marginBottom: "20px",
    textAlign: "center",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },

  summaryCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  cardLabel: {
    fontSize: "16px",
    color: "#292424",
  },
  
  cardValue: {
    fontSize: "28px",
    color: "#00c853",
    marginTop: "8px",
  },

  cardValueSP: {
    fontSize: "28px",
    color: "#0096c8",
    marginTop: "8px",
  },

  cardValueAvg: {
    fontSize: "28px",
    color: "#ff6d00",
    marginTop: "8px",
  },

  cardValueAO: {
    fontSize: "28px",
    color: "#8f39f1",
    marginTop: "8px",
  },

  chartCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
  },

  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  chartTitle: {
    fontSize: "20px",
    fontWeight: "600",
  },

  filterContainer: {
    display: "flex",
    gap: "8px",
  },

  filterButton: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    cursor: "pointer",
  },

  customText: {
    color: "#9CA3AF",
    fontSize: "14px",
    marginTop: "4px",
  },

  loading: {
    padding: "40px",
    fontSize: "18px",
  },

  backButton: {
    position: "absolute",
    top: "20px",
    left: "20px",
    backgroundColor: "#00c853",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default AnalyticsPage;