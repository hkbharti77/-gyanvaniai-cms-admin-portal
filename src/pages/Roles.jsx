import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Plus,
  Lock,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  XCircle,
} from 'lucide-react';

export default function Roles() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    permissionKeys: [],
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        api.getRoles(),
        api.getPermissions(),
      ]);
      setRoles(rolesRes.roles || []);
      setPermissions(permsRes.permissions || []);
      setGroupedPermissions(permsRes.grouped || {});
    } catch (err) {
      showToast(err.message || 'Failed to load roles and permissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ key: '', name: '', description: '', permissionKeys: [] });
    setModalError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (role) => {
    setSelectedRole(role);
    setFormData({
      key: role.key,
      name: role.name,
      description: role.description || '',
      permissionKeys: role.permissionKeys || [],
    });
    setModalError('');
    setShowEditModal(true);
  };

  const handleOpenDelete = (role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const togglePermission = (key) => {
    setFormData(prev => {
      const current = prev.permissionKeys;
      if (current.includes(key)) {
        return { ...prev, permissionKeys: current.filter(k => k !== key) };
      } else {
        return { ...prev, permissionKeys: [...current, key] };
      }
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      await api.createRole(formData);
      showToast(`Role '${formData.name}' created successfully.`);
      setShowAddModal(false);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to create role.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    setModalError('');
    setModalLoading(true);

    try {
      await api.updateRole(selectedRole.id, {
        name: formData.name,
        description: formData.description,
        permissionKeys: formData.permissionKeys,
      });
      showToast(`Role '${formData.name}' updated successfully.`);
      setShowEditModal(false);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to update role.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    setModalLoading(true);

    try {
      await api.deleteRole(selectedRole.id);
      showToast(`Role '${selectedRole.name}' deleted successfully.`);
      setShowDeleteModal(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete role.', 'error');
      setShowDeleteModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 text-xs font-semibold animate-fade-in ${
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
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Role-Based Access Control</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure administrative roles and map explicit resource permissions.
          </p>
        </div>

        {hasPermission('roles.create') && (
          <button onClick={handleOpenAdd} className="btn-primary text-xs font-semibold">
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        )}
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((role) => {
            const isSuperAdmin = role.key === 'super_admin';

            return (
              <div
                key={role.id}
                className="card-enterprise p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">{role.name}</h2>
                        <span className="text-[11px] font-mono text-slate-500">{role.key}</span>
                      </div>
                    </div>

                    {role.isSystemRole && (
                      <span className="badge badge-indigo inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>System</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                    {role.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      {isSuperAdmin ? 'All System (32+)' : `${role.permissionKeys?.length || 0} Permissions`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasPermission('roles.update') && !isSuperAdmin && (
                      <button
                        onClick={() => handleOpenEdit(role)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit role permissions"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {hasPermission('roles.delete') && !role.isSystemRole && (
                      <button
                        onClick={() => handleOpenDelete(role)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete custom role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Create Custom Role</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Compliance Auditor"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Key Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="e.g. compliance_auditor"
                    className="input-field font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline the responsibilities of this administrative role..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Select Permissions ({formData.permissionKeys.length} selected)
                </label>
                <div className="space-y-4 max-h-60 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="space-y-1.5">
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                        {resource}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((p) => {
                          const isChecked = formData.permissionKeys.includes(p.key);
                          return (
                            <label
                              key={p.key}
                              className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                isChecked ? 'bg-white font-semibold text-indigo-900 border border-indigo-100 shadow-xs' : 'hover:bg-white text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(p.key)}
                                className="rounded text-indigo-600 focus:ring-0"
                              />
                              <span className="font-mono text-[11px] text-slate-800">{p.key}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Edit Role: {selectedRole.name}</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Configure Permissions ({formData.permissionKeys.length} selected)
                </label>
                <div className="space-y-4 max-h-60 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="space-y-1.5">
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                        {resource}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((p) => {
                          const isChecked = formData.permissionKeys.includes(p.key);
                          return (
                            <label
                              key={p.key}
                              className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                isChecked ? 'bg-white font-semibold text-indigo-900 border border-indigo-100 shadow-xs' : 'hover:bg-white text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(p.key)}
                                className="rounded text-indigo-600 focus:ring-0"
                              />
                              <span className="font-mono text-[11px] text-slate-800">{p.key}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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

      {/* DELETE MODAL */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Delete Role?</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="text-slate-900 font-bold">{selectedRole.name}</span>? This action is irreversible.
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
                {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
