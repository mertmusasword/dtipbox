import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  ShieldCheck,
  FileText,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Search,
  ExternalLink,
  Clock,
  Send,
  Layers,
} from 'lucide-react';
import { Modal } from '../../components/Modal';

export const AdminAgreementsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'versions' | 'audit' | 'pending'>('versions');

  // Versions state
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);

  // New Version Modal state
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [newVersionData, setNewVersionData] = useState({
    version: '',
    title: 'Naponi İşletme Hizmet ve Kullanım Sözleşmesi',
    contentMarkdown: '',
    requiresReacceptance: true,
  });
  const [creatingVersion, setCreatingVersion] = useState(false);

  // Audit state
  const [auditItems, setAuditItems] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Pending businesses state
  const [pendingData, setPendingData] = useState<any>(null);
  const [loadingPending, setLoadingPending] = useState(false);

  // Proof Modal state
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    loadAgreements();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAudit(1);
    } else if (activeTab === 'pending') {
      loadPending();
    }
  }, [activeTab]);

  const loadAgreements = async () => {
    try {
      setLoadingVersions(true);
      const res = await api.get('/admin/agreements');
      if (res.data?.success) {
        setAgreements(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load agreements:', err);
    } finally {
      setLoadingVersions(false);
    }
  };

  const loadAudit = async (page: number = 1) => {
    try {
      setLoadingAudit(true);
      const res = await api.get(`/admin/agreements/audit?page=${page}&limit=20`);
      if (res.data?.success) {
        setAuditItems(res.data.data.items);
        setAuditTotal(res.data.data.total);
        setAuditPage(page);
      }
    } catch (err) {
      console.error('Failed to load acceptance audit:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const loadPending = async () => {
    try {
      setLoadingPending(true);
      const res = await api.get('/admin/agreements/pending');
      if (res.data?.success) {
        setPendingData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load pending businesses:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingVersion(true);
      const res = await api.post('/admin/agreements/versions', newVersionData);
      if (res.data?.success) {
        setShowNewVersionModal(false);
        setNewVersionData({
          version: '',
          title: 'Naponi İşletme Hizmet ve Kullanım Sözleşmesi',
          contentMarkdown: '',
          requiresReacceptance: true,
        });
        await loadAgreements();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Hata oluştu');
    } finally {
      setCreatingVersion(false);
    }
  };

  const handlePublishVersion = async (versionId: string, versionNumber: string) => {
    const ok = window.confirm(
      `"${versionNumber}" numaralı sözleşme versiyonunu yayına almak istediğinize emin misiniz? Yayınlandıktan sonra bu versiyon değiştirilemez (immutable) hale gelecektir.`
    );
    if (!ok) return;

    try {
      const res = await api.post(`/admin/agreements/versions/${versionId}/publish`);
      if (res.data?.success) {
        alert(`Versiyon ${versionNumber} başarıyla yayına alındı.`);
        await loadAgreements();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Yayına alınırken hata oluştu');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Hukuki Sözleşmeler & Dijital Onay</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            İşletme çerçeve hizmet sözleşmeleri, versiyonlama, HMK m. 193 elektronik ispat kayıtları ve SHA-256 denetim zinciri
          </p>
        </div>

        {activeTab === 'versions' && (
          <button
            onClick={() => setShowNewVersionModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> Yeni Versiyon Taslağı
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('versions')}
          className={`btn ${activeTab === 'versions' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Layers size={15} style={{ marginRight: '0.4rem' }} />
          Sözleşme Versiyonları
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <ShieldCheck size={15} style={{ marginRight: '0.4rem' }} />
          Dijital Kabul Kayıtları ({auditTotal})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Clock size={15} style={{ marginRight: '0.4rem' }} />
          Onay Bekleyen İşletmeler
        </button>
      </div>

      {/* TAB 1: VERSIONS */}
      {activeTab === 'versions' && (
        <div className="glass-card">
          {loadingVersions ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Sözleşmeler yükleniyor...
            </div>
          ) : agreements.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Henüz tanımlı sözleşme bulunamadı.
            </div>
          ) : (
            agreements.map((agreement) => (
              <div key={agreement.id} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                      {agreement.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Kod: {agreement.code} • Tür: {agreement.type}
                    </p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Versiyon</th>
                        <th>Başlık</th>
                        <th>Durum</th>
                        <th>Yürürlük Tarihi</th>
                        <th>SHA-256 İçerik Hash</th>
                        <th>Kabul Sayısı</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agreement.versions.map((v: any) => (
                        <tr key={v.id}>
                          <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                            v{v.version}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{v.title}</td>
                          <td>
                            <span
                              className={`badge ${
                                v.status === 'PUBLISHED'
                                  ? 'badge-success'
                                  : v.status === 'DRAFT'
                                  ? 'badge-warning'
                                  : 'badge-neutral'
                              }`}
                            >
                              {v.status === 'PUBLISHED' ? 'Yayında (Aktif)' : v.status === 'DRAFT' ? 'Taslak' : 'Arşiv'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {new Date(v.effective_date).toLocaleDateString('tr-TR')}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <code
                                style={{
                                  fontSize: '0.75rem',
                                  background: 'var(--bg-input)',
                                  padding: '0.2rem 0.4rem',
                                  borderRadius: '4px',
                                  maxWidth: '120px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={v.content_hash}
                              >
                                {v.content_hash}
                              </code>
                              <button
                                onClick={() => copyToClipboard(v.content_hash)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                title="Hash'i Kopyala"
                              >
                                {copiedHash === v.content_hash ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{v.acceptance_count} işletme</td>
                          <td>
                            {v.status === 'DRAFT' ? (
                              <button
                                onClick={() => handlePublishVersion(v.id, v.version)}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                              >
                                Yayına Al
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Değiştirilemez
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="glass-card">
          {loadingAudit ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Kayıtlar yükleniyor...
            </div>
          ) : auditItems.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Henüz dijital onay kaydı bulunamadı.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Onay Zamanı</th>
                      <th>İşletme</th>
                      <th>Onaylayan</th>
                      <th>Versiyon</th>
                      <th>IP Adresi</th>
                      <th>SHA-256 Hash</th>
                      <th>İspat Belgesi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditItems.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(item.accepted_at).toLocaleString('tr-TR')}
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {item.business?.name || '—'}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{item.user?.email}</td>
                        <td>
                          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                            v{item.version?.version}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          {item.ip_address}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <code
                              style={{
                                fontSize: '0.75rem',
                                background: 'var(--bg-input)',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '4px',
                                maxWidth: '100px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={item.content_hash}
                            >
                              {item.content_hash}
                            </code>
                            <button
                              onClick={() => copyToClipboard(item.content_hash)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                              {copiedHash === item.content_hash ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedProof(item)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            İspat Makbuzu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {auditTotal > 20 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    disabled={auditPage <= 1}
                    onClick={() => loadAudit(auditPage - 1)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Önceki
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', padding: '0 0.5rem' }}>
                    Sayfa {auditPage} / {Math.ceil(auditTotal / 20)}
                  </span>
                  <button
                    disabled={auditPage >= Math.ceil(auditTotal / 20)}
                    onClick={() => loadAudit(auditPage + 1)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 3: PENDING BUSINESSES */}
      {activeTab === 'pending' && (
        <div className="glass-card">
          {loadingPending ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Yükleniyor...
            </div>
          ) : !pendingData || pendingData.pendingCount === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Tüm işletmeler güncel sözleşmeyi onaylamıştır.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Onay bekleyen aktif işletme bulunmuyor.</p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem', padding: '0.8rem 1rem', background: 'var(--bg-input)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>Aktif Yayındaki Sözleşme:</span>{' '}
                <span>v{pendingData.activeVersion?.version} — {pendingData.activeVersion?.title}</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Toplam {pendingData.pendingCount} işletmenin henüz bu versiyon için dijital onayı bulunmamaktadır.
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>İşletme Adı</th>
                      <th>İletişim E-posta</th>
                      <th>Yetkili Kullanıcı</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingData.pendingBusinesses.map((biz: any) => (
                      <tr key={biz.id}>
                        <td style={{ fontWeight: 600 }}>{biz.name}</td>
                        <td style={{ fontSize: '0.85rem' }}>{biz.email}</td>
                        <td style={{ fontSize: '0.85rem' }}>{biz.owner_email}</td>
                        <td>
                          <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                            Onay Bekliyor
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE DRAFT VERSION */}
      <Modal
        isOpen={showNewVersionModal}
        onClose={() => setShowNewVersionModal(false)}
        title="Yeni Sözleşme Versiyonu Taslağı Oluştur"
      >
        <form onSubmit={handleCreateVersion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              Versiyon Numarası (örn. 1.1.0 veya 2.0.0)
            </label>
            <input
              type="text"
              required
              placeholder="1.1.0"
              value={newVersionData.version}
              onChange={(e) => setNewVersionData({ ...newVersionData, version: e.target.value })}
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              Başlık
            </label>
            <input
              type="text"
              required
              value={newVersionData.title}
              onChange={(e) => setNewVersionData({ ...newVersionData, title: e.target.value })}
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              Sözleşme Metni (Markdown Formatında)
            </label>
            <textarea
              required
              rows={12}
              value={newVersionData.contentMarkdown}
              onChange={(e) => setNewVersionData({ ...newVersionData, contentMarkdown: e.target.value })}
              className="form-input"
              placeholder="# NAPONİ İŞLETME HİZMET VE KULLANIM SÖZLEŞMESİ..."
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={newVersionData.requiresReacceptance}
              onChange={(e) => setNewVersionData({ ...newVersionData, requiresReacceptance: e.target.checked })}
            />
            <span>Mevcut işletmelerden yeniden onay talep edilsin</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowNewVersionModal(false)}
              className="btn btn-secondary"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={creatingVersion}
              className="btn btn-primary"
            >
              {creatingVersion ? 'Oluşturuluyor...' : 'Taslak Olarak Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PROOF RECEIPT */}
      <Modal
        isOpen={!!selectedProof}
        onClose={() => setSelectedProof(null)}
        title="Elektronik İspat ve Sözleşme Onay Makbuzu (HMK m. 193)"
      >
        {selectedProof && (
          <div style={{ fontSize: '0.85rem' }}>
            <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>İşletme Unvanı:</span>
                  <strong>{selectedProof.business?.name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Onaylayan E-posta:</span>
                  <strong>{selectedProof.user?.email}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Sözleşme Versiyonu:</span>
                  <strong>v{selectedProof.version?.version}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Onay Tarihi & Saati:</span>
                  <strong>{new Date(selectedProof.accepted_at).toLocaleString('tr-TR')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Kayıtlı IP Adresi:</span>
                  <code style={{ fontFamily: 'monospace' }}>{selectedProof.ip_address}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Yasal Dayanak:</span>
                  <span style={{ color: 'var(--color-primary)' }}>HMK m. 193 Delil Sözleşmesi</span>
                </div>
              </div>

              <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                  Kriptografik SHA-256 İçerik Özeti (Hash):
                </span>
                <code style={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', display: 'block', background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '4px' }}>
                  {selectedProof.content_hash}
                </code>
              </div>

              <div style={{ marginTop: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                  Onaylanan Beyan:
                </span>
                <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  "{selectedProof.statement}"
                </p>
              </div>

              <div style={{ marginTop: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                  User-Agent:
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedProof.user_agent}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedProof(null)}
                className="btn btn-primary"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
