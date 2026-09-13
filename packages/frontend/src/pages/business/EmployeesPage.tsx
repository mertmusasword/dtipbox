import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../../api/client';
import { Employee } from '../../types';
import { Modal } from '../../components/Modal';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { useLanguage } from '../../i18n';
import { Plus, Trash2, Edit2, UserCheck, UserX, Users, Upload, Camera } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { showToast } = useToast();
  const { t, formatNumber } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    position: '',
    role_title: 'Garson',
    share_weight: 1.0,
    avatar: '',
    email: '',
    password: '',
  });

  const handleImageUpload = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast('Lütfen JPG, PNG veya WebP formatında bir görsel seçin.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Görsel boyutu en fazla 5 MB olabilir.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Optimal center crop and resize to 400x400
        const canvas = document.createElement('canvas');
        const size = 400;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

        const optimized = canvas.toDataURL('image/jpeg', 0.85);
        setFormData((prev) => ({ ...prev, avatar: optimized }));
        showToast('Fotoğraf başarıyla yüklendi ve uyarlandı');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const loadEmployees = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/business/employees')
      .then((res) => setEmployees(res.data.data))
      .catch(() => setError('Failed to load employees'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setUseUrlInput(false);
    setFormData({
      first_name: '',
      last_name: '',
      position: '',
      role_title: 'Garson',
      share_weight: 1.0,
      avatar: '',
      email: '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setUseUrlInput(false);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      position: emp.position || '',
      role_title: emp.role_title || 'Garson',
      share_weight: emp.share_weight !== undefined && emp.share_weight !== null ? Number(emp.share_weight) : 1.0,
      avatar: emp.avatar || '',
      email: emp.user?.email || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/business/employees/${editingEmployee.id}`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          position: formData.position || undefined,
          role_title: formData.role_title || undefined,
          share_weight: Number(formData.share_weight) || 1.0,
          avatar: formData.avatar || undefined,
          email: formData.email || undefined,
          password: formData.password || undefined,
        });
        showToast(`${formData.first_name} ${formData.last_name} güncellendi`);
      } else {
        await api.post('/business/employees', {
          ...formData,
          position: formData.position || undefined,
          role_title: formData.role_title || undefined,
          share_weight: Number(formData.share_weight) || 1.0,
          avatar: formData.avatar || undefined,
          email: formData.email || undefined,
          password: formData.password || undefined,
        });
        showToast(`${formData.first_name} ${formData.last_name} ekibe eklendi`);
      }
      setIsModalOpen(false);
      loadEmployees();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'İşlem başarısız oldu', 'error');
    }
  };

  const toggleStatus = async (emp: Employee) => {
    try {
      await api.put(`/business/employees/${emp.id}`, { is_active: !emp.is_active });
      showToast(`${emp.first_name} ${emp.is_active ? 'deactivated' : 'activated'}`);
      loadEmployees();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to remove ${emp.first_name} ${emp.last_name}?`)) return;
    try {
      await api.delete(`/business/employees/${emp.id}`);
      showToast(`${emp.first_name} ${emp.last_name} removed`);
      loadEmployees();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete employee', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('business.staffTitle')}</h1>
          <p className="page-subtitle mb-0">
            {t('business.staffSubtitle')}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> {t('business.addStaffBtn')}
          </button>
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <LoadingState compact message={t('common.loading')} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadEmployees} />
        ) : employees.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title={t('business.staffTitle')}
            description={t('business.staffSubtitle')}
            action={
              <button className="btn btn-primary" onClick={openCreateModal}>
                <Plus size={16} /> {t('business.addStaffBtn')}
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('common.name')}</th>
                  <th>Görev & Havuz Payı</th>
                  <th>{t('common.status')}</th>
                  <th>{t('nav.payments')}</th>
                  <th className="text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className={`avatar ${emp.avatar ? '' : 'avatar-placeholder'}`}>
                          {emp.avatar ? (
                            <img src={emp.avatar} alt={emp.first_name} />
                          ) : (
                            emp.first_name[0]
                          )}
                        </div>
                        <div>
                          <div className="font-bold">{emp.first_name} {emp.last_name}</div>
                          {emp.user?.email && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ fontWeight: 600 }}>{emp.position || emp.role_title || '—'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                          {emp.role_title && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              {emp.role_title}
                            </span>
                          )}
                          <span className="badge badge-accent" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', fontWeight: 600 }}>
                            🎯 {Number(emp.share_weight || 1.0).toFixed(2)}x Pay
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${emp.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {emp.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="font-bold">{formatNumber(emp._count?.tips || 0)}</td>
                    <td className="text-right">
                      <div className="inline-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleStatus(emp)}
                          title={emp.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {emp.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(emp)} title={t('common.edit')}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp)} title={t('common.delete')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? `${t('common.edit')}: ${editingEmployee.first_name} ${editingEmployee.last_name}` : t('business.addStaffBtn')}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid form-grid-2">
            <div className="form-group mb-0">
              <label className="form-label">{t('business.firstName')}</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">{t('business.lastName')}</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">{t('business.position')}</label>
            <input
              type="text"
              placeholder="Örn: Kıdemli Garson, Şef Barmen, Barista..."
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="form-input"
            />
          </div>

          {/* Bahşiş Havuz Payı Seçici (Slider & Adım Seçici) */}
          <div
            style={{
              background: 'var(--bg-input)',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div>
                <label className="form-label mb-0" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Bahşiş Havuz Payı
                </label>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Havuzlu dağıtımda personelin alacağı pay oranı
                </div>
              </div>
              <span
                className="badge badge-accent"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.75rem',
                  fontWeight: 700,
                  background: Number(formData.share_weight) === 1.0
                    ? 'rgba(34, 197, 94, 0.15)'
                    : Number(formData.share_weight) === 0.75
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                  color: Number(formData.share_weight) === 1.0
                    ? '#4ade80'
                    : Number(formData.share_weight) === 0.75
                    ? '#818cf8'
                    : '#fbbf24',
                  borderColor: Number(formData.share_weight) === 1.0
                    ? 'rgba(34, 197, 94, 0.3)'
                    : Number(formData.share_weight) === 0.75
                    ? 'rgba(99, 102, 241, 0.3)'
                    : 'rgba(245, 158, 11, 0.3)',
                }}
              >
                {Number(formData.share_weight) === 1.0 && '🎯 Tam Pay (1.0x)'}
                {Number(formData.share_weight) === 0.75 && '🎯 3/4 Pay (0.75x)'}
                {Number(formData.share_weight) === 0.5 && '🎯 Yarım Pay (0.50x)'}
                {![1.0, 0.75, 0.5].includes(Number(formData.share_weight)) && `🎯 Özel Pay (${Number(formData.share_weight).toFixed(2)}x)`}
              </span>
            </div>

            {/* 3 Hızlı Adım Butonları */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              {[
                { label: 'Yarım Pay', sub: 'Komi, Bulaşık', weight: 0.5 },
                { label: 'Standart Pay', sub: 'Barmen, Mutfak', weight: 0.75 },
                { label: 'Tam Pay', sub: 'Garson, Servis', weight: 1.0 },
              ].map((step) => {
                const isSelected = Math.abs(Number(formData.share_weight) - step.weight) < 0.01;
                return (
                  <button
                    key={step.weight}
                    type="button"
                    onClick={() => setFormData({ ...formData, share_weight: step.weight })}
                    style={{
                      padding: '0.6rem 0.4rem',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', marginTop: '2px' }}>
                      %{step.weight * 100} • {step.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hassas Kaydırıcı (Slider) */}
            <div style={{ padding: '0.25rem 0.2rem' }}>
              <input
                type="range"
                min="0.25"
                max="1.50"
                step="0.05"
                value={formData.share_weight}
                onChange={(e) => setFormData({ ...formData, share_weight: parseFloat(e.target.value) || 1.0 })}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: 'var(--primary)',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.35rem',
                }}
              >
                <span>%25 (Destek)</span>
                <span>%50 (Yarım)</span>
                <span>%75 (Orta)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>%100 (Tam)</span>
                <span>%150 (Kıdemli)</span>
              </div>
            </div>
          </div>

          <div className="form-group mb-0">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label mb-0">{t('business.avatarUrl')}</label>
              <button
                type="button"
                onClick={() => setUseUrlInput(!useUrlInput)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                {useUrlInput ? '📁 Görsel Dosyası Yükle' : '🔗 URL ile Ekle'}
              </button>
            </div>

            {useUrlInput ? (
              <div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="form-input"
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Doğrudan web görsel bağlantısı (https://...) girebilirsiniz.
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                />

                {formData.avatar ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', justifyContent: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={formData.avatar}
                        alt="Önizleme"
                        style={{
                          width: '76px',
                          height: '76px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--accent-primary)',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                          display: 'block',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Camera size={13} /> Fotoğrafı Değiştir
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: '' })}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.75rem',
                          color: '#f87171',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Trash2 size={13} /> Fotoğrafı Kaldır
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: 'pointer', padding: '0.5rem 0' }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.6rem',
                      }}
                    >
                      <Upload size={24} />
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Fotoğraf Seç veya Sürükle</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Cihazınızdan görsel yüklemek için tıklayın
                    </div>
                  </div>
                )}

                {/* Öneri & Standart Kutusu */}
                <div
                  style={{
                    marginTop: '0.9rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    textAlign: 'left',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    📐 Önerilen Görsel Standartları:
                  </div>
                  <div>• <strong>Ölçü & Oran:</strong> 1:1 Kare format (ideal olarak en az <strong>400×400 px</strong>)</div>
                  <div>• <strong>Format & Boyut:</strong> JPG, PNG veya WebP (maksimum <strong>5 MB</strong>)</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                    * Yüklediğiniz görsel bahşiş ekranındaki personel kartlarına taşma yapmayacak şekilde otomatik olarak optimize edilir.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {t('common.details')}
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">{t('common.email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@business.com"
                className="form-input"
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">{t('auth.passwordLabel')}</label>
              <input
                type="password"
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingEmployee ? '••••••••' : '••••••••'}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {editingEmployee ? t('common.save') : t('common.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
