import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  FileText,
} from 'lucide-react';

export default function CategoryManager() {
  const { hasPermission } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null, loading: false });
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#4f46e5',
    order: 0,
  });

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      showToast(err.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({ name: '', slug: '', description: '', color: '#4f46e5', order: categories.length + 1 });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: cat.color || '#4f46e5',
      order: cat.order || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, form);
        showToast(`Category "${form.name}" updated successfully.`);
      } else {
        await api.createCategory(form);
        showToast(`Category "${form.name}" created successfully.`);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.category) return;
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));
      await api.deleteCategory(deleteModal.category.id);
      showToast(`Category "${deleteModal.category.name}" deleted.`);
      setDeleteModal({ open: false, category: null, loading: false });
      loadCategories();
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium animate-fade-in border ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/blog-manager" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-1">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Taxonomy Management</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Content Categories</h1>
            <p className="text-sm text-slate-500">
              Organize articles into structured categories for search engines and site navigation.
            </p>
          </div>
        </div>

        {hasPermission('categories.manage') && (
          <button onClick={openCreateModal} className="btn-primary text-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Categories Table */}
      <div className="card-enterprise overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm text-slate-500 font-medium">Loading categories taxonomy...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No categories found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Create your first content category to begin organizing published articles.
            </p>
          </div>
        ) : (
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>URL Slug</th>
                <th>Color Tag</th>
                <th>Articles Count</th>
                <th>Description</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#4f46e5' }} />
                      <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                    </div>
                  </td>

                  <td>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      /{cat.slug}
                    </span>
                  </td>

                  <td>
                    <span className="font-mono text-xs text-slate-600">{cat.color || '#4f46e5'}</span>
                  </td>

                  <td>
                    <span className="badge badge-indigo">
                      {cat.postCount} {cat.postCount === 1 ? 'article' : 'articles'}
                    </span>
                  </td>

                  <td className="max-w-xs truncate text-xs text-slate-500">
                    {cat.description || '—'}
                  </td>

                  <td className="text-right whitespace-nowrap">
                    {hasPermission('categories.manage') && (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="Edit Category"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, category: cat, loading: false })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="card-enterprise w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. WhatsApp CRM"
                  className="input-field text-xs w-full"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">URL Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. whatsapp-crm (auto-generated if empty)"
                  className="input-field text-xs w-full font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tag Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="input-field text-xs w-full font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="input-field text-xs w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description for metadata..."
                  className="input-field text-xs w-full resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs flex items-center gap-1.5">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.category && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="card-enterprise w-full max-w-md p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Category</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete category{' '}
              <strong className="text-slate-800 font-semibold">{deleteModal.category.name}</strong>?
            </p>

            {deleteModal.category.postCount > 0 && (
              <div className="p-3 mt-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Warning: {deleteModal.category.postCount} article(s) are categorized under this topic. The system will
                  prevent deletion until those articles are reassigned.
                </span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                disabled={deleteModal.loading}
                onClick={() => setDeleteModal({ open: false, category: null, loading: false })}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                disabled={deleteModal.loading}
                onClick={handleDelete}
                className="btn-danger text-xs flex items-center gap-1.5"
              >
                {deleteModal.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
