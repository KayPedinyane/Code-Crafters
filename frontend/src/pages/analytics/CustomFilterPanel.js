import React, { useMemo, useState } from "react";
import ExportButtons from "./ExportButtons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#00c853", "#2962ff", "#ff9800", "#9c27b0", "#ff5252", "#00bcd4"];

function CustomFilterPanel({ data = [] }) {
  const [groupBy, setGroupBy] = useState("province");
  const [metric, setMetric] = useState("applications");

  /* -------------------------------- */
  /* DATA PROCESSING: BAR CHART       */
  /* -------------------------------- */
  const groupedData = useMemo(() => {
    const map = {};
    data.forEach((app) => {
      const key = groupBy === "province" 
        ? app.province || "Unknown Province" 
        : app.sector || "Unknown Sector";

      if (!map[key]) {
        map[key] = { name: key, applications: 0, placements: 0 };
      }
      map[key].applications += 1;
      if (app.status?.toLowerCase() === "accepted" || app.status?.toLowerCase() === "placed") {
        map[key].placements += 1;
      }
    });

    return Object.values(map).map((item) => ({
      ...item,
      placementRate: item.applications > 0 
        ? Number(((item.placements / item.applications) * 100).toFixed(1)) 
        : 0,
    })).sort((a, b) => b[metric] - a[metric]);
  }, [data, groupBy, metric]);

  /* -------------------------------- */
  /* DATA PROCESSING: NQF DONUT       */
  /* -------------------------------- */
  const nqfData = useMemo(() => {
    const levels = { "NQF 2": 0, "NQF 3": 0, "NQF 4": 0, "NQF 5": 0, "NQF 6": 0, "NQF 7+": 0 };
    data.forEach((app) => {
      const level = app.nqfLevel;
      if (!level) return;
      if (level >= 7) levels["NQF 7+"] += 1;
      else {
        const key = `NQF ${level}`;
        if (levels[key] !== undefined) levels[key] += 1;
      }
    });

    const total = Object.values(levels).reduce((sum, v) => sum + v, 0);
    return Object.entries(levels).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
    }));
  }, [data]);

  const metricLabel = metric === "placementRate" ? "Placement Rate (%)" : metric.charAt(0).toUpperCase() + metric.slice(1);

  return (
    <article style={styles.container}>
      {/* HEADER SECTION */}
      <header style={styles.topGrid}>
        <div>
          <h2 style={styles.mainTitle}>Custom Analytics View</h2>
          <p style={styles.description}>
            How do numbers break down by any grouping you choose? 
            Adjust the filters below to slice the data by location or industry sector.
          </p>
          
          {/* INTERACTIVE CONTROLS */}
          <div style={styles.filterRow}>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              style={styles.select}
              aria-label="Group by"
            >
              <option value="province">Group By: Province</option>
              <option value="sector">Group By: Sector</option>
            </select>

            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              style={styles.select}
              aria-label="Metric"
            >
              <option value="applications">Metric: Applications</option>
              <option value="placements">Metric: Placements</option>
              <option value="placementRate">Metric: Placement Rate</option>
            </select>
          </div>
        </div>

        {/* CONSISTENT KEY POSITION */}
        <aside style={styles.legendCard}>
          <span style={styles.legendTitle}>Profile Key:</span>
          <div style={styles.legendItem}>
            <span style={{ ...styles.dot, backgroundColor: "#2962ff" }} /> 
            Volume Metric
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.dot, backgroundColor: "#00c853" }} /> 
            Conversion Metric
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.dot, backgroundColor: "#ff9800" }} /> 
            Percentage Rate
          </div>
        </aside>
      </header>

      {/* VISUALS GRID */}
      <div style={styles.chartsGrid}>
        {/* BAR CHART SECTION */}
        <section style={styles.card}>
          <h3 style={styles.sectionTitle}>{metricLabel} by {groupBy === "province" ? "Province" : "Sector"}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={groupedData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar 
                dataKey={metric} 
                fill={metric === "placementRate" ? "#ff9800" : (metric === "placements" ? "#00c853" : "#2962ff")} 
                radius={[0, 4, 4, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* DONUT CHART SECTION */}
        <section style={styles.card}>
          <h3 style={styles.sectionTitle}>NQF Level Distribution</h3>
          <div style={styles.donutLayout}>
            <ResponsiveContainer width="50%" height={300}>
              <PieChart>
                <Pie
                  data={nqfData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {nqfData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div style={styles.customLegend}>
              {nqfData.map((item, i) => (
                <div key={item.name} style={styles.legendRow}>
                  <div style={styles.legendLabel}>
                    <span style={{ ...styles.dot, backgroundColor: COLORS[i % COLORS.length] }} />
                    <span style={{ fontSize: '13px' }}>{item.name}</span>
                  </div>
                  <strong style={{ fontSize: '13px' }}>{item.percentage}%</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer style={{ marginTop: 20 }}>
        <ExportButtons data={groupedData} />
      </footer>
    </article>
  );
}

const styles = {
  container: { fontFamily: "'Inter', sans-serif" },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: "20px",
    marginBottom: "20px",
  },
  mainTitle: { margin: "0 0 8px 0", color: "#0a1628", fontSize: "28px", fontWeight: "700" },
  description: { margin: "0 0 20px 0", color: "#4b5563", lineHeight: 1.6 },
  filterRow: { display: "flex", gap: "10px" },
  select: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
    minWidth: "200px"
  },
  legendCard: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    alignSelf: "start",
  },
  legendTitle: { display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" },
  legendItem: { display: "flex", alignItems: "center", fontSize: "13px", color: "#4b5563", marginBottom: "6px" },
  dot: { width: "10px", height: "10px", borderRadius: "50%", marginRight: "8px" },
  chartsGrid: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  sectionTitle: { margin: "0 0 20px 0", color: "#0a1628", fontSize: "18px", fontWeight: "600" },
  donutLayout: { display: "flex", alignItems: "center", gap: "20px" },
  customLegend: { flex: 1 },
  legendRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #f3f4f6"
  },
  legendLabel: { display: "flex", alignItems: "center" }
};

export default CustomFilterPanel;