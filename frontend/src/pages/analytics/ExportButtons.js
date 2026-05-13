import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ExportButtons({ data = [] }) {
  const btn = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
    fontWeight: "600",
    fontSize: "14px",
    transition: "0.2s ease",
  };

  /* -------------------------------- */
  /* EXPORT CSV */
  /* -------------------------------- */

  const exportCSV = () => {
    if (!data.length) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);

    const csvRows = [
      headers.join(","),

      ...data.map((row) =>
        headers
          .map((field) => {
            const value = row[field] ?? "";

            // Prevent commas breaking CSV
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];

    const csvString = csvRows.join("\n");

    const blob = new Blob([csvString], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "analytics-report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  /* -------------------------------- */
  /* EXPORT PDF */
  /* -------------------------------- */

  const exportPDF = () => {
    if (!data.length) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("Analytics Report", 14, 20);

    const headers = [Object.keys(data[0])];

    const rows = data.map((row) =>
      Object.values(row).map((value) =>
        value === null || value === undefined
          ? ""
          : String(value)
      )
    );

    autoTable(doc, {
      startY: 30,
      head: headers,
      body: rows,
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [0, 200, 83],
      },
    });

    doc.save("analytics-report.pdf");
  };

  return (
    <div style={styles.container}>
      <button
        onClick={exportCSV}
        style={{
          ...btn,
          backgroundColor: "#00c853",
          color: "#ffffff",
        }}
      >
        Export CSV
      </button>

      <button
        onClick={exportPDF}
        style={{
          ...btn,
          backgroundColor: "#2196f3",
          color: "#ffffff",
        }}
      >
        Export PDF
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
};

export default ExportButtons;