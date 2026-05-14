import React from "react";
import ExportButtons from "./ExportButtons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function ApplicationVolumeChart({ data = [] }) {
  /* -------------------------------- */
  /* DATA PROCESSING                  */
  /* -------------------------------- */
  const chartData = Object.values(
    data.reduce((acc, app) => {
      const key = app.opportunityTitle || "Unknown Opportunity";

      if (!acc[key]) {
        acc[key] = { name: key, applications: 0 };
      }

      acc[key].applications++;
      return acc;
    }, {})
  ).sort((a, b) => b.applications - a.applications);

  return (
    <article style={styles.container}>
      {/* TOP SECTION: SEMANTIC HEADER */}
      <header style={styles.topGrid}>
        <div>
          <h2 style={styles.mainTitle}>Application Volume</h2>
          <p style={styles.description}>
            This tab answers the question: which opportunities are attracting the most interest? 
            It tracks the total number of applications received across different opportunity titles.
          </p>
        </div>

        {/* KEY/LEGEND AREA */}
        <aside style={styles.legendCard} aria-label="Chart Legend">
          <span style={styles.legendTitle}>Volume Key:</span>
          <div style={styles.legendItem}>
            <span style={{ ...styles.dot, backgroundColor: "#00c853" }} aria-hidden="true" /> 
            High Demand
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.dot, backgroundColor: "#ff9800" }} aria-hidden="true" /> 
            Moderate Interest
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.dot, backgroundColor: "#ff5252" }} aria-hidden="true" /> 
            Low Volume
          </div>
        </aside>
      </header>

      {/* MAIN CONTENT AREA */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Applications per Opportunity</h3>
        
        <figure style={styles.chartFigure}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: "#4b5563" }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              
              <YAxis 
                tick={{ fontSize: 12, fill: "#4b5563" }}
                label={{ 
                  value: 'Number of Applicants', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: 15,
                  style: { fill: '#0a1628', fontSize: 14, fontWeight: 600 }
                }}
              />
              
              <Tooltip 
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}
              />
              
              <Bar 
                dataKey="applications" 
                fill="#00c853" 
                name="Applications"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
          <figcaption style={{ display: 'none' }}>Bar chart showing application counts per opportunity</figcaption>
        </figure>
      </section>

      {/* FOOTER ACTIONS */}
      <footer style={styles.footer}>
        <ExportButtons data={chartData} />
      </footer>
    </article>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 300px", // Maintains the fixed-width key on the right
    gap: "20px",
    marginBottom: "20px",
  },
  mainTitle: {
    margin: "0 0 8px 0",
    color: "#0a1628",
    fontSize: "28px",
    fontWeight: "700",
  },
  description: {
    margin: "0 0 25px 0",
    color: "#4b5563",
    lineHeight: 1.6,
  },
  legendCard: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    alignSelf: "start",
  },
  legendTitle: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    color: "#4b5563",
    marginBottom: "6px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    marginRight: "8px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: "0 0 20px 0",
    color: "#0a1628",
    fontSize: "18px",
    fontWeight: "600",
  },
  chartFigure: {
    margin: 0,
    width: "100%",
  },
  footer: {
    marginTop: "10px",
    paddingTop: "20px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
  },
};

export default ApplicationVolumeChart;