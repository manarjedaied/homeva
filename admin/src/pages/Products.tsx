import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminCategoryAPI, adminProductAPI } from '../services/api';
import { Category, Product } from '../types';
import { formatPrice } from '../utils/formatPrice';

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  pourcentagePromo: string;
  stockLimite: boolean;
};

const createInitialFormData = (): ProductFormData => ({
  name: '',
  description: '',
  price: '',
  category: '',
  pourcentagePromo: '',
  stockLimite: false,
});

export const AdminProducts: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(() => createInitialFormData());
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminProductAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      setCategoryError(null);
      const data = await adminCategoryAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoryError(t('common.error'));
    } finally {
      setCategoryLoading(false);
    }
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop grande. Taille maximale: 5MB");
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setImageFiles(validFiles);
    const previews = await Promise.all(validFiles.map(readFileAsDataUrl));
    setImagePreviews(previews);
  };

  const resetForm = () => {
    setFormData(createInitialFormData());
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
  };

  const buildFormPayload = () => {
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('price', String(parseFloat(formData.price)));
    if (formData.category) {
      payload.append('category', formData.category);
    }
    payload.append(
      'pourcentagePromo',
      String(parseFloat(formData.pourcentagePromo || '0') || 0)
    );
    payload.append('stockLimite', String(formData.stockLimite));
    imageFiles.forEach((file) => {
      payload.append('images', file);
    });
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = buildFormPayload();

      if (editingProduct) {
        await adminProductAPI.update(editingProduct._id, payload);
      } else {
        await adminProductAPI.create(payload);
      }

      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde du produit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category:
        typeof product.category === 'object' && product.category !== null
          ? product.category._id
          : product.category || '',
      pourcentagePromo: product.pourcentagePromo?.toString() || '',
      stockLimite: Boolean(product.stockLimite),
    });
    setExistingImages(product.images ?? (product.image ? [product.image] : []));
    setImageFiles([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    try {
      setAddingCategory(true);
      const created = await adminCategoryAPI.create(trimmed);
      setCategories((prev) => [...prev, created]);
      setNewCategoryName('');
      setFormData((prev) => ({
        ...prev,
        category: prev.category || created._id,
      }));
    } catch (error) {
      console.error('Error creating category:', error);
      alert(t('common.error'));
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.products.confirmDelete'))) return;
    try {
      await adminProductAPI.delete(id);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-products">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="admin-page-header">
        <h1 className="admin-page-title">{t('admin.products.title')}</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            resetForm();
          }}
          className="admin-btn-primary"
        >
          {t('admin.products.add')}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-modal">
          <div className="admin-form-content">
            <h2>{editingProduct ? t('admin.products.edit') : t('admin.products.add')}</h2>
            <form onSubmit={handleSubmit} className="admin-product-form">
              <div className="admin-form-grid">
                <div className="form-group">
                <label>{t('admin.products.name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                </div>
                <div className="form-group">
                  <label>{t('admin.products.price')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('admin.products.category')}</label>
                  {categoryLoading ? (
                    <div className="category-status">{t('common.loading')}</div>
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      disabled={!categories.length}
                    >
                      <option value="">{t('admin.products.selectCategory')}</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                          {category.isActive ? '' : ` (${t('admin.categories.inactiveLabel')})`}
                        </option>
                      ))}
                    </select>
                  )}
                  {!categories.length && !categoryLoading && (
                    <p className="category-helper">
                      {t('admin.products.categoryHelp')}
                    </p>
                  )}
                  {categoryError && <p className="form-error">{categoryError}</p>}
                </div>
                <div className="form-group">
                  <label>{t('admin.products.pourcentagePromo')}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.pourcentagePromo}
                    onChange={(e) =>
                      setFormData({ ...formData, pourcentagePromo: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{t('admin.products.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.stockLimite}
                    onChange={(e) => setFormData({ ...formData, stockLimite: e.target.checked })}
                  />
                  <span>{t('admin.products.stockLimite')}</span>
                </label>
              </div>
              <div className="form-group">
                <label>{t('admin.products.image')}</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="image-file-input"
                    id="product-image-upload"
                  />
                  <label htmlFor="product-image-upload" className="image-upload-label">
                    <span className="upload-icon">📷</span>
                    <span>
                      {imageFiles.length > 0
                        ? `${imageFiles.length} fichier(s) sélectionné(s)`
                        : 'Choisir des images'}
                    </span>
                  </label>
                  <p className="image-hint">{t('admin.products.imageHint')}</p>
                  {existingImages.length > 0 && (
                    <div className="image-preview-grid">
                      {existingImages.map((img) => (
                        <div key={img} className="image-preview-container">
                          <img src={img} alt="Produit" className="image-preview" />
                        </div>
                      ))}
                    </div>
                  )}
                  {imagePreviews.length > 0 && (
                    <div className="image-preview-grid">
                      {imagePreviews.map((preview) => (
                        <div key={preview} className="image-preview-container">
                          <img src={preview} alt="Preview" className="image-preview" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="category-inline-form">
                <label>{t('admin.products.addCategory')}</label>
                <div className="category-inline-controls">
                  <input
                    type="text"
                    value={newCategoryName}
                    placeholder={t('admin.products.newCategoryPlaceholder') || ''}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim() || addingCategory}
                  >
                    {addingCategory ? t('common.loading') : t('admin.products.addCategory')}
                  </button>
                </div>
                {!categories.length && (
                  <p className="category-empty">
                    {t('admin.products.noCategories')}
                  </p>
                )}
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn-primary" disabled={submitting}>
                  {submitting ? t('common.loading') : t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                  className="admin-btn-secondary"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.products.image')}</th>
              <th>{t('admin.products.name')}</th>
              <th>{t('admin.products.category')}</th>
              <th>{t('admin.products.price')}</th>
              <th>{t('admin.products.stockLimite')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  {product.images?.[0] || product.image ? (
                    <img
                      src={product.images?.[0] || product.image || ''}
                      alt={product.name}
                      className="product-table-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="product-table-image-placeholder">📦</div>
                  )}
                </td>
                <td>{product.name}</td>
                <td>
                  {typeof product.category === 'object' && product.category !== null ? (
                    <div className="category-name-cell">
                      <span>{product.category.name}</span>
                      {!product.category.isActive && (
                        <span className="status-badge status-muted">
                          {t('admin.categories.inactiveLabel')}
                        </span>
                      )}
                    </div>
                  ) : (
                    product.category || '-'
                  )}
                </td>
                <td>{formatPrice(product.price)}</td>
                <td>{product.stockLimite ? t('common.yes') : t('common.no')}</td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => handleEdit(product)} className="admin-btn-edit">
                      {t('common.edit')}
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="admin-btn-delete">
                      {t('common.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

