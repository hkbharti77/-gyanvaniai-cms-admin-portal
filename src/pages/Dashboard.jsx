import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  Shield,
  KeyRound,
  Menu as MenuIcon,
  FileText,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    usersCount: 0,
    rolesCount: 0,
    permsCount: 0,
    menusCount: 0,
    activeSessions: 0,
  });
  const [recentAudits, setRecentAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [usersRes, rolesRes, permsRes, menusRes, settingsRes, auditsRes] = await Promise.allSettled([
          api.getUsers({ limit: 1 }),
          api.getRoles(),
          api.getPermissions(),
          api.getMenus(),
          api.getSettings(),
          api.getAuditLogs({ limit: 6 }),
        ]);

        setStats({
          usersCount: usersRes.status === 'fulfilled' ? usersRes.value.pagination?.total || 0 : 0,
          rolesCount: rolesRes.status === 'fulfilled' ? rolesRes.value.roles?.length || 0 : 0,
          permsCount: permsRes.status === 'fulfilled' ? permsRes.value.permissions?.length || 0 : 0,
          menusCount: menusRes.status === 'fulfilled' ? menusRes.value.menus?.length || 0 : 0,
          activeSessions: settingsRes.status === 'fulfilled' ? settingsRes.value.settings?.system?.activeSessions || 1 : 1,
        });

        if (auditsRes.status === 'fulfilled') {
          setRecentAudits(auditsRes.value.logs || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/40 border border-indigo-100 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>GyanVaniAi Control Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Role: <span className="text-indigo-700 font-semibold">{user?.isSuperAdmin ? 'Super Admin' : user?.roles?.[0]?.name || 'Admin'}</span> — You have {user?.permissions?.length || 0} active authorization permissions assigned.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/users" className="btn-primary text-xs font-semibold">
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </Link>
            <Link to="/admin/audit-logs" className="btn-secondary text-xs font-semibold">
              <Activity className="w-4 h-4 text-slate-500" />
              <span>View Audit Trail</span>
            </Link>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Users */}
        <div className="card-enterprise p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Admin Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stats.usersCount}
            </span>
            <Link to="/admin/users" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-2">Active accounts with role access</p>
        </div>

        {/* Card 2: Roles */}
        <div className="card-enterprise p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Roles
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stats.rolesCount}
            </span>
            <Link to="/admin/roles" className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-0.5">
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-2">Configured role definitions</p>
        </div>

        {/* Card 3: Permissions */}
        <div className="card-enterprise p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Permissions
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stats.permsCount}
            </span>
            <Link to="/admin/permissions" className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-0.5">
              <span>Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-2">Granular resource actions</p>
        </div>

        {/* Card 4: Menus */}
        <div className="card-enterprise p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dynamic Menus
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <MenuIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stats.menusCount}
            </span>
            <Link to="/admin/menus" className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-0.5">
              <span>Edit order</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-2">Authorization-filtered items</p>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Security Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Activity Table */}
        <div className="lg:col-span-2 card-enterprise p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Security Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest immutable administrative actions</p>
            </div>
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All Logs &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : recentAudits.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No recent audit records found.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-semibold">
                    <th className="py-3 px-4 font-semibold">Action</th>
                    <th className="py-3 px-4 font-semibold">Actor</th>
                    <th className="py-3 px-4 font-semibold">Outcome</th>
                    <th className="py-3 px-4 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAudits.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                        {log.actorEmail}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge ${
                            log.outcome === 'SUCCESS' ? 'badge-emerald' : 'badge-rose'
                          }`}
                        >
                          {log.outcome}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security Posture Panel */}
        <div className="card-enterprise p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Security Posture</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Platform authentication & authorization hardening status.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700 font-semibold">Password Hashing</span>
                <span className="badge badge-emerald">Bcrypt Cost 12</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700 font-semibold">Session Storage</span>
                <span className="badge badge-emerald">MongoDB Hashed</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700 font-semibold">CSRF Defense</span>
                <span className="badge badge-indigo">Double-Submit Cookie</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700 font-semibold">Session Lifetime</span>
                <span className="badge badge-slate">24h TTL</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700 font-semibold">Super Admin Lock</span>
                <span className="badge badge-emerald">Active Guard</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Database: MongoDB Atlas</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
