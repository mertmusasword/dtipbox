import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { useLanguage } from '../i18n';
import {
  Star,
  MessageSquareHeart,
  Users,
  Calendar,
  Filter,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  employee: {
    id: string;
    name: string;
    position: string | null;
    avatar: string | null;
  } | null;
}

interface StaffStat {
  employeeId: string;
  name: string;
  position: string | null;
  reviewCount: number;
  averageRating: number;
}

interface FeedbackData {
  metrics: {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
    filteredTotal: number;
    staffStats: StaffStat[];
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  items: FeedbackItem[];
}

export const CustomerFeedbacks: React.FC = () => {
  const { t, formatTime, language } = useLanguage();
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const fetchFeedbacks = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: Record<string, any> = {
      page,
      limit: 10,
    };
    if (selectedRating) params.rating = selectedRating;
    if (selectedStaff) params.employeeId = selectedStaff;

    api
      .get('/business/feedbacks', { params })
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.error || t('common.error')))
      .finally(() => setLoading(false));
  }, [page, selectedRating, selectedStaff, t]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const metrics = data?.metrics;
  const items = data?.items || [];
  const distribution = metrics?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalReviews = metrics?.totalReviews || 0;

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MessageSquareHeart size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {t('feedback.title')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {t('feedback.subtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchFeedbacks()}
          disabled={loading}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
          title={t('common.retry')}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>{t('common.retry')}</span>
        </button>
      </div>

      {/* Metrics & Distribution Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* Card 1: Score & Total */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('feedback.averageRating')}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2.75rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
              {metrics?.averageRating ? metrics.averageRating.toFixed(1) : '0.0'}
            </span>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ 5.0</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map((s) => {
              const full = (metrics?.averageRating || 0) >= s;
              const half = (metrics?.averageRating || 0) >= s - 0.5 && !full;
              return (
                <Star
                  key={s}
                  size={18}
                  style={{
                    color: full || half ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
                    fill: full ? '#f59e0b' : half ? 'url(#half-star)' : 'transparent',
                  }}
                />
              );
            })}
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <strong>{totalReviews}</strong> {t('feedback.totalReviews')}
          </div>
        </div>

        {/* Card 2: Rating Distribution Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
            {t('feedback.starDistribution')}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars] || 0;
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
                  <span style={{ width: '42px', display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-secondary)' }}>
                    {stars} <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                  </span>
                  <div style={{
                    flex: 1,
                    height: '8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      borderRadius: '4px',
                      background: stars >= 4 ? '#10b981' : stars === 3 ? '#f59e0b' : '#ef4444',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <span style={{ width: '38px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    %{percentage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Top Staff Breakdown */}
        {metrics?.staffStats && metrics.staffStats.length > 0 && (
          <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '220px', overflowY: 'auto' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
              {t('feedback.staffPerformance')}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {metrics.staffStats.map((st) => (
                <div key={st.employeeId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {st.name[0] || 'E'}
                    </div>
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {st.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700, color: '#f59e0b' }}>
                      ⭐ {st.averageRating ? st.averageRating.toFixed(1) : '-'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      ({st.reviewCount})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Filter size={16} />
          <span>{t('common.filter')}:</span>
        </div>

        {/* Rating Filter */}
        <select
          value={selectedRating}
          onChange={(e) => {
            setSelectedRating(e.target.value);
            setPage(1);
          }}
          className="form-select"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}
        >
          <option value="">{t('feedback.allRatings')}</option>
          <option value="5">⭐⭐⭐⭐⭐ {t('feedback.stars5')}</option>
          <option value="4">⭐⭐⭐⭐ {t('feedback.stars4')}</option>
          <option value="3">⭐⭐⭐ {t('feedback.stars3')}</option>
          <option value="2">⭐⭐ {t('feedback.stars2')}</option>
          <option value="1">⭐ {t('feedback.stars1')}</option>
        </select>

        {/* Staff Filter */}
        {metrics?.staffStats && metrics.staffStats.length > 0 && (
          <select
            value={selectedStaff}
            onChange={(e) => {
              setSelectedStaff(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}
          >
            <option value="">{t('feedback.allStaff')}</option>
            <option value="pool">{t('feedback.generalPool')}</option>
            {metrics.staffStats.map((st) => (
              <option key={st.employeeId} value={st.employeeId}>
                {st.name} {st.position ? `(${st.position})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Sparkles className="animate-spin" size={28} style={{ color: 'var(--accent-primary)', margin: '0 auto 0.75rem' }} />
          <div>{t('common.loading')}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <MessageSquareHeart size={42} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            {t('feedback.noReviewsYet')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            {t('feedback.subtitle')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                borderLeft: `4px solid ${item.rating >= 4 ? '#10b981' : item.rating === 3 ? '#f59e0b' : '#ef4444'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                {/* Stars and Staff Tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        style={{
                          color: s <= item.rating ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
                          fill: s <= item.rating ? '#f59e0b' : 'transparent',
                        }}
                      />
                    ))}
                  </div>

                  {item.employee ? (
                    <span className="badge badge-neutral" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={12} />
                      {item.employee.name} {item.employee.position ? `• ${item.employee.position}` : ''}
                    </span>
                  ) : (
                    <span className="badge badge-neutral" style={{ fontSize: '0.78rem' }}>
                      {t('feedback.generalPool')}
                    </span>
                  )}
                </div>

                {/* Timestamp */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} />
                  {formatTime(item.createdAt)}
                </div>
              </div>

              {/* Comment text (if any) */}
              {item.comment ? (
                <p style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                  "{item.comment}"
                </p>
              ) : (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {language === 'tr' ? 'Yorum bırakılmadı (yalnızca yıldız puanı).' : 'No written comment (rating only).'}
                </span>
              )}
            </div>
          ))}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {page} / {data.pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page >= data.pagination.totalPages}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
