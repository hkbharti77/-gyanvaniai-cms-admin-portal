import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  KeyRound,
  Search,
  Shield,
  Layers,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function Permissions() {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadPermissions() {
      try {
        setLoading(true);
        const data = await api.getPermissions();
        setGrouped(data.grouped || {});
      } catch (err) {
        console.error('Failed to load permissions catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPermissions();
  }, []);

  const filteredGroups = Object.entries(grouped).reduce((acc, [resource, perms]) => {
    const matching = perms.filter(
      p =>
        p.key.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        resource.toLowerCase().includes(search.toLowerCase())
    );
    if (matching.length > 0) {
      acc[resource] = matching;
    }
    return acc;
  }, {});

  const totalFilteredPerms = Object.values(filteredGroups).reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Permissions Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            System authorization rules mapped by <span className="font-mono text-indigo-700 font-semibold">resource.action</span> convention.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions..."
            className="input-field pl-10 text-xs py-2"
          />
        </div>
      </div>

      {/* Catalog listing */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : totalFilteredPerms === 0 ? (
        <div className="card-enterprise p-12 text-center text-slate-500 text-sm">
          No permissions match the search term '{search}'.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(filteredGroups).map(([resource, perms]) => (
            <div key={resource} className="card-enterprise p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                  {resource.charAt(0)}
                </div>
                <h2 className="text-sm font-bold text-slate-900 capitalize tracking-wide">
                  {resource} Resource
                </h2>
                <span className="badge badge-slate text-[10px] ml-auto">
                  {perms.length} Actions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {perms.map((p) => {
                  const actionType = p.action;
                  const isDestructive = actionType === 'delete' || actionType === 'deactivate';
                  const isPublish = actionType === 'publish';

                  return (
                    <div
                      key={p.key}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-indigo-700">
                          {p.key}
                        </span>
                        <span
                          className={`badge text-[9px] ${
                            isDestructive
                              ? 'badge-rose'
                              : isPublish
                              ? 'badge-emerald'
                              : 'badge-indigo'
                          }`}
                        >
                          {p.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
