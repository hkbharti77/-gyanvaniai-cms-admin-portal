import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Users as UsersIcon,
  Search,
  Plus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  UserCheck,
  UserPlus,
  Mail,
  Lock,
  Key,
  RotateCcw,
  Check,
} from 'lucide-react';

export default function Users() {
  const { user: currentUser, hasPermission } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleIds: [],
    status: 'active',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter,
        roleId: roleFilter,
      });
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      showToast(err.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await api.getRoles();
        setRoles(data.roles || []);
      } catch (err) {
        console.warn('Could not load roles:', err);
      }
    }
    loadRoles();
  }, []);

  // Quick stats summary
  const stats = useMemo(() => {
    const total = pagination.total || users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const inactive = users.filter((u) => u.status === 'inactive').length;
    return { total, active, inactive, rolesCount: roles.length };
  }, [users, pagination.total, roles]);

  const hasActiveFilters = Boolean(search || statusFilter || roleFilter);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setRoleFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', email: '', password: '', roleIds: [], status: 'active' });
    setModalError('');
    setShowPassword(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      roleIds: user.roles?.map((r) => r.id) || [],
      status: user.status || 'active',
    });
    setModalError('');
    setShowPassword(false);
    setShowEditModal(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      await api.createUser(formData);
      showToast(`User '${formData.name}' created successfully.`);
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.message || 'Failed to create user account.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalError('');
    setModalLoading(true);

    try {
      const payload = {
        name: formData.name,
        roleIds: formData.roleIds,
        status: formData.status,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      await api.updateUser(selectedUser.id, payload);
      showToast(`User '${formData.name}' updated successfully.`);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.message || 'Failed to update user profile.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setModalLoading(true);

    try {
      await api.deleteUser(selectedUser.id);
      showToast(`User '${selectedUser.name}' removed successfully.`);
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete user account.', 'error');
      setShowDeleteModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const toggleRoleSelection = (roleId) => {
    setFormData((prev) => {
      const exists = prev.roleIds.includes(roleId);
      if (exists) {
        return { ...prev, roleIds: prev.roleIds.filter((id) => id !== roleId) };
      }
      return { ...prev, roleIds: [...prev.roleIds, roleId] };
    });
  };

  // Helper for role badge styling
  const getRoleBadgeClass = (roleKey) => {
    switch (roleKey) {
      case 'super_admin':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'admin':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'editor':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'marketing_manager':
      case 'marketing':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-fade-in ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-emerald-600 text-white border-emerald-500'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <XCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.message}</span>
        </div>
      )}

      {/* Header section with Stats Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin User Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Create, manage role assignments, and enforce security policies for administrative accounts.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Total: <strong>{stats.total}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active: <strong>{stats.active}</strong>
            </span>
            {stats.inactive > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                Inactive: <strong>{stats.inactive}</strong>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              <Shield className="w-3 h-3 text-indigo-600" />
              Roles Available: <strong>{stats.rolesCount}</strong>
            </span>
          </div>
        </div>

        {hasPermission('users.create') && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Administrator</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            placeholder="Search administrator by name or email..."
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition-colors"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-600 uppercase tracking-wider bg-slate-50/80 font-bold text-[11px]">
                <th className="py-3.5 px-5 font-bold">User</th>
                <th className="py-3.5 px-4 font-bold">Assigned Roles</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Last Login</th>
                <th className="py-3.5 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <span className="font-medium text-xs">Loading administrators...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500 space-y-2">
                    <UsersIcon className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-700">No administrative users found</p>
                    <p className="text-slate-400 text-xs">
                      {hasActiveFilters
                        ? 'Try adjusting your search query or status filter.'
                        : 'Get started by creating your first administrator account.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuperAdmin = u.roles?.some((r) => r.key === 'super_admin');
                  const isCurrent = currentUser?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <span
                                key={r.id}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeClass(
                                  r.key
                                )}`}
                              >
                                {r.key === 'super_admin' ? (
                                  <ShieldAlert className="w-3 h-3 text-purple-600" />
                                ) : (
                                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                )}
                                <span>{r.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs italic">No roles assigned</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : 'bg-rose-50 text-rose-700 border-rose-200/80'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}
                          />
                          <span className="capitalize">{u.status || 'Active'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasPermission('users.update') && (
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100"
                              title="Edit user profile & roles"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {hasPermission('users.deactivate') && (
                            <button
                              onClick={() => handleOpenDelete(u)}
                              disabled={(isSuperAdmin && !currentUser?.isSuperAdmin) || isCurrent}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              title={
                                isCurrent
                                  ? 'You cannot deactivate your own account'
                                  : isSuperAdmin && !currentUser?.isSuperAdmin
                                  ? 'Super Admin required to deactivate this user'
                                  : 'Deactivate user'
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-slate-200/80 px-5 py-3.5 bg-slate-50/60 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
            <span>
              Showing{' '}
              <strong>
                {(pagination.page - 1) * pagination.limit + 1} -{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{' '}
              of <strong>{pagination.total}</strong> administrators
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 flex items-center gap-1 shadow-xs transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="font-semibold px-2 text-slate-800">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 flex items-center gap-1 shadow-xs transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
         ADD USER MODAL (Renders into document.body across the WHOLE screen)
      ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Administrator"
        subtitle="Provision new administrative user and configure access roles"
        icon={UserPlus}
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-user-form"
              disabled={modalLoading}
              className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Create Account</span>
            </button>
          </>
        }
      >
        <form id="create-user-form" onSubmit={handleCreateSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@gyanvaniai.com"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Initial Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              User can update their password on first login via security settings.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Assign Roles
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Selected: {formData.roleIds.length} role(s)
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto p-2.5 rounded-xl bg-slate-50/80 border border-slate-200">
              {roles.map((r) => {
                const isChecked = formData.roleIds.includes(r.id);
                const disabledSuperAdmin = r.key === 'super_admin' && !currentUser?.isSuperAdmin;

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      if (!disabledSuperAdmin) toggleRoleSelection(r.id);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      disabledSuperAdmin
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200'
                        : isChecked
                        ? 'bg-indigo-50/60 border-indigo-300 shadow-xs'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={disabledSuperAdmin}
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isChecked ? 'text-indigo-950' : 'text-slate-900'
                          }`}
                        >
                          {r.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeClass(
                            r.key
                          )}`}
                        >
                          {r.key}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {r.description || 'Administrative role permissions'}
                      </p>
                      {disabledSuperAdmin && (
                        <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                          Super Administrator role can only be assigned by Super Admins.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────────
         EDIT USER MODAL (Renders into document.body across the WHOLE screen)
      ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showEditModal && Boolean(selectedUser)}
        onClose={() => setShowEditModal(false)}
        title="Edit Administrator Profile"
        subtitle={selectedUser?.email}
        icon={UserCheck}
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-user-form"
              disabled={modalLoading}
              className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </>
        }
      >
        <form id="edit-user-form" onSubmit={handleUpdateSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Account Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
            >
              <option value="active">Active (Access Allowed)</option>
              <option value="inactive">Inactive (Deactivated & Suspended)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reset Password (Optional)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to preserve existing password"
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Only provide a value if you wish to overwrite this user's password.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Role Assignments
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Selected: {formData.roleIds.length} role(s)
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto p-2.5 rounded-xl bg-slate-50/80 border border-slate-200">
              {roles.map((r) => {
                const isChecked = formData.roleIds.includes(r.id);
                const disabledSuperAdmin = r.key === 'super_admin' && !currentUser?.isSuperAdmin;

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      if (!disabledSuperAdmin) toggleRoleSelection(r.id);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      disabledSuperAdmin
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200'
                        : isChecked
                        ? 'bg-indigo-50/60 border-indigo-300 shadow-xs'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={disabledSuperAdmin}
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isChecked ? 'text-indigo-950' : 'text-slate-900'
                          }`}
                        >
                          {r.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeClass(
                            r.key
                          )}`}
                        >
                          {r.key}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {r.description || 'Administrative role permissions'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────────
         DELETE / DEACTIVATE CONFIRMATION MODAL (Renders into document.body)
      ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showDeleteModal && Boolean(selectedUser)}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="max-w-sm"
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Deactivate Administrator?</h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Are you sure you want to remove access for{' '}
            <strong className="text-slate-900">{selectedUser?.name}</strong> ({selectedUser?.email})? All active
            sessions will be revoked immediately.
          </p>

          <div className="flex justify-center gap-2.5 mt-6">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={modalLoading}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>Confirm Deactivation</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
