import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users as UsersIcon,
  Search,
  Plus,
  Shield,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
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

  const handleOpenAdd = () => {
    setFormData({ name: '', email: '', password: '', roleIds: [], status: 'active' });
    setModalError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      roleIds: user.roles?.map(r => r.id) || [],
      status: user.status || 'active',
    });
    setModalError('');
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
    setFormData(prev => {
      const exists = prev.roleIds.includes(roleId);
      if (exists) {
        return { ...prev, roleIds: prev.roleIds.filter(id => id !== roleId) };
      }
      return { ...prev, roleIds: [...prev.roleIds, roleId] };
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <XCircle className="w-5 h-5 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
          <span className="text-xs font-semibold">{toastMessage.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, manage roles, and enforce security policies for administrative accounts.
          </p>
        </div>

        {hasPermission('users.create') && (
          <button onClick={handleOpenAdd} className="btn-primary text-xs font-semibold">
            <Plus className="w-4 h-4" />
            <span>Add Administrator</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="card-enterprise p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            placeholder="Search by name or email..."
            className="input-field pl-10 text-xs py-2"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-field text-xs py-2 w-full md:w-36"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-field text-xs py-2 w-full md:w-44"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-enterprise overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider bg-slate-50 font-semibold">
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Roles</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Last Login</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <span>Loading users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    No administrative users match the filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuperAdmin = u.roles?.some(r => r.key === 'super_admin');

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[11px] text-slate-500">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {u.roles?.map((r) => (
                            <span
                              key={r.id}
                              className={`badge ${
                                r.key === 'super_admin'
                                  ? 'badge-emerald'
                                  : r.key === 'admin'
                                  ? 'badge-indigo'
                                  : 'badge-slate'
                              }`}
                            >
                              {r.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`badge ${
                            u.status === 'active' ? 'badge-emerald' : 'badge-rose'
                          }`}
                        >
                          <span className={`status-dot ${u.status === 'active' ? 'status-dot-active' : 'status-dot-inactive'}`} />
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {hasPermission('users.update') && (
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {hasPermission('users.deactivate') && (
                            <button
                              onClick={() => handleOpenDelete(u)}
                              disabled={isSuperAdmin && !currentUser.isSuperAdmin}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title={isSuperAdmin && !currentUser.isSuperAdmin ? 'Cannot delete Super Admin' : 'Deactivate user'}
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
          <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="font-semibold px-2 text-slate-700">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Create Administrator</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@gyanvaniai.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Assign Roles</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {roles.map((r) => {
                    const isChecked = formData.roleIds.includes(r.id);
                    const disabledSuperAdmin = r.key === 'super_admin' && !currentUser.isSuperAdmin;

                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          disabledSuperAdmin ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white text-slate-800'
                        } ${isChecked ? 'bg-white font-semibold text-indigo-900 border border-indigo-100 shadow-xs' : ''}`}
                      >
                        <input
                          type="checkbox"
                          disabled={disabledSuperAdmin}
                          checked={isChecked}
                          onChange={() => toggleRoleSelection(r.id)}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="font-semibold text-slate-900">{r.name}</span>
                        <span className="text-[11px] text-slate-500 truncate">{r.description}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary text-xs"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Edit Administrator Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Account Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive (Deactivated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reset Password (Optional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty to preserve existing password"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Role Assignments</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {roles.map((r) => {
                    const isChecked = formData.roleIds.includes(r.id);
                    const disabledSuperAdmin = r.key === 'super_admin' && !currentUser.isSuperAdmin;

                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          disabledSuperAdmin ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white text-slate-800'
                        } ${isChecked ? 'bg-white font-semibold text-indigo-900 border border-indigo-100 shadow-xs' : ''}`}
                      >
                        <input
                          type="checkbox"
                          disabled={disabledSuperAdmin}
                          checked={isChecked}
                          onChange={() => toggleRoleSelection(r.id)}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="font-semibold text-slate-900">{r.name}</span>
                        <span className="text-[11px] text-slate-500 truncate">{r.description}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary text-xs"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Deactivate User Account?</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to remove <span className="text-slate-900 font-bold">{selectedUser.name}</span> ({selectedUser.email})? All active sessions will be revoked immediately.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={modalLoading}
                className="btn-danger text-xs"
              >
                {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
