import { useState, useMemo } from "react";
import ExportButtons from "./ExportButtons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS  (same palette as SuccessRateChart)
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

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function volumeColor(count, max) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  if (pct >= 66) return COLOR.green;
  if (pct >= 33) return COLOR.amber;
  return COLOR.red;
}

function volumeBadge(count, max) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  if (pct >= 66) return { text: "High",     bg: "#E1F5EE", color: "#0F6E56" };
  if (pct >= 33) return { text: "Moderate", bg: "#FAEEDA", color: "#854F0B" };
  return                 { text: "Low",     bg: "#FAECE7", color: "#993C1D" };
}

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// Custom recharts tooltip — matches SuccessRateChart style
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
          </span>
        </div>
      ))}
    </div>
  );
}

// Summary stat card — identical to SuccessRateChart
function StatCard({ label, value, sub, color }) {
  return (
    <div style={s.statCard}>
      <p style={s.statLabel}>{label}</p>
      <p style={{ ...s.statValue, color }}>{value}</p>
      <p style={s.statSub}>{sub}</p>
    </div>
  );
}

// Key tile — identical to SuccessRateChart KeyTile
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

function ApplicationVolumeChart({ data = [] }) {

  const [sortBy,      setSortBy]      = useState("applications");
  const [filterMin,   setFilterMin]   = useState(0);
  const [selected,    setSelected]    = useState(null);

  // ── Data processing ────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const map = {};
    data.forEach((app) => {
      const key = app.opportunityTitle || "Unknown Opportunity";
      if (!map[key]) map[key] = { name: key, applications: 0 };
      map[key].applications++;
    });

    return Object.values(map)
      .filter((d) => d.applications >= filterMin)
      .sort((a, b) =>
        sortBy === "applications"
          ? b.applications - a.applications
          : a.name.localeCompare(b.name)
      );
  }, [data, sortBy, filterMin]);

  const maxApps     = chartData.length ? Math.max(...chartData.map((d) => d.applications)) : 1;
  const totalApps   = chartData.reduce((a, d) => a + d.applications, 0);
  const topOpp      = chartData[0];
  const avgApps     = chartData.length
    ? Math.round(totalApps / chartData.length)
    : 0;

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
        <h2 style={s.pageTitle}>Application Volume</h2>
        <p style={s.pageDesc}>
          Tracks the total number of applications received per opportunity.
          Use the controls to sort, filter, and highlight specific listings.
          Click a bar to select an opportunity.
        </p>
      </div>

      {/* ── KPI summary cards ────────────────────────────────────────────── */}
      <div style={s.statGrid}>
        <StatCard
          label="Total applications"
          value={totalApps.toLocaleString()}
          sub="Across all opportunities"
          color={COLOR.green}
        />
        <StatCard
          label="Opportunities listed"
          value={chartData.length}
          sub="Matching current filter"
          color={COLOR.blue}
        />
        <StatCard
          label="Top opportunity"
          value={topOpp?.name ?? "—"}
          sub={`${topOpp?.applications ?? 0} applications`}
          color={COLOR.purple}
        />
        <StatCard
          label="Avg per opportunity"
          value={avgApps.toLocaleString()}
          sub="Applications on average"
          color={COLOR.amber}
        />
      </div>

      {/* ── Main card ────────────────────────────────────────────────────── */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>Applications per opportunity</h3>
          <p style={s.cardSub}>
            Each bar represents one opportunity listing. Colour indicates
            demand level relative to the highest-volume opportunity.
            {selected && ` Selected: ${selected}.`}
          </p>
        </div>

        {/* Controls */}
        <div style={s.filters}>
          <div style={s.filterGroup}>
            <label style={s.filterLabel} htmlFor="vol-sort">Sort by</label>
            <select
              id="vol-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={s.select}
            >
              <option value="applications">Applications (highest first)</option>
              <option value="name">Opportunity name (A–Z)</option>
            </select>
          </div>

          <div style={s.filterGroup}>
            <label style={s.filterLabel} htmlFor="vol-filter">
              Min applications:&nbsp;
              <strong style={{ color: COLOR.green }}>{filterMin}</strong>
            </label>
            <input
              id="vol-filter"
              type="range"
              min={0}
              max={maxApps}
              step={1}
              value={filterMin}
              onChange={(e) => setFilterMin(Number(e.target.value))}
              style={s.range}
              aria-label={`Minimum applications filter: ${filterMin}`}
            />
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
        <div style={s.legendRow} aria-label="Chart legend">
          {[
            { color: COLOR.green, label: "High demand — top third of applications" },
            { color: COLOR.amber, label: "Moderate — middle third" },
            { color: COLOR.red,   label: "Low volume — bottom third" },
          ].map((item) => (
            <div key={item.label} style={s.legendItem}>
              <span style={{ ...s.legendSwatch, background: item.color }} />
              <span style={s.legendLabel}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        {chartData.length === 0 ? (
          <p style={s.empty}>No opportunities match this filter.</p>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 24, left: 16, bottom: 72 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F0EFE8"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                angle={-35}
                textAnchor="end"
                interval={0}
                label={{
                  value: "Opportunity",
                  position: "insideBottom",
                  offset: -56,
                  style: { fill: "#9CA3AF", fontSize: 12, fontWeight: 500 },
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                label={{
                  value: "Number of applications",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { fill: "#9CA3AF", fontSize: 12, fontWeight: 500 },
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#F8F9FB" }}
              />
              <Bar
                dataKey="applications"
                name="Applications"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(d) => toggleSelected(d.name)}
              >
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={volumeColor(d.applications, maxApps)}
                    opacity={
                      selected === null || selected === d.name ? 1 : 0.25
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Volume key */}
        <div style={s.keySection}>
          <p style={s.keySectionTitle}>Volume key</p>
          <div style={s.keyGrid}>
            <KeyTile
              color={COLOR.green}
              label="High demand"
              description="Top third of all opportunities"
            />
            <KeyTile
              color={COLOR.amber}
              label="Moderate interest"
              description="Middle third of all opportunities"
            />
            <KeyTile
              color={COLOR.red}
              label="Low volume"
              description="Bottom third of all opportunities"
            />
          </div>
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
        <ExportButtons data={chartData} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLES  — mirrors SuccessRateChart exactly
// ══════════════════════════════════════════════════════════════════════════════

const s = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
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
    fontSize: 11,
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
    color: "#9CA3AF",
    margin: 0,
  },

  // Card
  card: {
    background: "#ffffff",
    borderRadius: 14,
    padding: "20px 22px",
    border: "0.5px solid #E5E7EB",
    marginBottom: 16,
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

  // Filters
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

  // Chart legend
  legendRow: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 12,
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

  // Volume key
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

export default ApplicationVolumeChart;
