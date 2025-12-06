import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminCategoryAPI } from '../services/api';
import { Category } from '../types';
import { EditIcon, DeleteIcon } from '../components/icons/ActionIcons';

type CategoryForm = {
  name: string;
  description: string;
  isActive: boolean;
};

const createInitialForm = (): CategoryForm => ({
  name: '',
  description: '',
  isActive: true,
});

export const AdminCategories: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CategoryForm>(createInitialForm);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminCategoryAPI.getAll({ includeInactive: true });
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(createInitialForm());
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCategory) {
        await adminCategoryAPI.update(editingCategory._id, formData);
      } else {
        await adminCategoryAPI.create(formData);
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(t('admin.categories.confirmDelete'))) return;
    try {
      await adminCategoryAPI.delete(category._id);
      fetchCategories();
      if (editingCategory?._id === category._id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(t('common.error'));
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await adminCategoryAPI.update(category._id, { isActive: !category.isActive });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
      alert(t('common.error'));
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const term = search.toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(term) ||
      (category.description || '').toLowerCase().includes(term)
    );
  }, [categories, search]);

  return (
    <div className="admin-categories">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{t('admin.categories.title')}</h1>
          <p className="admin-page-subtitle">{t('admin.categories.subtitle')}</p>
        </div>
        <div className="admin-page-actions">
          <input
            type="search"
            className="admin-search-input"
            placeholder={t('common.search') || ''}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="admin-btn-secondary"
            onClick={resetForm}
          >
            {t('admin.categories.newCategory')}
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h2>{editingCategory ? t('admin.categories.editTitle') : t('admin.categories.addTitle')}</h2>
        <form className="category-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category-name">{t('admin.categories.name')}</label>
            <input
              id="category-name"
              type="text"
              className="admin-form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder={'Nom de la catégorie'}
            />
          </div>
          <div className="form-group">
            <label htmlFor="category-description">{t('admin.categories.description')}</label>
            <textarea
              id="category-description"
              className="admin-form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder={'Description de la catégorie (optionnel)'}
            />
          </div>
          <div className="form-group checkbox-group">
            <label htmlFor="category-active">
              <input
                id="category-active"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>{t('admin.categories.isActive')}</span>
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('common.save')}
            </button>
            {editingCategory && (
              <button type="button" className="admin-btn-secondary" onClick={resetForm}>
                {t('common.cancel')}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="admin-empty-state">
            <p>{t('admin.categories.empty')}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.categories.name')}</th>
                <th>{t('admin.categories.description')}</th>
                <th>{t('admin.categories.products')}</th>
                <th>{t('admin.categories.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <div className="category-name-cell">
                      <strong>{category.name}</strong>
                      <span className="category-slug">/{category.slug}</span>
                    </div>
                  </td>
                  <td>{category.description || '—'}</td>
                  <td>
                    <span className="category-count-badge">
                      {category.productCount ?? 0}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${category.isActive ? 'status-success' : 'status-muted'}`}>
                      {category.isActive ? t('common.yes') : t('common.no')}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="admin-btn-edit" 
                        onClick={() => handleEdit(category)}
                        title={t('common.edit')}
                      >
                        <EditIcon size={18} />
                      </button>
                      <button
                        className="admin-btn-secondary"
                        onClick={() => handleToggleActive(category)}
                        title={category.isActive ? t('admin.categories.disable') : t('admin.categories.enable')}
                      >
                        {category.isActive ? t('admin.categories.disable') : t('admin.categories.enable')}
                      </button>
                      <button 
                        className="admin-btn-delete" 
                        onClick={() => handleDelete(category)}
                        title={t('common.delete')}
                      >
                        <DeleteIcon size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};


