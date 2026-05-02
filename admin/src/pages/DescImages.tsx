import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminDescImgAPI, adminProductAPI, getImageUrl } from '../services/api';
import { DescImgProd, DescImgProdType, Product } from '../types';
import { DeleteIcon, EditIcon } from '../components/icons/ActionIcons';

type UploadRow = {
  alt: string;
  caption: string;
  type: DescImgProdType;
  position: number;
  isMain: boolean;
};

const createUploadRow = (index: number): UploadRow => ({
  alt: '',
  caption: '',
  type: index === 0 ? 'hero' : 'other',
  position: index,
  isMain: index === 0,
});

const asCaptionInput = (caption: DescImgProd['caption']) => {
  if (caption == null) return '';
  return typeof caption === 'string' ? caption : JSON.stringify(caption, null, 2);
};

const parseCaption = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
};

export const AdminDescImages: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [images, setImages] = useState<DescImgProd[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingImage, setEditingImage] = useState<DescImgProd | null>(null);
  const [editForm, setEditForm] = useState({
    alt: '',
    caption: '',
    type: 'other' as DescImgProdType,
    position: 0,
    isMain: false,
  });

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === selectedProductId) || null,
    [products, selectedProductId]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProducts(true);
        const data = await adminProductAPI.getAll();
        setProducts(data);
        if (data.length > 0) {
          setSelectedProductId(data[0]._id);
        }
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: t('common.error') });
      } finally {
        setLoadingProducts(false);
      }
    };

    load();
  }, [t]);

  useEffect(() => {
    const loadImages = async () => {
      if (!selectedProductId) {
        setImages([]);
        return;
      }
      try {
        setLoadingImages(true);
        const data = await adminDescImgAPI.getByProduct(selectedProductId);
        setImages(data);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: t('common.error') });
      } finally {
        setLoadingImages(false);
      }
    };

    loadImages();
  }, [selectedProductId, t]);

  const sortedImages = [...images].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    const posA = a.position ?? 0;
    const posB = b.position ?? 0;
    if (posA !== posB) return posA - posB;
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  });

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of selected) {
      if (!file.type.startsWith('image/')) continue;
      validFiles.push(file);
      validPreviews.push(await readFileAsDataUrl(file));
    }

    if (!validFiles.length) return;

    setFiles(validFiles);
    setPreviews(validPreviews);
    setRows(validFiles.map((_, index) => createUploadRow(index)));
    event.target.value = '';
  };

  const updateRow = (index: number, next: Partial<UploadRow>) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  };

  const resetUpload = () => {
    setFiles([]);
    setPreviews([]);
    setRows([]);
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProductId) {
      setMessage({ type: 'error', text: 'productId requis' });
      return;
    }
    if (!files.length) {
      setMessage({ type: 'error', text: 'Fichier manquant' });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('productId', selectedProductId);
      files.forEach((file) => formData.append('files', file));
      formData.append('items', JSON.stringify(rows));

      await adminDescImgAPI.upload(formData);
      resetUpload();
      const refreshed = await adminDescImgAPI.getByProduct(selectedProductId);
      setImages(refreshed);
      setMessage({ type: 'success', text: t('admin.descImages.uploadSuccess') });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('common.error') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (image: DescImgProd) => {
    setEditingImage(image);
    setEditForm({
      alt: image.alt || '',
      caption: asCaptionInput(image.caption),
      type: image.type || 'other',
      position: image.position ?? 0,
      isMain: Boolean(image.isMain),
    });
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingImage) return;

    try {
      setSubmitting(true);
      await adminDescImgAPI.update(editingImage._id, {
        alt: editForm.alt,
        caption: parseCaption(editForm.caption),
        type: editForm.type,
        position: editForm.position,
        isMain: editForm.isMain,
      });
      setEditingImage(null);
      const refreshed = await adminDescImgAPI.getByProduct(selectedProductId);
      setImages(refreshed);
      setMessage({ type: 'success', text: t('admin.descImages.updateSuccess') });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('common.error') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (image: DescImgProd) => {
    if (!window.confirm(t('admin.descImages.deleteConfirm'))) return;

    try {
      setSubmitting(true);
      await adminDescImgAPI.delete(image._id);
      const refreshed = await adminDescImgAPI.getByProduct(selectedProductId);
      setImages(refreshed);
      setMessage({ type: 'success', text: t('admin.descImages.deleteSuccess') });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('common.error') });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProducts) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="admin-desc-images">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{t('admin.descImages.title')}</h1>
          <p className="admin-page-subtitle">{t('admin.descImages.subtitle')}</p>
        </div>
      </div>

      {message && <div className={`settings-message ${message.type}`}>{message.text}</div>}

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h2>{t('admin.descImages.uploadTitle')}</h2>
        <form onSubmit={handleUpload} className="admin-form settings-form">
          <div className="admin-form-group">
            <label className="admin-form-label">{t('admin.descImages.product')}</label>
            <select
              className="admin-form-input"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">{t('admin.descImages.files')}</label>
            <input type="file" className="admin-form-input" accept="image/*" multiple onChange={handleFilesChange} />
            <p className="admin-form-hint">{t('admin.descImages.filesHint')}</p>
          </div>

          {files.length > 0 && (
            <div className="settings-section" style={{ marginTop: 16 }}>
              <div className="settings-section-header">
                <h2 className="settings-section-title">{t('admin.descImages.itemsTitle')}</h2>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16, alignItems: 'start', padding: 16, border: '1px solid var(--border-color)', borderRadius: 16 }}
                  >
                    <img src={previews[index]} alt={file.name} style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 12 }} />
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div>
                        <strong>{file.name}</strong>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>{Math.round(file.size / 1024)} KB</div>
                      </div>
                      <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div className="form-group">
                          <label>{t('admin.descImages.alt')}</label>
                          <input className="admin-form-input" type="text" value={rows[index]?.alt || ''} onChange={(e) => updateRow(index, { alt: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>{t('admin.descImages.type')}</label>
                          <select className="admin-form-input" value={rows[index]?.type || 'other'} onChange={(e) => updateRow(index, { type: e.target.value as DescImgProdType })}>
                            <option value="hero">hero</option>
                            <option value="lifestyle">lifestyle</option>
                            <option value="infographic">infographic</option>
                            <option value="spec">spec</option>
                            <option value="other">other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>{t('admin.descImages.position')}</label>
                          <input className="admin-form-input" type="number" value={rows[index]?.position ?? index} onChange={(e) => updateRow(index, { position: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="form-group checkbox-group">
                          <label>
                            <input type="checkbox" checked={rows[index]?.isMain || false} onChange={(e) => updateRow(index, { isMain: e.target.checked })} />
                            <span>{t('admin.descImages.main')}</span>
                          </label>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>{t('admin.descImages.caption')}</label>
                        <textarea className="admin-form-textarea" rows={3} value={rows[index]?.caption || ''} onChange={(e) => updateRow(index, { caption: e.target.value })} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('admin.descImages.uploadButton')}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-page-header" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>{t('admin.descImages.galleryTitle')}</h2>
            <p className="admin-page-subtitle" style={{ marginTop: 6 }}>
              {selectedProduct?.name || t('admin.descImages.chooseProduct')}
            </p>
          </div>
          <button className="admin-btn-secondary" type="button" onClick={() => selectedProductId && adminDescImgAPI.getByProduct(selectedProductId).then(setImages)} disabled={!selectedProductId || loadingImages}>
            {loadingImages ? t('common.loading') : t('admin.descImages.refresh')}
          </button>
        </div>

        {loadingImages ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>{t('common.loading')}</p>
          </div>
        ) : sortedImages.length === 0 ? (
          <div className="admin-empty-state">
            <p>{t('admin.descImages.empty')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {sortedImages.map((image) => (
              <div key={image._id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 16, padding: 16, border: '1px solid var(--border-color)', borderRadius: 16, alignItems: 'start' }}>
                <img src={getImageUrl(image.url)} alt={image.alt || ''} style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 12, background: 'var(--bg-secondary)' }} />
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {image.isMain && <span className="status-badge status-success">Main</span>}
                    {image.type && <span className="status-badge">{image.type}</span>}
                    <span className="status-badge">#{image.position ?? 0}</span>
                  </div>
                  <div><strong>{t('admin.descImages.alt')}:</strong> {image.alt || '—'}</div>
                  <div><strong>{t('admin.descImages.caption')}:</strong> {asCaptionInput(image.caption) || '—'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="admin-btn-edit" type="button" onClick={() => handleEdit(image)} title={t('common.edit')}>
                    <EditIcon size={18} />
                  </button>
                  <button className="admin-btn-delete" type="button" onClick={() => handleDelete(image)} title={t('common.delete')}>
                    <DeleteIcon size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingImage && (
        <div className="admin-form-modal">
          <div className="admin-form-content" style={{ maxWidth: 720 }}>
            <div className="admin-form-header">
              <h2>{t('admin.descImages.editTitle')}</h2>
              <button type="button" onClick={() => setEditingImage(null)} className="admin-form-close-btn" aria-label="Fermer">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="admin-form">
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>{t('admin.descImages.alt')}</label>
                  <input className="admin-form-input" type="text" value={editForm.alt} onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('admin.descImages.type')}</label>
                  <select className="admin-form-input" value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as DescImgProdType })}>
                    <option value="hero">hero</option>
                    <option value="lifestyle">lifestyle</option>
                    <option value="infographic">infographic</option>
                    <option value="spec">spec</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('admin.descImages.position')}</label>
                  <input className="admin-form-input" type="number" value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" checked={editForm.isMain} onChange={(e) => setEditForm({ ...editForm, isMain: e.target.checked })} />
                    <span>{t('admin.descImages.main')}</span>
                  </label>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>{t('admin.descImages.caption')}</label>
                  <textarea className="admin-form-textarea" rows={4} value={editForm.caption} onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })} />
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn-primary" disabled={submitting}>{submitting ? t('common.loading') : t('common.save')}</button>
                <button type="button" className="admin-btn-secondary" onClick={() => setEditingImage(null)}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
