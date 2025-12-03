import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminProductAPI } from '../services/api';
import { Product } from '../types';
import { formatPrice } from '../utils/formatPrice';

export const AdminProducts: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProducts();
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop grande. Taille maximale: 5MB');
        return;
      }

      setImageFile(file);
      
      // Créer un preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
      };

      if (editingProduct) {
        await adminProductAPI.update(editingProduct._id, productData);
      } else {
        await adminProductAPI.create(productData);
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' });
      setImagePreview(null);
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category || '',
      stock: product.stock?.toString() || '',
      image: product.image || '',
    });
    setImagePreview(product.image || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('admin.products.confirmDelete'))) {
      try {
        await adminProductAPI.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
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
        <button onClick={() => { setShowForm(true); setEditingProduct(null); setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' }); setImagePreview(null); setImageFile(null); }} className="admin-btn-primary">
          {t('admin.products.add')}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-modal">
          <div className="admin-form-content">
            <h2>{editingProduct ? t('admin.products.edit') : t('admin.products.add')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('admin.products.name')}</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>{t('admin.products.description')}</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>{t('admin.products.price')}</label>
                <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>{t('admin.products.category')}</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('admin.products.stock')}</label>
                <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('admin.products.image')}</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-file-input"
                    id="product-image-upload"
                  />
                  <label htmlFor="product-image-upload" className="image-upload-label">
                    <span className="upload-icon">📷</span>
                    <span>{imageFile ? imageFile.name : 'Choisir une image'}</span>
                  </label>
                  {imagePreview && (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setFormData({ ...formData, image: '' });
                        }}
                        className="image-remove-btn"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {!imagePreview && formData.image && (
                    <div className="image-preview-container">
                      <img src={formData.image} alt="Current" className="image-preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: '' });
                        }}
                        className="image-remove-btn"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn-primary">{t('common.save')}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); }} className="admin-btn-secondary">{t('common.cancel')}</button>
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
              <th>{t('admin.products.stock')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  {product.image ? (
                    <img 
                      src={product.image} 
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
                <td>{product.category || '-'}</td>
                <td>{formatPrice(product.price)}</td>
                <td>{product.stock || 0}</td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => handleEdit(product)} className="admin-btn-edit">{t('common.edit')}</button>
                    <button onClick={() => handleDelete(product._id)} className="admin-btn-delete">{t('common.delete')}</button>
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

