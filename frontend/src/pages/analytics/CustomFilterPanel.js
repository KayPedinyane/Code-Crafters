import { useMemo, useState } from "react";
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
  Legend,
} from "recharts";

const COLORS = [
  "#00c853",
  "#2962ff",
  "#ff9800",
  "#9c27b0",
  "#ff5252",
  "#00bcd4",
];

function CustomFilterPanel({ data = [] }) {
  const [groupBy, setGroupBy] = useState("province");
  const [metric, setMetric] = useState("applications");

  /* -------------------------------- */
  /* BAR CHART DATA */
  /* -------------------------------- */

  const groupedData = useMemo(() => {
    const map = {};

    data.forEach((app) => {
      const key =
        groupBy === "province"
          ? app.province || "Unknown Province"
          : app.sector || "Unknown Sector";

      if (!map[key]) {
        map[key] = {
          name: key,
          applications: 0,
          placements: 0,
        };
      }

      map[key].applications += 1;

      if (
        app.status?.toLowerCase() === "accepted" ||
        app.status?.toLowerCase() === "placed"
      ) {
        map[key].placements += 1;
      }
    });

    return Object.values(map).map((item) => ({
      ...item,
      placementRate:
        item.applications > 0
          ? Number(
              (
                (item.placements / item.applications) *
                100
              ).toFixed(1)
            )
          : 0,
    }));
  }, [data, groupBy]);

  /* -------------------------------- */
  /* NQF DONUT DATA */
  /* -------------------------------- */

  const nqfData = useMemo(() => {
    const levels = {
      "NQF 2": 0,
      "NQF 3": 0,
      "NQF 4": 0,
      "NQF 5": 0,
      "NQF 6": 0,
      "NQF 7+": 0,
    };

    data.forEach((app) => {
      const level = app.nqfLevel;

      if (!level) return;

      if (level >= 7) {
        levels["NQF 7+"] += 1;
      } else {
        const key = `NQF ${level}`;

        if (levels[key] !== undefined) {
          levels[key] += 1;
        }
      }
    });

    const total = Object.values(levels).reduce(
      (sum, value) => sum + value,
      0
    );

    return Object.entries(levels).map(([name, value]) => ({
      name,
      value,
      percentage:
        total > 0
          ? ((value / total) * 100).toFixed(1)
          : 0,
    }));
  }, [data]);

  /* -------------------------------- */
  /* METRIC CONFIG */
  /* -------------------------------- */

  const metricConfig = {
    applications: {
      key: "applications",
      label: "Applications",
      color: "#2962ff",
    },
    placements: {
      key: "placements",
      label: "Placements",
      color: "#00c853",
    },
    placementRate: {
      key: "placementRate",
      label: "Placement Rate (%)",
      color: "#ff9800",
    },
  };

  const currentMetric = metricConfig[metric];

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Custom Analytics View</h2>
          <p style={styles.description}>
            Analyze applications and placements by your
            preferred grouping.
          </p>
        </div>

        <ExportButtons data={data} />
      </div>

      {/* FILTERS */}
      <div style={styles.filters}>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          style={styles.select}
        >
          <option value="province">
            Group By: Province
          </option>
          <option value="sector">
            Group By: Sector
          </option>
        </select>

        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          style={styles.select}
        >
          <option value="applications">
            Metric: Applications
          </option>
          <option value="placements">
            Metric: Placements
          </option>
          <option value="placementRate">
            Metric: Placement Rate
          </option>
        </select>
      </div>

      {/* CHARTS GRID */}
      <div style={styles.chartsGrid}>
        {/* HORIZONTAL BAR CHART */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            {currentMetric.label} by{" "}
            {groupBy === "province"
              ? "Province"
              : "Sector"}
          </h3>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={groupedData}
              layout="vertical"
              margin={{
                top: 10,
                right: 20,
                left: 80,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis type="number" />

              <YAxis
                type="category"
                dataKey="name"
                width={120}
              />

              <Tooltip />

              <Bar
                dataKey={currentMetric.key}
                fill={currentMetric.color}
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* DONUT CHART */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            Applicant Distribution by NQF Level
          </h3>

          <div style={styles.donutWrapper}>
            <ResponsiveContainer width="60%" height={320}>
              <PieChart>
                <Pie
                  data={nqfData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {nqfData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* CUSTOM LEGEND */}
            <div style={styles.customLegend}>
              {nqfData.map((item, index) => (
                <div
                  key={item.name}
                  style={styles.legendItem}
                >
                  <div style={styles.legendLeft}>
                    <span
                      style={{
                        ...styles.legendColor,
                        background:
                          COLORS[index % COLORS.length],
                      }}
                    />

                    <span>{item.name}</span>
                  </div>

                  <strong>
                    {item.percentage}%
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* STYLES */
/* -------------------------------- */

const styles = {
  wrapper: {
    background: "#fff",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    color: "#0a1628",
  },

  description: {
    marginTop: "5px",
    color: "#6b7280",
    fontSize: "14px",
  },

  filters: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "25px",
  },

  select: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#fff",
    minWidth: "220px",
    fontSize: "14px",
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  chartCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
  },

  chartTitle: {
    marginBottom: "20px",
    color: "#0a1628",
    fontSize: "16px",
  },

  donutWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  customLegend: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  legendItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
    paddingBottom: "8px",
    borderBottom: "1px solid #f1f1f1",
  },

  legendLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  legendColor: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
};

export default CustomFilterPanel;