import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function ApplicationVolumeChart({ data }) {
  const chartData = Object.values(
    data.reduce((acc, app) => {
      const key = app.opportunityTitle || "Unknown";

      if (!acc[key]) {
        acc[key] = { name: key, applications: 0 };
      }

      acc[key].applications++;
      return acc;
    }, {})
  );

  return (
    <div>
      <h3 style={styles.title}>Application Volume</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="applications" fill="#00c853" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  title: {
    marginBottom: "10px",
    color: "#0a1628",
    fontSize: "26px",
  },
};

export default ApplicationVolumeChart;