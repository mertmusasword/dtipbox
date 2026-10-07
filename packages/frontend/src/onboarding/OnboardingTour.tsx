import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { useOnboardingText, OnboardingKey } from '../i18n/onboardingLocales';
import { useOnboarding } from './OnboardingContext';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8;

const roundedRect = (r: Rect, rad: number) => {
  const { left: x, top: y, width: w, height: h } = r;
  return `M${x + rad} ${y}H${x + w - rad}A${rad} ${rad} 0 0 1 ${x + w} ${y + rad}V${y + h - rad}A${rad} ${rad} 0 0 1 ${x + w - rad} ${y + h}H${x + rad}A${rad} ${rad} 0 0 1 ${x} ${y + h - rad}V${y + rad}A${rad} ${rad} 0 0 1 ${x + rad} ${y}Z`;
};

export const OnboardingTour: React.FC = () => {
  const ob = useOnboarding();
  const o = useOnboardingText();
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [rect, setRect] = useState<Rect | null>(null);
  const [navRect, setNavRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [stepDone, setStepDone] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tipH, setTipH] = useState(180);

  const step = ob ? ob.tourSteps[ob.tourIndex] : undefined;
  const stepId = step?.id;

  // Navigate to the route this step lives on.
  useEffect(() => {
    if (step && location.pathname !== step.route) navigate(step.route);
    setStepDone(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  // Track viewport size.
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Locate + track target element (re-measured on an interval to follow scroll/layout).
  useEffect(() => {
    if (!step || !step.target || location.pathname !== step.route) {
      setRect(null);
      return;
    }
    let scrolled = false;
    const sel = `[data-tour="${step.target}"]`;
    const measure = () => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      if (!scrolled) {
        scrolled = true;
        el.scrollIntoView({ block: window.innerWidth <= 768 ? 'start' : 'center', behavior: 'smooth' });
      }
      const r = el.getBoundingClientRect();
      setRect((prev) =>
        prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height
          ? prev
          : { top: r.top, left: r.left, width: r.width, height: r.height }
      );
    };
    measure();
    const t = window.setInterval(measure, 200);
    return () => window.clearInterval(t);
  }, [stepId, location.pathname, step]);

  // Highlight the matching sidebar menu item so the user knows which page they are on.
  useEffect(() => {
    if (!step) return;
    const measureNav = () => {
      const el = document.querySelector(`.sidebar a[href="${step.route}"]`) as HTMLElement | null;
      if (!el) return setNavRect(null);
      const r = el.getBoundingClientRect();
      const visible = r.width > 0 && r.right > 0 && r.left < window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight;
      setNavRect(
        visible
          ? { top: r.top - 2, left: r.left - 2, width: r.width + 4, height: r.height + 4 }
          : null
      );
    };
    measureNav();
    const t = window.setInterval(measureNav, 300);
    return () => window.clearInterval(t);
  }, [stepId, step]);

  // Poll real status while on an action step; auto-advance when completed.
  const stepKey = step?.stepKey;
  const refresh = ob?.refresh;
  const isPending = ob?.isPending;
  const nextStep = ob?.nextStep;
  useEffect(() => {
    if (!stepKey || !refresh) return;
    const t = window.setInterval(() => refresh(), 3000);
    return () => window.clearInterval(t);
  }, [stepKey, refresh]);

  const pendingNow = stepKey && isPending ? isPending(stepKey) : true;
  useEffect(() => {
    if (!stepKey || pendingNow || !nextStep) return;
    setStepDone(true);
    const t = window.setTimeout(() => nextStep(), 1100);
    return () => window.clearTimeout(t);
  }, [stepKey, pendingNow, nextStep]);

  // Measure tooltip height for placement.
  useEffect(() => {
    if (tooltipRef.current) setTipH(tooltipRef.current.offsetHeight);
  });

  // Escape closes the tour.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && ob?.stopTour();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ob]);

  if (!ob || !step) return null;

  const isLast = ob.tourIndex === ob.tourSteps.length - 1;
  const isFirst = ob.tourIndex === 0;
  const isAction = !!step.stepKey;

  // Tooltip placement (desktop only; mobile uses a bottom sheet via CSS).
  let tipStyle: React.CSSProperties = {};
  if (!isMobile) {
    const W = 360;
    if (rect) {
      const below = rect.top + rect.height + PAD + 14 + tipH < window.innerHeight;
      const top = below ? rect.top + rect.height + PAD + 14 : Math.max(12, rect.top - PAD - 14 - tipH);
      let left = rect.left + rect.width / 2 - W / 2;
      left = Math.min(Math.max(12, left), window.innerWidth - W - 12);
      tipStyle = { top, left, width: W };
    } else {
      tipStyle = { top: '50%', left: '50%', width: W, transform: 'translate(-50%, -50%)' };
    }
  }

  const title = o(step.titleKey as OnboardingKey);
  const body = o(step.bodyKey as OnboardingKey);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const holes: string[] = [];
  if (rect) holes.push(roundedRect({ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }, 14));
  if (navRect) holes.push(roundedRect(navRect, 10));
  const dimStyle: React.CSSProperties = holes.length
    ? { clipPath: `path(evenodd, 'M0 0H${vw}V${vh}H0Z${holes.join('')}')` }
    : {};

  return (
    <div className="onb-tour-root" dir={dir} role="dialog" aria-live="polite">
      <div className="onb-dim" style={dimStyle} />
      {rect && (
        <div
          className="onb-spot"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
        />
      )}
      {navRect && (
        <div
          className="onb-spot onb-spot-nav"
          style={{ top: navRect.top, left: navRect.left, width: navRect.width, height: navRect.height }}
        />
      )}
      <div ref={tooltipRef} className={`onb-tip ${isMobile ? 'onb-tip-sheet' : ''}`} style={tipStyle}>
        <div className="onb-tip-top">
          <span className="onb-tip-count">{o('tourStepOf', { n: ob.tourIndex + 1, total: ob.tourSteps.length })}</span>
          <button type="button" className="onb-tip-skip" onClick={ob.stopTour}>
            {o('tourSkip')}
          </button>
        </div>
        <div className="onb-tip-title">{title}</div>
        <div className="onb-tip-body">{body}</div>
        {isAction && (
          <div className={`onb-tip-hint ${stepDone ? 'done' : ''}`}>{stepDone ? o('tourDoneHint') : o('tourAutoHint')}</div>
        )}
        <div className="onb-tip-actions">
          {step.id === 'test' && !stepDone && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={ob.markTested}>
              {o('testedBtn')}
            </button>
          )}
          <span style={{ flex: 1 }} />
          {!isFirst && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={ob.prevStep}>
              {o('tourBack')}
            </button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={ob.nextStep}>
            {isLast ? o('tourFinish') : o('tourNext')}
          </button>
        </div>
      </div>
    </div>
  );
};
