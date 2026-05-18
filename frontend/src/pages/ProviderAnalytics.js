import React, { useEffect, useState } from 'react';

const STATUS_COLORS = {
  pending:     '#f6ad55',
  shortlisted: '#63b3ed',
  accepted:    '#00c853',
  rejected:    '#fc8181',
};

const STATUS_LABELS = {
  pending:     'Pending',
  shortlisted: 'Shortlisted',
  accepted:    'Accepted',
  rejected:    'Rejected',
};

// ── Donut chart (pure SVG, no library needed) ──────────────────────────────
function DonutChart({ data, total }) {
  const size = 140;
  const r = 52;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const slices = data.map(({ status, count }) => {
    const pct = total ? count / total : 0;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const slice = { status, count, pct, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={18} />

      {slices.map(({ status, dash, gap, offset: sliceOffset }) => (
        <circle
          key={status}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={STATUS_COLORS[status]}
          strokeWidth={18}
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={-sliceOffset + circumference * 0.25}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      ))}

      {/* centre label */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#0a1628" fontFamily="Sora, sans-serif">
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#718096" fontFamily="DM Sans, sans-serif">
        applicants
      </text>
    </svg>
  );
}

// ── Single bar ─────────────────────────────────────────────────────────────
function Bar({ opp, maxCount, isSelected, onClick }) {
  const heightPct = maxCount ? (opp.total / maxCount) * 100 : 0;

  return (
    <div
      onClick={onClick}
      title={opp.title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        flex: '1 1 0',
        minWidth: 0,
      }}
    >
      {/* count badge */}
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'Sora, sans-serif',
        color: isSelected ? '#00c853' : '#0a1628',
        transition: 'color 0.2s',
      }}>
        {opp.total}
      </span>

      {/* bar track */}
      <div style={{
        width: '100%',
        height: 120,
        background: '#f0f4f8',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        border: isSelected ? '2px solid #00c853' : '2px solid transparent',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%',
          height: `${heightPct}%`,
          background: isSelected
            ? 'linear-gradient(180deg, #00c853 0%, #00a040 100%)'
            : 'linear-gradient(180deg, #1d3461 0%, #0a1628 100%)',
          borderRadius: '6px 6px 0 0',
          transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1), background 0.2s',
          minHeight: opp.total > 0 ? 8 : 0,
        }} />
      </div>

      {/* label */}
      <span style={{
        fontSize: 11,
        color: '#718096',
        fontFamily: 'DM Sans, sans-serif',
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
        maxWidth: 72,
      }}>
        {opp.title.length > 14 ? opp.title.slice(0, 14) + '…' : opp.title}
      </span>
    </div>
  );
}

// ── Main analytics component ───────────────────────────────────────────────
export default function ProviderAnalytics({ providerId }) {
  const [chartData, setChartData] = useState([]);   // [{id, title, total, statuses: {pending, shortlisted, accepted, rejected}}]
  const [selected, setSelected]   = useState(null); // selected opp id
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!providerId) return;

    setLoading(true);

    // 1. Fetch all opportunities for this provider
    fetch(`${API}/opportunities/provider/${providerId}`)
      .then(r => r.json())
      .then(async (opps) => {
        if (!Array.isArray(opps) || opps.length === 0) {
          setChartData([]);
          setLoading(false);
          return;
        }

        // 2. For each opportunity, fetch its applications
        const results = await Promise.all(
          opps.map(async (opp) => {
            try {
              const res  = await fetch(`${API}/applications/opportunities/${opp.id}`);
              const apps = await res.json();
              const statuses = { pending: 0, shortlisted: 0, accepted: 0, rejected: 0 };
              if (Array.isArray(apps)) {
                apps.forEach(a => {
                  const s = a.status?.toLowerCase();
                  if (statuses[s] !== undefined) statuses[s]++;
                });
              }
              return {
                id: opp.id,
                title: opp.title,
                total: Array.isArray(apps) ? apps.length : 0,
                statuses,
              };
            } catch {
              return { id: opp.id, title: opp.title, total: 0, statuses: { pending: 0, shortlisted: 0, accepted: 0, rejected: 0 } };
            }
          })
        );

        // Sort by total desc, show top 8
        const sorted = results.sort((a, b) => b.total - a.total).slice(0, 8);
        setChartData(sorted);
        if (sorted.length > 0) setSelected(sorted[0].id);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load analytics.');
        setLoading(false);
      });
  }, [providerId, API]);

  const selectedOpp = chartData.find(o => o.id === selected);
  const maxCount    = Math.max(...chartData.map(o => o.total), 1);
  const donutData   = selectedOpp
    ? Object.entries(selectedOpp.statuses).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto 80px',
      padding: '0 24px',
    }}>
      {/* Section header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 20,
          fontWeight: 700,
          color: '#0a1628',
          marginBottom: 4,
        }}>
          Application Analytics
        </h2>
        <p style={{ fontSize: 13, color: '#718096', fontFamily: 'DM Sans, sans-serif' }}>
          Applicant volume per opportunity — click a bar to see status breakdown
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: 14,
        padding: '28px 28px 24px',
        boxShadow: '0 2px 12px rgba(10,22,40,0.08)',
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#718096', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
            Loading analytics…
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#e53e3e', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
            {error}
          </div>
        )}

        {!loading && !error && chartData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#718096', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
            No opportunities posted yet.
          </div>
        )}

        {!loading && !error && chartData.length > 0 && (
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* ── Bar chart ── */}
            <div style={{ flex: '1 1 300px', minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 10,
                height: 180,
                paddingBottom: 8,
              }}>
                {chartData.map(opp => (
                  <Bar
                    key={opp.id}
                    opp={opp}
                    maxCount={maxCount}
                    isSelected={opp.id === selected}
                    onClick={() => setSelected(opp.id)}
                  />
                ))}
              </div>

              {/* x-axis line */}
              <div style={{ height: 1, background: '#e2e8f0', marginTop: 4 }} />
            </div>

            {/* ── Donut + legend ── */}
            {selectedOpp && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                minWidth: 180,
              }}>
                <p style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'Sora, sans-serif',
                  color: '#0a1628',
                  textAlign: 'center',
                  maxWidth: 160,
                  lineHeight: 1.3,
                }}>
                  {selectedOpp.title}
                </p>

                <DonutChart data={donutData} total={selectedOpp.total} />

                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                  {donutData.map(({ status, count }) => (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: STATUS_COLORS[status],
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 12, color: '#4a5568', fontFamily: 'DM Sans, sans-serif' }}>
                          {STATUS_LABELS[status]}
                        </span>
                      </div>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: 'Sora, sans-serif',
                        color: '#0a1628',
                      }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}