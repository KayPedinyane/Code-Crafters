import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#00c853", "#ff5252", "#2196f3", "#ff9800"];

function SuccessRateChart({ data = [] }) {
  const stats = {};

  data.forEach((app) => {
    const sector = app.sector || "Unknown";

    if (!stats[sector]) {
      stats[sector] = {
        sector,
        total: 0,
        accepted: 0,
      };
    }

    stats[sector].total += 1;

    if (app.status?.toLowerCase() === "accepted") {
      stats[sector].accepted += 1;
    }
  });

  const chartData = Object.values(stats).map((s) => ({
    sector: s.sector,
    rate: s.total === 0 ? 0 : Number(((s.accepted / s.total) * 100).toFixed(1)),
  }));

  const pieData = chartData.map((s) => ({
    name: s.sector,
    value: s.rate,
  }));

  return (
    <div>
      <h3 style={styles.title}>Success Rate by Sector</h3>

      {/* BAR CHART */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <XAxis dataKey="sector" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="rate" fill="#2196f3" />
        </BarChart>
      </ResponsiveContainer>

      {/* PIE CHART */}
      <div style={{ marginTop: 20 }}>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  title: {
    marginBottom: "10px",
    color: "#0a1628",
  },
};

export default SuccessRateChart;