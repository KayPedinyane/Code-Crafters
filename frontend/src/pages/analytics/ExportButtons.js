import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ExportButtons({ data }) {
  const btn = {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
    fontWeight: "600",
  };

  const exportCSV = () => {
    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map((r) => Object.values(r).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics.csv";
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [Object.keys(data[0] || {})],
      body: data.map((r) => Object.values(r)),
    });

    doc.save("analytics.pdf");
  };

  return (
    <div>
      <button onClick={exportCSV} style={{ ...btn, background: "#00c853", color: "white" }}>
        Export CSV
      </button>

      <button onClick={exportPDF} style={{ ...btn, background: "#2196f3", color: "white" }}>
        Export PDF
      </button>
    </div>
  );
}

export default ExportButtons;