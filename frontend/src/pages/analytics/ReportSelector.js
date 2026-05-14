function ReportSelector({ report, setReport }) {
  const options = [
    { label: "Application Volume", value: "volume" },
    { label: "Sector Success Rates", value: "success" },
    { label: "Custom View", value: "custom" },
  ];

  return (
    <div style={styles.container}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setReport(o.value)}
          style={{
            ...styles.button,
            background: report === o.value ? "#00c853" : "#e0e0e0",
            color: report === o.value ? "white" : "#333",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  button: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default ReportSelector;