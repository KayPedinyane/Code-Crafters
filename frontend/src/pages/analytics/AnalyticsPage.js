import { useEffect, useMemo, useState } from "react";
import ReportSelector from "./ReportSelector";
import SuccessRateChart from "./SuccessRateChart";
import ExportButtons from "./ExportButtons";
import CustomFilterPanel from "./CustomFilterPanel";
import { useNavigate } from "react-router-dom";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

function AnalyticsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [report, setReport] = useState("volume");
  const [loading, setLoading] = useState(true);

  const [opportunityFilter, setOpportunityFilter] =
    useState("all");

    useEffect(() => {
  console.log("ANALYTICS DATA:", applications);
}, [applications]);

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

  /* ---------------- SAFE SECTOR STATS ---------------- */

  const sectorStats = {};

  applications.forEach((app) => {
    const sector = app.sector || "Unknown";

    if (!sectorStats[sector]) {
      sectorStats[sector] = { total: 0, placed: 0 };
    }

    sectorStats[sector].total++;

    if (app.status?.toLowerCase() === "accepted") {
      sectorStats[sector].placed++;
    }
  });

  const avgPlacementRate = useMemo(() => {
    const sectors = Object.values(sectorStats);

    if (!sectors.length) return 0;

    const totalRate = sectors.reduce((sum, s) => {
      const rate = s.total ? (s.placed / s.total) * 100 : 0;
      return sum + rate;
    }, 0);

    return totalRate / sectors.length;
  }, [applications]);

  /* ---------------- FILTER ---------------- */

  const filteredVolumeApps = useMemo(() => {
    return applications.filter((app) => {
      if (opportunityFilter === "active") {
        return app.opportunityStatus === "open";
      }

      if (opportunityFilter === "closed") {
        return app.opportunityStatus === "closed";
      }

      return true;
    });
  }, [applications, opportunityFilter]);

  /* ---------------- VOLUME DATA ---------------- */

  const volumeData = useMemo(() => {
    const map = {};

    filteredVolumeApps.forEach((app) => {
      const key = app.opportunityTitle || "Unknown";

      if (!map[key]) {
        map[key] = {
          name: key,
          applications: 0,
        };
      }

      map[key].applications++;
    });

    return Object.values(map);
  }, [filteredVolumeApps]);

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
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h2 style={styles.chartTitle}>Application Volume</h2>

            <div style={styles.filterContainer}>
              {["all", "active", "closed"].map((type) => (
                <button
                  key={type}
                  style={{
                    ...styles.filterButton,
                    backgroundColor:
                      opportunityFilter === type
                        ? "#00c853"
                        : "#fff",
                    color:
                      opportunityFilter === type
                        ? "#fff"
                        : "#0a1628",
                  }}
                  onClick={() => setOpportunityFilter(type)}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="applications"
                fill="#00c853"
              />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: "20px" }}>
            <ExportButtons data={volumeData} />
          </div>
        </div>
      )}

      {/* SUCCESS RATE */}
      {report === "success" && (
        <div style={styles.chartCard}>
          <SuccessRateChart data={applications} />
        </div>
      )}

      {/* CUSTOM */}
      {report === "custom" && (
        <div style={styles.chartCard}>
          <CustomFilterPanel data={applications} />
        </div>
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