import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  BarChart3, FileText, Globe, Eye, Edit3, TrendingUp,
  Layers, RefreshCw, ArrowUpRight, Clock, Users, Tag,
  Star, Activity, CalendarDays, PenLine, Loader2, AlertTriangle,
} from 'lucide-react';

/* ── Sparkline ────────────────────────────────────────────────────────────── */
function Sparkline({ data = [], color = '#4f46e5', height = 32 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 120, H = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const id = `sg${color.replace('#', '')}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Donut Chart ──────────────────────────────────────────────────────────── */
function DonutChart({ segments = [], size = 110 }) {
  const r = 38, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  const total = segments.reduce((s, sg) => s + sg.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
      {total === 0
        ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="16" />
        : segments.map((seg, i) => {
            const dash = (seg.value / total) * circ;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth="16"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            );
            offset += dash;
            return el;
          })
      }
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="700" fill="#0f172a">{total}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">TOTAL</text>
    </svg>
  );
}

/* ── Horizontal Bar Chart ─────────────────────────────────────────────────── */
function HorizBar({ data = [], labelKey = 'name', valueKey = 'count', color = '#4f46e5' }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div className="space-y-2.5">
      {data.slice(0, 8).map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-medium truncate w-28 shrink-0" title={item[labelKey]}>
            {item[labelKey] || 'Unknown'}
          </span>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(3, (item[valueKey] / max) * 100)}%`, background: color, opacity: 1 - i * 0.08 }} />
          </div>
          <span className="text-xs font-bold text-slate-700 w-6 text-right shrink-0">{item[valueKey]}</span>
        </div>
      ))}
      {data.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No data yet</p>}
    </div>
  );
}

