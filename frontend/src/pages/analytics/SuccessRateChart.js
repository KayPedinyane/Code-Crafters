import { useState, useMemo } from "react";
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

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function rateColor(rate) {
  if (rate >= 70) return COLOR.green;
  if (rate >= 65) return COLOR.amber;
  return COLOR.red;
}

function rateBadge(rate) {
  if (rate >= 70) return { text: "High",   bg: "#E1F5EE", color: "#0F6E56" };
  if (rate >= 65) return { text: "Medium", bg: "#FAEEDA", color: "#854F0B" };
  return                  { text: "Low",   bg: "#FAECE7", color: "#993C1D" };
}

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// Custom recharts tooltip
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
            {p.name === "Rate" ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// Chart legend row shown above each chart
function ChartLegend({ items }) {
  return (
    <div style={s.legendRow} aria-label="Chart legend">
      {items.map((item, i) => (
        <div key={i} style={s.legendItem}>
          {item.dashed ? (
            // Dashed line icon for the placements series
            <svg width="20" height="10" aria-hidden="true">
              <line x1="0" y1="5" x2="20" y2="5"
                stroke={item.color} strokeWidth="2.5" strokeDasharray="5 3" />
            </svg>
          ) : (
            <span style={{ ...s.legendSwatch, background: item.color }} />
          )}
          <span style={s.legendLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Stat summary card
function StatCard({ label, value, sub, color }) {
  return (
    <div style={s.statCard}>
      <p style={s.statLabel}>{label}</p>
      <p style={{ ...s.statValue, color }}>{value}</p>
      <p style={s.statSub}>{sub}</p>
    </div>
  );
}

// Clickable progress bar row for each sector
function SectorRow({ sector, rate, placed, total, isActive, onClick }) {
  const badge = rateBadge(rate);
  return (
    <button
      onClick={onClick}
      style={{
        ...s.sectorRow,
        background: isActive ? "#F0FBF6" : "transparent",
        border: `1px solid ${isActive ? COLOR.green : "transparent"}`,
      }}
      aria-pressed={isActive}
      aria-label={`${sector}: ${rate}% placement rate. ${placed} of ${total} placed.`}
    >
      {/* Row header */}
      <div style={s.sectorRowHeader}>
        <span style={s.sectorName}>{sector}</span>
        <div style={s.sectorMeta}>
          <span style={s.sectorCount}>{placed} / {total} placed</span>
          <span style={{ ...s.badge, background: badge.bg, color: badge.color }}>
            {badge.text}
          </span>
          <span style={{ ...s.sectorRate, color: rateColor(rate) }}>
            {rate}%
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div
        style={s.trackBg}
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${rate}% placement rate`}
      >
        <div style={{
          ...s.trackFill,
          width: `${rate}%`,
          background: rateColor(rate),
        }} />
      </div>
    </button>
  );
}

// Performance key tiles at the bottom of the progress list
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

function SuccessRateChart({ data = [] }) {

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedSector, setSelectedSector] = useState(null);
  const [chartTab,       setChartTab]       = useState("comparison");
  const [sortBy,         setSortBy]         = useState("rate");
  const [minRate,        setMinRate]        = useState(0);

  // ── Sector stats (derived from props) ─────────────────────────────────────
  const sectorStats = useMemo(() => {
    const map = {};
    data.forEach((app) => {
      const sector = app.sector || "Unknown";
      if (!map[sector]) map[sector] = { sector, total: 0, placed: 0 };
      map[sector].total += 1;
      if (app.status?.toLowerCase() === "accepted") map[sector].placed += 1;
    });
    return Object.values(map).map((s) => ({
      ...s,
      rate: s.total === 0
        ? 0
        : Number(((s.placed / s.total) * 100).toFixed(1)),
    }));
  }, [data]);

  // ── Sorted + filtered sector list ─────────────────────────────────────────
  const rankedData = useMemo(() => {
    return [...sectorStats]
      .filter((s) => s.rate >= minRate)
      .sort((a, b) =>
        sortBy === "rate"   ? b.rate - a.rate
        : sortBy === "total"  ? b.total - a.total
        : b.placed - a.placed
      );
  }, [sectorStats, sortBy, minRate]);

  // ── Monthly trend ─────────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const map = {};
    data.forEach((app) => {
      const m = new Date(app.applied_at)
        .toLocaleString("default", { month: "short" });
      if (!map[m]) map[m] = { month: m, applications: 0, placements: 0 };
      map[m].applications += 1;
      if (app.status?.toLowerCase() === "accepted") map[m].placements += 1;
    });
    return ORDER.filter((m) => map[m]).map((m) => map[m]);
  }, [data]);

  // ── Pie data ──────────────────────────────────────────────────────────────
  const pieData = rankedData.map((s) => ({
    name:  s.sector,
    value: s.rate,
  }));

  // ── Bar data (with dimming for unselected) ─────────────────────────────────
  const barData = rankedData.map((s) => ({
    ...s,
    dim: selectedSector !== null && selectedSector !== s.sector,
  }));

  // ── Summary numbers ───────────────────────────────────────────────────────
  const avgRate     = rankedData.length
    ? (rankedData.reduce((a, s) => a + s.rate, 0) / rankedData.length).toFixed(1)
    : "—";
  const totalPlaced = rankedData.reduce((a, s) => a + s.placed, 0);
  const totalApps   = rankedData.reduce((a, s) => a + s.total, 0);
  const topSector   = rankedData[0];

  // ── Toggle sector selection ───────────────────────────────────────────────
  function toggleSector(name) {
    setSelectedSector((prev) => (prev === name ? null : name));
  }

  const CHART_TABS = [
    { id: "comparison",  label: "Applications vs placements" },
    { id: "trend",       label: "Monthly trend" },
    { id: "distribution",label: "Rate distribution" },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div style={s.root}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>Placement by Sector</h2>
        <p style={s.pageDesc}>
          Compare placement success rates across sectors,
          identify high-performing industries, and monitor
          application and placement trends over time.
          Click any sector to highlight it across all charts.
        </p>
      </div>

      {/* ── KPI summary cards ────────────────────────────────────────────── */}
      <div style={s.statGrid}>
        <StatCard
          label="Avg placement rate"
          value={`${avgRate}%`}
          sub={`Across ${rankedData.length} sectors`}
          color={COLOR.green}
        />
        <StatCard
          label="Total placed"
          value={totalPlaced.toLocaleString()}
          sub={`Out of ${totalApps.toLocaleString()} applications`}
          color={COLOR.blue}
        />
        <StatCard
          label="Top sector"
          value={topSector?.sector ?? "—"}
          sub={`${topSector?.rate ?? 0}% placement rate`}
          color={COLOR.purple}
        />
        <StatCard
          label="Sectors tracked"
          value={rankedData.length}
          sub="Matching current filter"
          color={COLOR.amber}
        />
      </div>

      {/* ── Main two-column layout ────────────────────────────────────────── */}
      <div style={s.mainGrid}>

        {/* ── LEFT: sector progress list ──────────────────────────────── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Sector placement success</h3>
            <p style={s.cardSub}>Click a row to highlight it in the charts</p>
          </div>

          {/* Filters */}
          <div style={s.filters}>
            <div style={s.filterGroup}>
              <label style={s.filterLabel} htmlFor="sort-by">Sort by</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={s.select}
              >
                <option value="rate">Rate (highest first)</option>
                <option value="total">Total applications</option>
                <option value="placed">Placed count</option>
              </select>
            </div>

            <div style={s.filterGroup}>
              <label style={s.filterLabel} htmlFor="min-rate">
                Min rate:&nbsp;<strong style={{ color: COLOR.green }}>{minRate}%</strong>
              </label>
              <input
                id="min-rate"
                type="range"
                min={0} max={100} step={5}
                value={minRate}
                onChange={(e) => setMinRate(Number(e.target.value))}
                style={s.range}
                aria-label={`Minimum rate filter: ${minRate}%`}
              />
            </div>

            {selectedSector && (
              <button
                onClick={() => setSelectedSector(null)}
                style={s.clearBtn}
              >
                ✕ Clear selection
              </button>
            )}
          </div>

          {/* Sector rows */}
          <div>
            {rankedData.length === 0 ? (
              <p style={s.empty}>No sectors match this filter.</p>
            ) : (
              rankedData.map((s) => (
                <SectorRow
                  key={s.sector}
                  {...s}
                  isActive={selectedSector === s.sector}
                  onClick={() => toggleSector(s.sector)}
                />
              ))
            )}
          </div>

          {/* Performance key */}
          <div style={s.keySection}>
            <p style={s.keySectionTitle}>Performance key</p>
            <div style={s.keyGrid}>
              <KeyTile color={COLOR.green} label="High (≥70%)"     description="Strong placement rate" />
              <KeyTile color={COLOR.amber} label="Medium (65–70%)" description="Needs improvement" />
              <KeyTile color={COLOR.red}   label="Low (<65%)"      description="Requires attention" />
            </div>
          </div>
        </div>

        {/* ── RIGHT: chart panel ──────────────────────────────────────── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Visual breakdown</h3>
            <p style={s.cardSub}>Switch between chart types below</p>
          </div>

          {/* Chart tab switcher */}
          <div style={s.tabBar} role="tablist" aria-label="Chart type selector">
            {CHART_TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={chartTab === tab.id}
                onClick={() => setChartTab(tab.id)}
                style={{
                  ...s.tabBtn,
                  ...(chartTab === tab.id ? s.tabBtnActive : {}),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Chart 1: Comparison bar chart ───────────────────────── */}
          {chartTab === "comparison" && (
            <div role="tabpanel" aria-label="Applications vs placements chart">
              <ChartLegend items={[
                { color: COLOR.green, label: "Applications — total received per sector" },
                { color: COLOR.blue,  label: "Placements — applicants successfully placed" },
              ]} />
              <p style={s.chartNote}>
                Bar chart comparing the total applications received (green) against
                applicants placed (blue) for each sector.
                {selectedSector && ` Highlighted: ${selectedSector}.`}
                &nbsp;Click a bar to select a sector.
              </p>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={barData}
                  margin={{ top: 8, right: 16, bottom: 56, left: 16 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EFE8" vertical={false} />
                  <XAxis
                    dataKey="sector"
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    label={{
                      value: "Sector",
                      position: "insideBottom",
                      offset: -42,
                      style: { fill: "#6B7280", fontSize: 12, fontWeight: 500 },
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    label={{
                      value: "Number of Applicants",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: { fill: "#6B7280", fontSize: 12, fontWeight: 500 },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="total"
                    name="Applications"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(d) => toggleSector(d.sector)}
                  >
                    {barData.map((d, i) => (
                      <Cell key={i} fill={COLOR.green} opacity={d.dim ? 0.25 : 1} />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="placed"
                    name="Placements"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(d) => toggleSector(d.sector)}
                  >
                    {barData.map((d, i) => (
                      <Cell key={i} fill={COLOR.blue} opacity={d.dim ? 0.25 : 1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Chart 2: Monthly trend ───────────────────────────────── */}
          {chartTab === "trend" && (
            <div role="tabpanel" aria-label="Monthly trend chart">
              <ChartLegend items={[
                { color: COLOR.green, label: "Applications — total received that month" },
                { color: COLOR.blue,  label: "Placements — applicants placed that month", dashed: true },
              ]} />
              <p style={s.chartNote}>
                Line chart showing monthly volume. The solid green line is total
                applications; the dashed blue line is placements.
                A wide gap between the two indicates a low conversion rate.
              </p>
              {monthlyData.length === 0 ? (
                <p style={s.empty}>No monthly data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 8, right: 16, bottom: 40, left: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EFE8" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      label={{
                        value: "Month",
                        position: "insideBottom",
                        offset: -26,
                        style: { fill: "#454749", fontSize: 12, fontWeight: 500 },
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      label={{
                        value: "Count",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        style: { fill: "#454749", fontSize: 12, fontWeight: 500 },
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke={COLOR.green}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: COLOR.green, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                      name="Applications"
                    />
                    <Line
                      type="monotone"
                      dataKey="placements"
                      stroke={COLOR.blue}
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      dot={{ r: 4, fill: COLOR.blue, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                      name="Placements"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* ── Chart 3: Pie distribution ────────────────────────────── */}
          {chartTab === "distribution" && (
            <div role="tabpanel" aria-label="Placement rate distribution chart">
              <p style={s.chartNote}>
                Donut chart showing each sector's placement rate.
                Larger slices = higher success rates.
                Click a slice or legend item to select a sector.
              </p>
              {pieData.length === 0 ? (
                <p style={s.empty}>No data to display.</p>
              ) : (
                <div style={s.pieLayout}>
                  <ResponsiveContainer width="55%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={110}
                        innerRadius={50}
                        paddingAngle={2}
                        cursor="pointer"
                        onClick={(d) => toggleSector(d.name)}
                      >
                        {pieData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                            opacity={
                              selectedSector === null || selectedSector === entry.name
                                ? 1 : 0.3
                            }
                            stroke={selectedSector === entry.name ? "#1F2937" : "none"}
                            strokeWidth={selectedSector === entry.name ? 2 : 0}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`, "Placement rate"]} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Pie legend / key */}
                  <div style={s.pieLegend}>
                    <p style={s.pieLegendTitle}>Sector key</p>
                    {pieData.map((entry, i) => (
                      <button
                        key={i}
                        onClick={() => toggleSector(entry.name)}
                        aria-pressed={selectedSector === entry.name}
                        style={{
                          ...s.pieLegendRow,
                          opacity:
                            selectedSector === null || selectedSector === entry.name
                              ? 1 : 0.35,
                        }}
                      >
                        <span style={{
                          ...s.pieDot,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }} />
                        <span style={s.pieName}>{entry.name}</span>
                        <span style={s.pieRate}>{entry.value}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Export row ───────────────────────────────────────────────────── */}
      <div style={s.exportRow}>
        <div>
          <p style={s.exportTitle}>Export report</p>
          <p style={s.exportNote}>
            Download the ranked sector data with placement rates and totals.
          </p>
        </div>
        <ExportButtons data={rankedData} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLES
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
    margin: 0,
    maxWidth: 620,
    margin: "0 auto",
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
    fontSize: 12,
    color: "#292424",
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
    color:"#9CA3AF",
    margin: 0,
  },

  // Main two-column grid
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.35fr",
    gap: 16,
    marginBottom: 16,
    alignItems: "start",
  },

  // Card wrapper
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
  },
  range: {
    width: 110,
    cursor: "pointer",
    accentColor: "#1D9E75",
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

  // Sector progress rows
  sectorRow: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    marginBottom: 6,
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.15s, border-color 0.15s",
  },
  sectorRowHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
    gap: 8,
    flexWrap: "wrap",
  },
  sectorName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1F2937",
  },
  sectorMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectorCount: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 7px",
    borderRadius: 999,
    letterSpacing: "0.03em",
  },
  sectorRate: {
    fontSize: 14,
    fontWeight: 700,
    minWidth: 38,
    textAlign: "right",
  },
  trackBg: {
    width: "100%",
    height: 8,
    background: "#F3F4F6",
    borderRadius: 999,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.4s ease",
  },

  // Performance key
  keySection: {
    marginTop: 18,
    paddingTop: 14,
    borderTop: "0.5px solid #F3F4F6",
  },
  keySectionTitle: {
    fontSize: 12,
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
    fontSize: 12,
    color: "#564f4f",
    margin: 0,
  },

  // Chart tab bar
  tabBar: {
    display: "flex",
    gap: 4,
    borderBottom: "0.5px solid #F3F4F6",
    marginBottom: 14,
    paddingBottom: 0,
    flexWrap: "wrap",
  },
  tabBtn: {
    fontSize: 12,
    padding: "6px 13px",
    border: "none",
    background: "transparent",
    color: "#9CA3AF",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    marginBottom: -1,
    fontWeight: 500,
    borderRadius: 0,
    whiteSpace: "nowrap",
    transition: "color 0.15s",
  },
  tabBtnActive: {
    color: "#1D9E75",
    borderBottom: "2px solid #1D9E75",
  },

  // Chart annotations
  chartNote: {
    fontSize: 11,
    color: "#898b8f",
    lineHeight: 1.55,
    margin: "0 0 12px",
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

  // Pie layout
  pieLayout: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
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
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px 0",
    textAlign: "left",
    width: "100%",
    transition: "opacity 0.15s",
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
  pieRate: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6B7280",
    minWidth: 36,
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

export default SuccessRateChart;
