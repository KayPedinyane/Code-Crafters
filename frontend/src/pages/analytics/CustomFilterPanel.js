import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function CustomFilterPanel({ data = [] }) {
  const [sector, setSector] = useState("all");
  const [status, setStatus] = useState("all");
  const [groupBy, setGroupBy] = useState("opportunity");

  /* -------------------------------- */
  /* FILTER DATA */
  /* -------------------------------- */

  const filteredData = useMemo(() => {
    return data.filter((app) => {
      const sectorMatch =
        sector === "all" || app.sector === sector;

      const statusMatch =
        status === "all" ||
        app.status?.toLowerCase() === status;

      return sectorMatch && statusMatch;
    });
  }, [data, sector, status]);

  /* -------------------------------- */
  /* GROUP DATA */
  /* -------------------------------- */

  const groupedData = useMemo(() => {
    const map = {};

    filteredData.forEach((app) => {
      const key =
        groupBy === "sector"
          ? app.sector || "Unknown"
          : app.opportunityTitle || "Unknown Opportunity";

      if (!map[key]) {
        map[key] = {
          name: key,
          count: 0,
        };
      }

      map[key].count += 1;
    });

    return Object.values(map);
  }, [filteredData, groupBy]);

  /* -------------------------------- */
  /* UNIQUE VALUES FOR FILTERS */
  /* -------------------------------- */

  const sectors = [
    "all",
    ...new Set(data.map((d) => d.sector).filter(Boolean)),
  ];

  const statuses = ["all", "pending", "accepted", "rejected", "shortlisted"];

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <h2 style={styles.title}>Custom Analytics View</h2>

      {/* FILTERS */}
      <div style={styles.filters}>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          style={styles.select}
        >
          {sectors.map((s) => (
            <option key={s} value={s}>
              Sector: {s}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={styles.select}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              Status: {s}
            </option>
          ))}
        </select>

        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          style={styles.select}
        >
          <option value="opportunity">Group: Opportunity</option>
          <option value="sector">Group: Sector</option>
        </select>
      </div>

      {/* CHART */}
      <div style={styles.chartCard}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={groupedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#00c853" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE VIEW */}
      <div style={styles.tableCard}>
        <h3 style={styles.subtitle}>Filtered Results</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Opportunity</th>
              <th>Sector</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((app, i) => (
              <tr key={i}>
                <td>{app.opportunityTitle}</td>
                <td>{app.sector}</td>
                <td>{app.status}</td>
                <td>
                  {new Date(app.applied_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  title: {
    marginBottom: "15px",
    color: "#0a1628",
  },

  filters: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  chartCard: {
    marginBottom: "20px",
  },

  tableCard: {
    marginTop: "10px",
  },

  subtitle: {
    marginBottom: "10px",
    color: "#0a1628",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
  },
};

export default CustomFilterPanel;