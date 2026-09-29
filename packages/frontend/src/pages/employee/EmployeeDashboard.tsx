import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { EmployeeAnalytics } from '../../types';
import { MetricCard } from '../../components/MetricCard';
import { DollarSign, TrendingUp, Calendar, Layers, Sparkles, MessageSquareHeart, Star, Split, CheckCircle2, Award, Volume2, VolumeX, Bell } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { usePageTitle } from '../../hooks/usePageTitle';

export const EmployeeDashboard: React.FC = () => {
  const { t, formatTime, formatCurrency } = useLanguage();
  usePageTitle(t('nav.myTipsStats'));
  const [data, setData] = useState<{ profile: any; stats: EmployeeAnalytics; feedbacks?: any; poolShares?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('waiter_sound_enabled') !== 'false';
  });
  const prevTipsRef = React.useRef<number | null>(null);

  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Pleasant high-pitched cash register chime (E6 -> G#6 -> B6)
      playTone(1318.51, 0, 0.25);
      playTone(1661.22, 0.12, 0.35);
      playTone(1975.53, 0.24, 0.5);
    } catch (e) {
      console.warn('Audio chime could not play:', e);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('waiter_sound_enabled', String(next));
    if (next) {
      playChimeSound();
    }
  };

  useEffect(() => {
    const fetchDashboard = (isInterval = false) => {
      api
        .get('/employee/dashboard')
        .then((res) => {
          const newData = res.data.data;
          const currentTotal = Number(newData?.stats?.todayTips || 0);
          if (isInterval && soundEnabled && prevTipsRef.current !== null && currentTotal > prevTipsRef.current) {
            playChimeSound();
          }
          prevTipsRef.current = currentTotal;
          setData(newData);
        })
        .catch((err) => console.error('Failed to load employee dashboard:', err))
        .finally(() => {
          if (!isInterval) setLoading(false);
        });
    };

    fetchDashboard(false);
    const timer = setInterval(() => fetchDashboard(true), 25000);
    return () => clearInterval(timer);
  }, [soundEnabled]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div style={{ color: 'var(--text-secondary)' }}>{t('employeeDashboard.loading')}</div>
      </div>
    );
  }

  const profile = data?.profile;
  const stats = data?.stats;
  const poolShares = data?.poolShares || [];
  const currency = profile?.business?.currency || 'TRY';
  const distributionMode = profile?.business?.tip_distribution_mode || 'INDIVIDUAL';

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        {profile?.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.first_name}
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem',
          }}>
            {profile?.first_name ? profile.first_name[0] : 'S'}
          </div>
        )}
        <div>
          <h1 className="page-title" style={{ fontSize: '1.65rem' }}>
            {t('employeeDashboard.greeting', { name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() })}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {profile?.position || profile?.role_title || t('employeeDashboard.defaultPosition')} • {profile?.business?.name}
            </span>
            {distributionMode === 'POINT_POOL' && (
              <span className="badge badge-accent" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {t('employeeDashboard.poolShareBadge', { weight: Number(profile?.share_weight || 1.0).toFixed(2) })}
              </span>
            )}
            {distributionMode === 'EQUAL_POOL' && (
              <span className="badge badge-accent" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {t('employeeDashboard.equalPoolParticipant')}
              </span>
            )}
            {distributionMode === 'INDIVIDUAL' && (
              <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                {t('employeeDashboard.individualTip')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live Today's Earnings & Sound Alert Hero Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}>
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ CANLI KAZANÇ DURUMU
              </span>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginTop: '2px' }}>
              {formatCurrency(stats?.todayTips || 0, currency)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Bugün kazanılan bahşiş toplamı
            </div>
          </div>
        </div>

        {/* Audio Notification Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={toggleSound}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              borderRadius: '10px',
              borderColor: soundEnabled ? 'rgba(16, 185, 129, 0.4)' : undefined,
              color: soundEnabled ? '#10b981' : 'var(--text-secondary)',
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Sesli Bildirim Açık' : 'Sesli Bildirim Kapalı'}</span>
          </button>
          <button
            type="button"
            onClick={playChimeSound}
            className="btn btn-secondary"
            title="Bahşiş bildirim sesini dinle"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              fontSize: '0.85rem',
              borderRadius: '10px',
            }}
          >
            <Bell size={15} />
            <span>Zili Test Et</span>
          </button>
        </div>
      </div>

      {/* Loyalty Stamp Action Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
              {t('employeeDashboard.loyaltyBannerTitle')}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {t('employeeDashboard.loyaltyBannerSubtitle')}
            </div>
          </div>
        </div>
        <Link
          to="/employee/loyalty"
          className="btn btn-primary"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 600 }}
        >
          <Award size={16} />
          <span>{t('employeeDashboard.openStampScreen')}</span>
        </Link>
      </div>

      {/* Personal Tips Performance */}
      <div className="metrics-grid">
        <MetricCard
          label={t('employeeDashboard.todaysTips')}
          value={formatCurrency(stats?.todayTips || 0, currency)}
          icon={<DollarSign size={24} />}
          subtitle={t('employeeDashboard.todaysTipsSubtitle')}
        />
        <MetricCard
          label={t('employeeDashboard.weeklyTips')}
          value={formatCurrency(stats?.weeklyTips || 0, currency)}
          icon={<TrendingUp size={24} />}
          subtitle={t('employeeDashboard.weeklyTipsSubtitle')}
        />
        <MetricCard
          label={t('employeeDashboard.monthlyTips')}
          value={formatCurrency(stats?.monthlyTips || 0, currency)}
          icon={<Calendar size={24} />}
          subtitle={t('employeeDashboard.monthlyTipsSubtitle')}
        />
        <MetricCard
          label={t('employeeDashboard.careerTips')}
          value={formatCurrency(stats?.totalTips || 0, currency)}
          icon={<Layers size={24} />}
          subtitle={t('employeeDashboard.careerTipsSubtitle', {
            count: stats?.tipCount || 0,
            avg: formatCurrency(stats?.averageTip || 0, currency),
          })}
        />
        <MetricCard
          label={t('feedback.customerSatisfaction')}
          value={data?.feedbacks?.metrics?.averageRating ? `⭐ ${data.feedbacks.metrics.averageRating.toFixed(1)} / 5.0` : '⭐ 5.0 / 5.0'}
          icon={<Star size={24} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
          subtitle={`${data?.feedbacks?.metrics?.totalReviews || 0} ${t('feedback.staffRatingReviews')}`}
        />
      </div>

      {/* Pool Settlements Received (if pool active or shares exist) */}
      {(distributionMode !== 'INDIVIDUAL' || poolShares.length > 0) && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Split size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  {t('employeeDashboard.poolSettlementsTitle')}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  {t('employeeDashboard.poolSettlementsSubtitle')}
                </p>
              </div>
            </div>
          </div>

          {poolShares.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {poolShares.map((share: any) => (
                <div
                  key={share.id}
                  style={{
                    background: 'var(--bg-input)',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    borderLeft: '3px solid var(--primary)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#4ade80' }}>
                        {formatCurrency(share.netShare, currency)}
                      </span>
                      <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                        🎯 {t('employeeDashboard.poolShare', { weight: Number(share.shareWeight).toFixed(2) })}
                      </span>
                      {share.isPaid ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          ✓ {t('employeeDashboard.paid')}
                        </span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.7rem',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                          }}
                        >
                          ⏳ {t('employeeDashboard.pendingPayment')}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t('employeeDashboard.grossPoolShare')}: {formatCurrency(share.grossShare, currency)} • {t('employeeDashboard.deductions')}: -{formatCurrency(Number((share.grossShare - share.netShare).toFixed(2)), currency)}
                      {(Number(share.cashShare) > 0 || Number(share.digitalShare) > 0) && (
                        <span>
                          {' • '}{t('employeeDashboard.cash')}: {formatCurrency(share.cashShare || 0, currency)} • {t('employeeDashboard.digital')}: {formatCurrency(share.digitalShare || 0, currency)}
                        </span>
                      )}
                    </div>
                    {share.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        "{share.notes}"
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(share.date).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {t('employeeDashboard.noPoolSettlements')}
            </div>
          )}
        </div>
      )}

      {/* Recent Tips Directed to this Employee */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('employeeDashboard.directTipsTitle')}</h2>
        </div>

        {stats?.recentTips && stats.recentTips.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentTips.map((tip) => (
              <div
                key={tip.id}
                style={{
                  background: 'var(--bg-input)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {formatCurrency(Number(tip.amount), tip.currency || currency)}
                    </span>
                    {tip.customer_name && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {t('employeeDashboard.fromCustomer', { name: tip.customer_name })}
                      </span>
                    )}
                  </div>
                  {tip.customer_message && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.25rem',
                    }}>
                      <MessageSquareHeart size={14} style={{ color: '#ec4899' }} />
                      "{tip.customer_message}"
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatTime(tip.created_at)}
                  </div>
                  <span className="badge badge-success" style={{ marginTop: '0.2rem' }}>
                    {t('employeeDashboard.received')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            {t('employeeDashboard.noDirectTips')}
          </div>
        )}
      </div>

      {/* Customer Reviews & Feedback for this Employee */}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <Star size={20} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {t('feedback.title')}
          </h2>
        </div>

        {data?.feedbacks?.items && data.feedbacks.items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.feedbacks.items.map((fb: any) => (
              <div
                key={fb.id}
                style={{
                  background: 'var(--bg-input)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  borderLeft: `3px solid ${fb.rating >= 4 ? '#10b981' : fb.rating === 3 ? '#f59e0b' : '#ef4444'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((s: number) => (
                      <Star
                        key={s}
                        size={15}
                        style={{
                          color: s <= fb.rating ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
                          fill: s <= fb.rating ? '#f59e0b' : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatTime(fb.createdAt || fb.created_at)}
                  </span>
                </div>

                {fb.comment ? (
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    "{fb.comment}"
                  </p>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {t('employeeDashboard.noWrittenComment')}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            {t('feedback.noReviewsYet')}
          </div>
        )}
      </div>
    </div>
  );
};
