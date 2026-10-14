import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Menu as MenuIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  X,
  XCircle,
  LayoutDashboard,
  Users,
  KeyRound,
  FileText,
  Settings,
  FileEdit,
  PenTool,
  Image,
  BarChart3,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

const AVAILABLE_ICONS = [
  'LayoutDashboard',
  'Users',
  'Shield',
  'KeyRound',
  'Menu',
  'FileText',
  'Settings',
  'FileEdit',
  'PenTool',
  'Image',
  'BarChart3',
  'TrendingUp',
  'ShieldCheck',
];

export default function Menus() {
  const { hasPermission } = useAuth();
  const [menus, setMenus] = useState([]);
  const [approvedRoutes, setApprovedRoutes] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);

  const [formData, setFormData] = useState({
    label: '',
    icon: 'FileText',
    routeKey: '',
    parentId: '',
    requiredPermission: '',
    sortOrder: 10,
    enabled: true,
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
      const [menusRes, permsRes] = await Promise.all([
        api.getMenus(),
        api.getPermissions(),
      ]);
      setMenus(menusRes.menus || []);
      setApprovedRoutes(menusRes.approvedRoutes || []);
      setPermissions(permsRes.permissions || []);
    } catch (err) {
      showToast(err.message || 'Failed to load menu data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      label: '',
      icon: 'FileText',
      routeKey: approvedRoutes[0] || '/admin/dashboard',
      parentId: '',
      requiredPermission: '',
      sortOrder: (menus.length + 1) * 10,
      enabled: true,
    });
    setModalError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (menu) => {
    setSelectedMenu(menu);
    setFormData({
      label: menu.label,
      icon: menu.icon || 'FileText',
      routeKey: menu.routeKey || '',
      parentId: menu.parentId || '',
      requiredPermission: menu.requiredPermission || '',
      sortOrder: menu.sortOrder || 10,
      enabled: Boolean(menu.enabled),
    });
    setModalError('');
    setShowEditModal(true);
  };

  const handleOpenDelete = (menu) => {
    setSelectedMenu(menu);
    setShowDeleteModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      await api.createMenuItem(formData);
      showToast(`Menu item '${formData.label}' created!`);
      setShowAddModal(false);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to create menu item');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMenu) return;
    setModalError('');
    setModalLoading(true);

    try {
      await api.updateMenuItem(selectedMenu.id, formData);
      showToast(`Menu item '${formData.label}' updated!`);
      setShowEditModal(false);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to update menu item');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMenu) return;
    setModalLoading(true);

    try {
      await api.deleteMenuItem(selectedMenu.id);
      showToast(`Menu item '${selectedMenu.label}' removed!`);
      setShowDeleteModal(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete menu item', 'error');
      setShowDeleteModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= menus.length) return;

    const newItems = [...menus];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const updatedPayload = newItems.map((item, idx) => ({
      id: item.id,
      sortOrder: (idx + 1) * 10,
      parentId: item.parentId,
    }));

    setMenus(newItems.map((item, idx) => ({ ...item, sortOrder: (idx + 1) * 10 })));

    try {
      await api.reorderMenus(updatedPayload);
      showToast('Menu order updated!');
    } catch (err) {
      showToast(err.message || 'Failed to reorder menus', 'error');
      loadData();
    }
  };

  const handleToggleEnabled = async (menu) => {
    try {
      await api.updateMenuItem(menu.id, { enabled: !menu.enabled });
      showToast(`Menu item ${!menu.enabled ? 'enabled' : 'disabled'}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dynamic Navigation Menus</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage sidebar items, configure permission gates, and customize navigation hierarchy.
          </p>
        </div>

        {hasPermission('menus.create') && (
          <button onClick={handleOpenAdd} className="btn-primary text-xs font-semibold">
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        )}
      </div>

      {/* Menus Table */}
      <div className="card-enterprise overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider bg-slate-50 font-semibold">
                <th className="py-3.5 px-4 font-semibold w-16 text-center">Order</th>
                <th className="py-3.5 px-4 font-semibold">Menu Item</th>
                <th className="py-3.5 px-4 font-semibold">Route Target</th>
                <th className="py-3.5 px-4 font-semibold">Required Permission</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <span>Loading navigation structure...</span>
                  </td>
                </tr>
              ) : menus.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    No navigation items registered.
                  </td>
                </tr>
              ) : (
                menus.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Reordering arrows */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(idx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === menus.length - 1}
                          onClick={() => handleMoveOrder(idx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Label & Icon */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {m.icon?.slice(0, 2) || 'MN'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{m.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">icon: {m.icon}</span>
                        </div>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-3 px-4 font-mono text-[11px] text-indigo-700 font-semibold">
                      {m.routeKey || '—'}
                    </td>

                    {/* Required Permission */}
                    <td className="py-3 px-4">
                      {m.requiredPermission ? (
                        <span className="badge badge-indigo text-[10px]">
                          {m.requiredPermission}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Public to all Admins</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleEnabled(m)}
                        className={`badge cursor-pointer ${
                          m.enabled ? 'badge-emerald' : 'badge-slate'
                        }`}
                      >
                        <span className={`status-dot ${m.enabled ? 'status-dot-active' : 'status-dot-inactive'}`} />
                        {m.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasPermission('menus.update') && (
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit menu item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('menus.delete') && (
                          <button
                            onClick={() => handleOpenDelete(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete menu item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MENU MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Navigation Item</h2>
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
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Menu Label</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. Audit Logs"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Approved Route</label>
                  <select
                    value={formData.routeKey}
                    onChange={(e) => setFormData({ ...formData, routeKey: e.target.value })}
                    className="input-field text-xs"
                  >
                    {approvedRoutes.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="input-field text-xs"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Required Permission Gate
                </label>
                <select
                  value={formData.requiredPermission}
                  onChange={(e) => setFormData({ ...formData, requiredPermission: e.target.value })}
                  className="input-field text-xs font-mono"
                >
                  <option value="">None (Accessible to all authenticated admins)</option>
                  {permissions.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.key} ({p.resource})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enabledCheck"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <label htmlFor="enabledCheck" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Enable menu item immediately in sidebar
                </label>
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
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MENU MODAL */}
      {showEditModal && selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Edit Menu Item</h2>
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
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Menu Label</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Route Key</label>
                  <select
                    value={formData.routeKey}
                    onChange={(e) => setFormData({ ...formData, routeKey: e.target.value })}
                    className="input-field text-xs"
                  >
                    {approvedRoutes.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="input-field text-xs"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Required Permission Gate
                </label>
                <select
                  value={formData.requiredPermission}
                  onChange={(e) => setFormData({ ...formData, requiredPermission: e.target.value })}
                  className="input-field text-xs font-mono"
                >
                  <option value="">None (Accessible to all authenticated admins)</option>
                  {permissions.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.key} ({p.resource})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enabledCheckEdit"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <label htmlFor="enabledCheckEdit" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Item is active and visible in navigation
                </label>
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
      {showDeleteModal && selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Delete Menu Item?</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to remove <span className="text-slate-900 font-bold">{selectedMenu.label}</span> ({selectedMenu.routeKey})?
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