/* ── Velocity Bar Chart (30 days) ─────────────────────────────────────────── */
function VelocityChart({ data = [] }) {
  const [hovered, setHovered] = useState(null);
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split('T')[0];
    const found = data.find(r => r.date === key);
    return { key, count: found?.count || 0, label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }) };
  });
  const max = Math.max(...days.map(d => d.count), 1);

  if (data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No publishing activity in the last 30 days</div>;
  }

  return (
    <div className="relative">
      <div className="flex items-end gap-0.5 h-40">
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div className="w-full rounded-t transition-all duration-300"
              style={{
                height: `${Math.max(d.count > 0 ? 6 : 2, (d.count / max) * 100)}%`,
                background: d.count > 0 ? 'linear-gradient(to top,#4f46e5,#818cf8)' : '#e2e8f0',
                minHeight: '2px',
              }}
            />
            {hovered === i && d.count > 0 && (
              <div className="absolute bottom-full mb-2 z-20 bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap pointer-events-none shadow-lg">
                {d.label}: {d.count} post{d.count !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-[9px] text-slate-400 font-medium">
        <span>{days[0]?.label}</span><span>{days[14]?.label}</span><span>{days[29]?.label}</span>
      </div>
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────────────────── */
const COLOR_MAP = {
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-100',  spark: '#4f46e5' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', spark: '#059669' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   spark: '#d97706' },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-100',     spark: '#0284c7' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-100',  spark: '#7c3aed' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-100',    spark: '#e11d48' },
};
function KpiCard({ label, value, sub, icon: Icon, color = 'indigo', sparkData, to }) {
  const c = COLOR_MAP[color];
  return (
    <div className="card-enterprise p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">{label}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {sparkData?.length > 1 && (
        <div className="mt-3 opacity-80"><Sparkline data={sparkData} color={c.spark} /></div>
      )}
      {to && (
        <Link to={to} className={`mt-3 text-xs font-semibold ${c.text} hover:underline flex items-center gap-1`}>
          View details <ArrowUpRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function BlogAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.getPostsAnalytics();
      setData(res);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ov = data?.overview || {};
  const velValues = (data?.publishingVelocity || []).map(d => d.count);

  const donutSegments = [
    { color: '#059669', value: ov.published || 0, label: 'Published' },
    { color: '#f59e0b', value: ov.review    || 0, label: 'In Review' },
    { color: '#94a3b8', value: ov.draft     || 0, label: 'Draft'     },
    { color: '#f43f5e', value: ov.archived  || 0, label: 'Archived'  },
  ];

  const Spin = () => (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" /><span>Blog Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Content Performance Intelligence</h1>
          <p className="text-sm text-slate-500 mt-0.5">Publishing velocity, content health, category insights and editorial activity.</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-slate-400 hidden sm:block">
              Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={load} disabled={loading}
            className="btn-secondary text-xs font-semibold flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
          <Link to="/admin/blog-manager" className="btn-primary text-xs font-semibold flex items-center gap-2">
            <PenLine className="w-3.5 h-3.5" />Blog Manager
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to load analytics</p>
            <p className="text-xs mt-0.5 text-rose-600">{error}</p>
          </div>
          <button onClick={load} className="ml-auto text-xs font-semibold text-rose-700 hover:underline shrink-0">Retry</button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Articles"  value={loading ? '…' : ov.total}         sub="All-time content library"         icon={FileText}   color="indigo"  to="/admin/blog-manager" />
        <KpiCard label="Published"       value={loading ? '…' : ov.published}     sub="Live on website"                  icon={Globe}      color="emerald" sparkData={velValues} />
        <KpiCard label="In Review"       value={loading ? '…' : ov.review}        sub="Awaiting editorial approval"      icon={Eye}        color="amber"  />
        <KpiCard label="Drafts"          value={loading ? '…' : ov.draft}         sub="Work in progress"                 icon={Edit3}      color="sky"    />
        <KpiCard label="Publish Rate"    value={loading ? '…' : `${ov.publishRate ?? 0}%`} sub={`${ov.featured ?? 0} featured articles`} icon={TrendingUp} color="purple" />
        <KpiCard label="Revisions"       value={loading ? '…' : ov.totalRevisions} sub="Version snapshots saved"         icon={Layers}     color="rose"   />
      </div>

      {/* Velocity + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-enterprise p-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Publishing Velocity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Articles published per day — last 30 days</p>
            </div>
            <div className="flex items-center gap-5 text-xs">
              <div className="text-center">
                <p className="text-xl font-bold text-indigo-600">{loading ? '…' : ov.publishedLast7 ?? 0}</p>
                <p className="text-slate-500 font-medium">This week</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-700">{loading ? '…' : ov.publishedLast30 ?? 0}</p>
                <p className="text-slate-500 font-medium">This month</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            {loading ? <Spin /> : <VelocityChart data={data?.publishingVelocity || []} />}
          </div>
        </div>

        <div className="card-enterprise p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-0.5">Content Status Mix</h2>
          <p className="text-xs text-slate-500 mb-4">Distribution by workflow stage</p>
          {loading ? <Spin /> : (
            <div className="flex items-center gap-5">
              <DonutChart segments={donutSegments} size={110} />
              <div className="space-y-2 flex-1">
                {donutSegments.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-slate-600 font-medium">{s.label}</span>
                    </div>
                    <span className="font-bold text-slate-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">New this month</span>
            <span className="font-bold text-indigo-600">{loading ? '…' : `+${ov.createdLast30 ?? 0}`}</span>
          </div>
        </div>
      </div>

      {/* Category + Reading Time + Authors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-enterprise p-6">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900">Top Categories</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">By total article count</p>
          {loading ? <Spin /> : <HorizBar data={data?.categories || []} labelKey="name" valueKey="total" color="#4f46e5" />}
        </div>
        <div className="card-enterprise p-6">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-bold text-slate-900">Reading Time</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">Article length distribution</p>
          {loading ? <Spin /> : <HorizBar data={data?.readingTimeDistribution || []} labelKey="range" valueKey="count" color="#0284c7" />}
        </div>
        <div className="card-enterprise p-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900">Top Authors</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">By total articles written</p>
          {loading ? <Spin /> : <HorizBar data={data?.topAuthors || []} labelKey="name" valueKey="total" color="#059669" />}
        </div>
      </div>

      {/* Recently Published + Editorial Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-enterprise p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recently Published</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest 5 articles live on the website</p>
            </div>
            <Link to="/admin/blog-manager" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              All posts <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? <Spin /> : !data?.recentlyPublished?.length ? (
            <div className="py-10 text-center text-slate-400 text-sm">No published articles yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider">
                    <th className="pb-2 pr-4 font-semibold">Title</th>
                    <th className="pb-2 pr-4 font-semibold hidden md:table-cell">Category</th>
                    <th className="pb-2 pr-4 font-semibold hidden sm:table-cell">Author</th>
                    <th className="pb-2 pr-2 font-semibold text-right">Read</th>
                    <th className="pb-2 font-semibold text-right">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.recentlyPublished.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          {post.isFeatured && <Star className="w-3 h-3 text-amber-400 shrink-0" />}
                          <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={post.title}>{post.title}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <span className="badge badge-indigo text-[10px]">{post.category || 'General'}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 hidden sm:table-cell truncate max-w-[100px]">{post.authorName}</td>
                      <td className="py-3 pr-2 text-right text-slate-500">{post.readingTimeMinutes}m</td>
                      <td className="py-3 text-right text-slate-400 whitespace-nowrap">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-enterprise p-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-bold text-slate-900">Editorial Activity</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">Most active editors — last 7 days</p>
          {loading ? <Spin /> : !data?.recentEditors?.length ? (
            <div className="py-8 text-center text-slate-400 text-xs">No editorial activity this week.</div>
          ) : (
            <div className="space-y-3">
              {data.recentEditors.map((editor, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {(editor.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{editor.name}</p>
                    <div className="h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, (editor.edits / (data.recentEditors[0]?.edits || 1)) * 100)}%`,
                        background: 'linear-gradient(to right,#4f46e5,#7c3aed)',
                      }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 shrink-0">{editor.edits}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />View full audit trail
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
