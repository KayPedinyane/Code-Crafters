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
} from "recharts";

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

const COLOR = {
  green:  "#1D9E75",
  blue:   "#378ADD",
  amber:  "#EF9F27",
  red:    "#D85A30",
  purple: "#7F77DD",
  teal:   "#5DCAA5",
  gray:   "#888780",
};

const PIE_COLORS = [
  COLOR.green, COLOR.blue, COLOR.amber,
  COLOR.red, COLOR.purple, COLOR.teal, COLOR.gray,
];

// Bar fill based on selected metric — matches SuccessRateChart's colour logic
const METRIC_COLOR = {
  applications:  COLOR.blue,
  placements:    COLOR.green,
  placementRate: COLOR.amber,
};

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// Custom recharts tooltip — identical to SuccessRateChart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={s.tooltipTitle}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={s.tooltipRow}>
          <span style={{ ...s.tooltipDot, background: p.color }} />
          <span style={s.tooltipKey}>{p.name}:</span>
          <span style={s.tooltipVal}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
            {p.name === "Placement Rate" ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// Stat summary card — identical to SuccessRateChart
function StatCard({ label, value, sub, color }) {
  return (
    <div style={s.statCard}>
      <p style={s.statLabel}>{label}</p>
      <p style={{ ...s.statValue, color }}>{value}</p>
      <p style={s.statSub}>{sub}</p>
    </div>
  );
}

// Key tile — identical to SuccessRateChart
function KeyTile({ color, label, description }) {
  return (
    <div style={s.keyTile}>
      <span style={{ ...s.keyDot, background: color }} />
      <div>
        <p style={{ ...s.keyLabel, color }}>{label}</p>
        <p style={s.keyDesc}>{description}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

function CustomFilterPanel({ data = [] }) {

  // ── UI state ───────────────────────────────────────────────────────────────
  const [groupBy,  setGroupBy]  = useState("opportunityType");
  const [metric,   setMetric]   = useState("applications");
  const [selected, setSelected] = useState(null);

  // ── Bar chart data ─────────────────────────────────────────────────────────
  const groupedData = useMemo(() => {
    const map = {};
    data.forEach((app) => {
      const key =
        groupBy === "province"
          ? app.province || "Unknown Province"
          : groupBy === "sector"
          ? app.sector   || "Unknown Sector"
          : app.opportunityType || app.opportunity_type || app.type || "Unknown Type";

      if (!map[key]) map[key] = { name: key, applications: 0, placements: 0 };
      map[key].applications += 1;

      const status = app.status?.toLowerCase();
      if (status === "accepted" || status === "placed") {
        map[key].placements += 1;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        placementRate:
          item.applications > 0
            ? Number(((item.placements / item.applications) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b[metric] - a[metric]);
  }, [data, groupBy, metric]);

  // ── NQF donut data ─────────────────────────────────────────────────────────
  const nqfData = useMemo(() => {
    const levels = {
      "NQF 2": 0, "NQF 3": 0, "NQF 4": 0,
      "NQF 5": 0, "NQF 6": 0, "NQF 7+": 0,
    };

    data.forEach((app) => {
      const raw = app.nqf_level || app.nqfLevel || app.nqf || app.level;
      if (!raw) return;
      const level = parseInt(raw.toString().replace(/\D/g, ""), 10);
      if (isNaN(level)) return;
      const key = level >= 7 ? "NQF 7+" : `NQF ${level}`;
      if (levels[key] !== undefined) levels[key] += 1;
    });

    const total = Object.values(levels).reduce((sum, v) => sum + v, 0);
    return Object.entries(levels).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0.0",
    }));
  }, [data]);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalApps      = groupedData.reduce((s, d) => s + d.applications, 0);
  const totalPlaced    = groupedData.reduce((s, d) => s + d.placements,   0);
  const avgRate        = groupedData.length
    ? (groupedData.reduce((s, d) => s + d.placementRate, 0) / groupedData.length).toFixed(1)
    : "0.0";
  const topGroup       = groupedData[0];

  const metricLabel    = {
    applications:  "Applications",
    placements:    "Placements",
    placementRate: "Placement Rate (%)",
  }[metric];

  const groupLabel = {
    province:        "Province",
    sector:          "Sector",
    opportunityType: "Opportunity Type",
  }[groupBy] ?? "Group";

  function toggleSelected(name) {
    setSelected((prev) => (prev === name ? null : name));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div style={s.root}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>Custom Analytics View</h2>
        <p style={s.pageDesc}>
          Slice the data by opportunity type, location, or industry sector. Adjust
          the grouping and metric below to explore how learnerships, apprenticeships,
          and internships compare across applications, placements, and placement rates.
        </p>
      </div>

      {/* ── KPI summary cards ────────────────────────────────────────────── */}
      <div style={s.statGrid}>
        <StatCard
          label="Total applications"
          value={totalApps.toLocaleString()}
          sub={`Across all ${groupLabel.toLowerCase()}s`}
          color={COLOR.green}
        />
        <StatCard
          label="Total placed"
          value={totalPlaced.toLocaleString()}
          sub="Successfully placed applicants"
          color={COLOR.blue}
        />
        <StatCard
          label="Avg placement rate"
          value={`${avgRate}%`}
          sub={`Across ${groupedData.length} ${groupLabel.toLowerCase()}s`}
          color={COLOR.amber}
        />
        <StatCard
          label={`Top ${groupLabel.toLowerCase()}`}
          value={topGroup?.name ?? "—"}
          sub={`${topGroup?.[metric] ?? 0}${metric === "placementRate" ? "%" : ""} ${metricLabel.toLowerCase()}`}
          color={COLOR.purple}
        />
      </div>

      {/* ── Main two-column layout ────────────────────────────────────────── */}
      <div style={s.mainGrid}>

        {/* ── LEFT: bar chart ─────────────────────────────────────────── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>{metricLabel} by {groupLabel}</h3>
            <p style={s.cardSub}>
              Click a bar to highlight it. Change grouping or metric using the controls.
            </p>
          </div>

          {/* Controls — same pattern as SuccessRateChart */}
          <div style={s.filters}>
            <div style={s.filterGroup}>
              <label style={s.filterLabel} htmlFor="group-by">Group by</label>
              <select
                id="group-by"
                value={groupBy}
                onChange={(e) => { setGroupBy(e.target.value); setSelected(null); }}
                style={s.select}
                aria-label="Group by"
              >
                <option value="opportunityType">Opportunity Type</option>
                <option value="province">Province</option>
                <option value="sector">Sector</option>
              </select>
            </div>

            <div style={s.filterGroup}>
              <label style={s.filterLabel} htmlFor="metric-select">Metric</label>
              <select
                id="metric-select"
                value={metric}
                onChange={(e) => { setMetric(e.target.value); setSelected(null); }}
                style={s.select}
                aria-label="Metric"
              >
                <option value="applications">Applications</option>
                <option value="placements">Placements</option>
                <option value="placementRate">Placement Rate (%)</option>
              </select>
            </div>

            {selected && (
              <button
                onClick={() => setSelected(null)}
                style={s.clearBtn}
              >
                ✕ Clear selection
              </button>
            )}
          </div>

          {/* Chart legend */}
          <div style={s.legendRow}>
            <div style={s.legendItem}>
              <span style={{ ...s.legendSwatch, background: METRIC_COLOR[metric] }} />
              <span style={s.legendLabel}>
                {metricLabel} —{" "}
                {metric === "applications"  && "total applications received"}
                {metric === "placements"    && "applicants successfully placed"}
                {metric === "placementRate" && "percentage of applicants placed"}
              </span>
            </div>
          </div>

          <p style={s.chartNote}>
            Horizontal bars ranked highest to lowest by the selected metric.
            {selected && ` Highlighted: ${selected}.`}
            &nbsp;Click a bar to select it.
          </p>

          {groupedData.length === 0 ? (
            <p style={s.empty}>No data available for this grouping.</p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(groupedData.length * 48 + 40, 300)}
            >
              <BarChart
                data={groupedData}
                layout="vertical"
                margin={{ top: 4, right: 48, bottom: 55, left: 8 }}
                barCategoryGap="30%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F0EFE8"
                  horizontal={false}
                />
  `             <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickFormatter={(v) =>
                    metric === "placementRate" ? `${v}%` : v.toLocaleString()
                  }
                  height={60}
                  label={{
                    value: metricLabel,
                    position: "insideBottom",
                    offset: -48,        // ← push it down further too
                    style: { fill: "#9CA3AF", fontSize: 12, fontWeight: 500 },
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 11, fill: "#1F2937" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8F9FB" }} />
                <Bar
                  dataKey={metric}
                  name={metricLabel}
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(d) => toggleSelected(d.name)}
                >
                  {groupedData.map((d, i) => {
                    const dimmed = selected !== null && selected !== d.name;
                    return (
                      <Cell
                        key={i}
                        fill={METRIC_COLOR[metric]}
                        opacity={dimmed ? 0.25 : 1}
                        stroke={selected === d.name ? "#1F2937" : "none"}
                        strokeWidth={selected === d.name ? 1.5 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Metric key */}
          <div style={s.keySection}>
            <p style={s.keySectionTitle}>Metric key</p>
            <div style={s.keyGrid}>
              <KeyTile
                color={COLOR.blue}
                label="Applications"
                description="Total applications received in this group"
              />
              <KeyTile
                color={COLOR.green}
                label="Placements"
                description="Applicants successfully placed"
              />
              <KeyTile
                color={COLOR.amber}
                label="Placement rate"
                description="Placements as % of applications"
              />
              <KeyTile
                color={COLOR.purple}
                label="Opportunity types"
                description="Learnership · Apprenticeship · Internship"
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: NQF donut ─────────────────────────────────────────── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>NQF level distribution</h3>
            <p style={s.cardSub}>
              Breakdown of applicants by National Qualifications Framework level.
            </p>
          </div>

          <p style={s.chartNote}>
            Donut chart showing what proportion of applicants fall into each NQF
            level. Larger segments indicate a higher share of the applicant pool.
          </p>

          {nqfData.every((d) => d.value === 0) ? (
            <p style={s.empty}>
              No NQF level data found. Ensure applicant profiles include
              an <code>nqf_level</code>, <code>nqfLevel</code>, or <code>level</code> field.
            </p>
          ) : (
            <div style={s.donutLayout}>
              {/* Donut */}
              <ResponsiveContainer width="55%" height={260}>
                <PieChart>
                  <Pie
                    data={nqfData}
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {nqfData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name, props) => [
                      `${props.payload.percentage}% (${v})`,
                      props.payload.name,
                    ]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "0.5px solid #E5E7EB",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* NQF legend — matches SuccessRateChart's pie legend pattern */}
              <div style={s.pieLegend}>
                <p style={s.pieLegendTitle}>NQF level key</p>
                {nqfData.map((item, i) => (
                  <div key={item.name} style={s.pieLegendRow}>
                    <span
                      style={{
                        ...s.pieDot,
                        background: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                    <span style={s.pieName}>{item.name}</span>
                    <span style={s.pieCount}>{item.value}</span>
                    <span style={s.pieRate}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Export row — matches SuccessRateChart exactly ────────────────── */}
      <div style={s.exportRow}>
        <div>
          <p style={s.exportTitle}>Export report</p>
          <p style={s.exportNote}>
            Download the grouped data with applications, placements, and placement rates.
          </p>
        </div>
        <ExportButtons data={groupedData} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLES — mirrors SuccessRateChart styles exactly
// ══════════════════════════════════════════════════════════════════════════════

const s = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    background: "#F8F9FB",
    padding: "24px",
    minHeight: "100vh",
    color: "#1a1a2e",
  },

  // Page header
  pageHeader: {
    marginBottom: 20,
    textAlign: "center",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 600,
    color: "#0a1628",
    margin: "0 0 6px",
  },
  pageDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 1.65,
    margin: "0 auto",
    maxWidth: 620,
  },

  // Stat cards
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    background: "#ffffff",
    borderRadius: 12,
    padding: "14px 16px",
    border: "0.5px solid #E5E7EB",
  },
  statLabel: {
    fontSize: 11,
    color: "#0a1628",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 4px",
  },
  statValue: {
    fontSize: 22,
    fontWeight: 600,
    lineHeight: 1.2,
    margin: "0 0 2px",
  },
  statSub: {
    fontSize: 12,
    color: "#9CA3AF",
    margin: 0,
  },

  // Main two-column grid
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 1fr",
    gap: 16,
    marginBottom: 16,
    alignItems: "start",
  },

  // Card
  card: {
    background: "#ffffff",
    borderRadius: 14,
    padding: "20px 22px",
    border: "0.5px solid #E5E7EB",
  },
  cardHeader: {
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#0a1628",
    margin: "0 0 3px",
  },
  cardSub: {
    fontSize: 12,
    color: "#9CA3AF",
    margin: 0,
  },

  // Filters bar
  filters: {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
    padding: "12px 14px",
    background: "#F8F9FB",
    borderRadius: 10,
    border: "0.5px solid #E5E7EB",
    marginBottom: 14,
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  filterLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: 500,
  },
  select: {
    fontSize: 12,
    padding: "5px 10px",
    borderRadius: 8,
    border: "0.5px solid #D1D5DB",
    background: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    outline: "none",
    minWidth: 160,
  },
  clearBtn: {
    fontSize: 11,
    padding: "5px 10px",
    borderRadius: 8,
    border: "0.5px solid #FCA5A5",
    background: "#FEF2F2",
    color: "#DC2626",
    cursor: "pointer",
    fontWeight: 500,
    alignSelf: "flex-end",
  },

  // Chart legend
  legendRow: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 11,
    color: "#4B5563",
  },

  // Chart note
  chartNote: {
    fontSize: 11,
    color: "#9CA3AF",
    lineHeight: 1.55,
    margin: "0 0 12px",
  },

  // Metric key
  keySection: {
    marginTop: 18,
    paddingTop: 14,
    borderTop: "0.5px solid #F3F4F6",
  },
  keySectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "0 0 10px",
  },
  keyGrid: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  keyTile: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    flex: 1,
    minWidth: 110,
    padding: "8px 10px",
    background: "#F8F9FB",
    borderRadius: 8,
    border: "0.5px solid #E5E7EB",
  },
  keyDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    flexShrink: 0,
    marginTop: 2,
  },
  keyLabel: {
    fontSize: 12,
    fontWeight: 600,
    margin: "0 0 1px",
  },
  keyDesc: {
    fontSize: 11,
    color: "#9CA3AF",
    margin: 0,
  },

  // Donut layout
  donutLayout: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },

  // NQF pie legend
  pieLegend: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  pieLegendTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "0 0 8px",
  },
  pieLegendRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 0",
    borderBottom: "0.5px solid #F3F4F6",
  },
  pieDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    flexShrink: 0,
  },
  pieName: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
  },
  pieCount: {
    fontSize: 12,
    color: "#9CA3AF",
    minWidth: 24,
    textAlign: "right",
  },
  pieRate: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6B7280",
    minWidth: 40,
    textAlign: "right",
  },

  // Tooltip
  tooltip: {
    background: "#ffffff",
    border: "0.5px solid #E5E7EB",
    borderRadius: 10,
    padding: "10px 14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    minWidth: 160,
  },
  tooltipTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0a1628",
    margin: "0 0 6px",
  },
  tooltipRow: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    marginBottom: 3,
  },
  tooltipDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    flexShrink: 0,
  },
  tooltipKey: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  tooltipVal: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1F2937",
  },

  // Empty state
  empty: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    padding: "40px 0",
    lineHeight: 1.6,
  },

  // Export row
  exportRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#ffffff",
    borderRadius: 12,
    padding: "14px 18px",
    border: "0.5px solid #E5E7EB",
    gap: 16,
  },
  exportTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1F2937",
    margin: "0 0 2px",
  },
  exportNote: {
    fontSize: 14,
    color: "#9CA3AF",
    margin: 0,
  },
};

export default CustomFilterPanel;
