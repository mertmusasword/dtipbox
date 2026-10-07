import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { useOnboardingText, OnboardingKey } from '../i18n/onboardingLocales';
import { useOnboarding, StepKey } from './OnboardingContext';

const STEP_META: Record<StepKey, { route: string; t: OnboardingKey; d: OnboardingKey; c: OnboardingKey; icon: string }> = {
  agreement: { route: '/business/dashboard', t: 'stepAgreementTitle', d: 'stepAgreementDesc', c: 'stepAgreementCta', icon: '📜' },
  profile: { route: '/business/profile', t: 'stepProfileTitle', d: 'stepProfileDesc', c: 'stepProfileCta', icon: '🖼️' },
  payment: { route: '/business/payment-settings', t: 'stepPaymentTitle', d: 'stepPaymentDesc', c: 'stepPaymentCta', icon: '💳' },
  qr: { route: '/business/qr', t: 'stepQrTitle', d: 'stepQrDesc', c: 'stepQrCta', icon: '🔳' },
  staff: { route: '/business/employees', t: 'stepStaffTitle', d: 'stepStaffDesc', c: 'stepStaffCta', icon: '👥' },
  test: { route: '/business/qr', t: 'stepTestTitle', d: 'stepTestDesc', c: 'stepTestCta', icon: '📱' },
};

/** Persistent setup checklist card shown on the business dashboard. */
export const SetupChecklist: React.FC = () => {
  const ob = useOnboarding();
  const o = useOnboardingText();
  const { dir } = useLanguage();
  if (!ob || !ob.loaded || ob.allDone) return null;

  if (ob.checklistHidden) {
    return (
      <div style={{ marginBottom: '1rem' }} dir={dir}>
        <button type="button" className="onb-link-btn" onClick={() => ob.setChecklistHidden(false)}>
          ✨ {o('showGuide')} ({ob.doneCount}/{ob.total})
        </button>
      </div>
    );
  }

  const pct = Math.round((ob.doneCount / ob.total) * 100);

  return (
    <div className="glass-card onb-card" data-tour="setup-card" dir={dir}>
      <div className="onb-card-head">
        <div>
          <h3 className="onb-card-title">✨ {o('setupTitle')}</h3>
          <div className="onb-card-progress-text">{o('setupProgress', { done: ob.doneCount, total: ob.total })}</div>
        </div>
        <div className="onb-card-head-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={ob.startTour}>
            ▶ {ob.doneCount === 0 ? o('startTour') : o('restartTour')}
          </button>
          <button type="button" className="onb-link-btn" onClick={() => ob.setChecklistHidden(true)}>
            {o('hideGuide')}
          </button>
        </div>
      </div>
      <div className="onb-bar" aria-hidden="true">
        <div className="onb-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {ob.requiredDone && (
        <div className="onb-ready">
          <strong>{o('readyTitle')}</strong>
          <div>{o('readyDesc')}</div>
        </div>
      )}

      <ul className="onb-steps">
        {ob.steps.map((s) => {
          const m = STEP_META[s.key];
          return (
            <li key={s.key} className={`onb-step ${s.done ? 'done' : ''}`}>
              <span className="onb-step-check">{s.done ? '✓' : m.icon}</span>
              <div className="onb-step-text">
                <div className="onb-step-title">
                  {o(m.t)}
                  {!s.done && (
                    <span className={`onb-badge ${s.required ? 'req' : 'opt'}`}>{s.required ? o('requiredBadge') : o('optionalBadge')}</span>
                  )}
                </div>
                {!s.done && <div className="onb-step-desc">{o(m.d)}</div>}
              </div>
              {!s.done && (
                <Link to={m.route} className="btn btn-secondary btn-sm onb-step-cta">
                  {o(m.c)}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
