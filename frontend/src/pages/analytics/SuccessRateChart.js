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
  LineChart,
  Line,
  Legend,
} from "recharts";

const COLORS = ["#00c853", "#ff9800", "#ff5252"];

function SuccessRateChart({ data = [] }) {
  /* -------------------------------- */
  /* SECTOR STATS */
  /* -------------------------------- */

  const sectorStats = {};

  data.forEach((app) => {
    const sector = app.sector || "Unknown";

    if (!sectorStats[sector]) {
      sectorStats[sector] = {
        sector,
        total: 0,
        placed: 0,
      };
    }

    sectorStats[sector].total += 1;

    if (app.status?.toLowerCase() === "accepted") {
      sectorStats[sector].placed += 1;
    }
  });

  /* -------------------------------- */
  /* RANKED SUCCESS DATA */
  /* -------------------------------- */

  const rankedData = Object.values(sectorStats)
    .map((s) => ({
      sector: s.sector,
      total: s.total,
      placed: s.placed,
      rate:
        s.total === 0
          ? 0
          : Number(((s.placed / s.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.rate - a.rate);

  /* -------------------------------- */
  /* MONTHLY TREND DATA */
  /* -------------------------------- */

  const monthMap = {};

  data.forEach((app) => {
    const date = new Date(app.applied_at);

    const month = date.toLocaleString("default", {
      month: "short",
    });

    if (!monthMap[month]) {
      monthMap[month] = {
        month,
        applications: 0,
        placements: 0,
      };
    }

    monthMap[month].applications += 1;

    if (app.status?.toLowerCase() === "accepted") {
      monthMap[month].placements += 1;
    }
  });

  const monthlyData = Object.values(monthMap);

  /* -------------------------------- */
  /* PIE DATA */
  /* -------------------------------- */

  const pieData = rankedData.map((s) => ({
    name: s.sector,
    value: s.rate,
  }));

  /* -------------------------------- */
  /* HELPERS */
  /* -------------------------------- */

  const getProgressColor = (rate) => {
    if (rate >= 70) return "#00c853";
    if (rate >= 65) return "#ff9800";
    return "#ff5252";
  };

  return (
    <div>
      <h2 style={styles.mainTitle}>
        Placement by Sector
      </h2>

      <p style={styles.description}>
        Compare placement success rates across sectors,
        identify high-performing industries, and monitor
        application and placement trends over time.
      </p>

      {/* -------------------------------- */}
      {/* TOP SECTION */}
      {/* -------------------------------- */}

      <div style={styles.topGrid}>
        {/* RANKED PROGRESS LIST */}

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            Sector Placement Success
          </h3>

          {rankedData.map((sector, index) => (
            <div
              key={index}
              style={styles.progressWrapper}
            >
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>
                  {sector.sector}
                </span>

                <span style={styles.progressValue}>
                  {sector.rate}% (
                  {sector.placed}/{sector.total})
                </span>
              </div>

              <div style={styles.progressBackground}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${sector.rate}%`,
                    backgroundColor: getProgressColor(
                      sector.rate
                    ),
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* GROUPED BAR CHART */}

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            Applications vs Placements
          </h3>

          <ResponsiveContainer
            width="100%"
            height={400}
          >
            <BarChart data={rankedData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="sector"
                label={{
                  value: "Sector",
                  position: "insideBottom",
                  offset: -10,

                  style: {
                    fill: "#0a1628",
                    fontSize: 14,
                    fontWeight: 600,
                  },
                }}
              />

              <YAxis
                label={{
                  value: "Number of Applicants / Placements",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: {
                    fill: "#0a1628",
                    fontSize: 14,
                    fontWeight: 600,
              },
                }}
              />

              <Tooltip />

              <Legend 
                verticalAlign="bottom"
              />

              <Bar
                dataKey="total"
                fill="#00c853"
                name="Applications"
              />

              <Bar
                dataKey="placed"
                fill="#2196f3"
                name="Placements"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* MONTHLY TREND */}
      {/* -------------------------------- */}

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>
          Monthly Applications & Placements
        </h3>

        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="applications"
              stroke="#00c853"
              strokeWidth={3}
              name="Applications"
            />

            <Line
              type="monotone"
              dataKey="placements"
              stroke="#2196f3"
              strokeWidth={3}
              strokeDasharray="6 6"
              name="Placements"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* -------------------------------- */}
      {/* PIE CHART */}
      {/* -------------------------------- */}

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>
          Placement Distribution
        </h3>

        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {pieData.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    COLORS[i % COLORS.length]
                  }
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* EXPORT */}

      <div style={{ marginTop: 20 }}>
        <ExportButtons data={rankedData} />
      </div>
    </div>
  );
}

const styles = {
  mainTitle: {
    marginBottom: "8px",
    color: "#0a1628",
    fontSize: "28px",
  },

  description: {
    marginBottom: "25px",
    color: "#4b5563",
    lineHeight: 1.6,
  },

  topGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1.2fr",
    gap: "20px",
    marginBottom: "20px",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },

  sectionTitle: {
    marginBottom: "20px",
    color: "#0a1628",
  },

  progressWrapper: {
    marginBottom: "18px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },

  progressLabel: {
    fontWeight: "600",
    color: "#0a1628",
  },

  progressValue: {
    color: "#4b5563",
    fontSize: "14px",
  },

  progressBackground: {
    width: "100%",
    height: "14px",
    backgroundColor: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "0.3s ease",
  },
};

export default SuccessRateChart;