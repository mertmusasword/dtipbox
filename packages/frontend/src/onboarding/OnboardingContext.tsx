import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { WelcomeModal } from './WelcomeModal';
import { OnboardingTour } from './OnboardingTour';

export type StepKey = 'agreement' | 'profile' | 'payment' | 'qr' | 'staff' | 'test';
export type VenueType = 'restaurant' | 'cafe' | 'hotel' | 'bar' | 'barber' | 'valet';

export interface OnboardingStep {
  key: StepKey;
  done: boolean;
  required: boolean;
}

export interface TourStepDef {
  id: string;
  route: string;
  target: string | null;
  stepKey: StepKey | null;
  titleKey: string;
  bodyKey: string;
}

export const TOUR_STEPS: TourStepDef[] = [
  { id: 'intro', route: '/business/dashboard', target: 'setup-card', stepKey: null, titleKey: 'tourIntroTitle', bodyKey: 'tourIntroBody' },
  { id: 'agreement', route: '/business/dashboard', target: 'agreement-alert', stepKey: 'agreement', titleKey: 'tourAgreementTitle', bodyKey: 'tourAgreementBody' },
  { id: 'profile', route: '/business/profile', target: 'profile-logo', stepKey: 'profile', titleKey: 'tourProfileTitle', bodyKey: 'tourProfileBody' },
  { id: 'payment', route: '/business/payment-settings', target: 'payment-iban', stepKey: 'payment', titleKey: 'tourPaymentTitle', bodyKey: 'tourPaymentBody' },
  { id: 'qr', route: '/business/qr', target: 'qr-create', stepKey: 'qr', titleKey: 'tourQrTitle', bodyKey: 'tourQrBody' },
  { id: 'staff', route: '/business/employees', target: 'employee-add', stepKey: 'staff', titleKey: 'tourStaffTitle', bodyKey: 'tourStaffBody' },
  { id: 'test', route: '/business/qr', target: null, stepKey: 'test', titleKey: 'tourTestTitle', bodyKey: 'tourTestBody' },
  { id: 'finish', route: '/business/dashboard', target: null, stepKey: null, titleKey: 'tourFinishTitle', bodyKey: 'tourFinishBody' },
];

interface OnboardingContextValue {
  loaded: boolean;
  steps: OnboardingStep[];
  doneCount: number;
  total: number;
  requiredDone: boolean;
  allDone: boolean;
  refresh: () => Promise<void>;
  isPending: (key: StepKey) => boolean;
  markTested: () => void;
  venue: VenueType | null;
  welcomeOpen: boolean;
  completeWelcome: (venue: VenueType | null, startTour: boolean) => void;
  tourActive: boolean;
  tourSteps: TourStepDef[];
  tourIndex: number;
  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  checklistHidden: boolean;
  setChecklistHidden: (v: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/** Returns null outside of the business panel (safe to call anywhere). */
export const useOnboarding = () => useContext(OnboardingContext);

const lsKey = (bid: string, name: string) => `naponi_onb_${name}_${bid}`;

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const bid = user?.business?.id || user?.id || 'x';

  const [raw, setRaw] = useState<OnboardingStep[] | null>(null);
  const [tested, setTested] = useState(() => localStorage.getItem(lsKey(bid, 'tested')) === '1');
  const [venue, setVenue] = useState<VenueType | null>(() => (localStorage.getItem(lsKey(bid, 'venue')) as VenueType) || null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourSteps, setTourSteps] = useState<TourStepDef[]>([]);
  const [tourIndex, setTourIndex] = useState(0);
  const [checklistHidden, setHiddenState] = useState(() => localStorage.getItem(lsKey(bid, 'hidden')) === '1');
  const welcomeChecked = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/business/onboarding-status');
      setRaw(res.data.data.steps as OnboardingStep[]);
    } catch {
      /* non-critical: onboarding must never break the panel */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, location.pathname]);

  const steps = useMemo<OnboardingStep[]>(
    () => (raw || []).map((s) => (s.key === 'test' && tested ? { ...s, done: true } : s)),
    [raw, tested]
  );
  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length;
  const requiredDone = steps.filter((s) => s.required).every((s) => s.done);
  const allDone = total > 0 && doneCount === total;
  const isPending = useCallback((key: StepKey) => steps.some((s) => s.key === key && !s.done), [steps]);

  // Welcome modal: once per business, skipped when setup is already complete.
  useEffect(() => {
    if (raw === null || welcomeChecked.current) return;
    welcomeChecked.current = true;
    const seen = localStorage.getItem(lsKey(bid, 'welcome')) === '1';
    if (!seen && !allDone) setWelcomeOpen(true);
  }, [raw, allDone, bid]);

  const markTested = useCallback(() => {
    localStorage.setItem(lsKey(bid, 'tested'), '1');
    setTested(true);
  }, [bid]);

  const setChecklistHidden = useCallback(
    (v: boolean) => {
      localStorage.setItem(lsKey(bid, 'hidden'), v ? '1' : '0');
      setHiddenState(v);
    },
    [bid]
  );

  const startTour = useCallback(() => {
    const pending = new Set(steps.filter((s) => !s.done).map((s) => s.key));
    const list = TOUR_STEPS.filter((d) => d.stepKey === null || pending.has(d.stepKey));
    setTourSteps(list);
    setTourIndex(0);
    setTourActive(true);
  }, [steps]);

  const stopTour = useCallback(() => setTourActive(false), []);

  const nextStep = useCallback(() => {
    setTourIndex((i) => {
      if (i >= tourSteps.length - 1) {
        setTourActive(false);
        return 0;
      }
      return i + 1;
    });
  }, [tourSteps.length]);

  const prevStep = useCallback(() => setTourIndex((i) => Math.max(0, i - 1)), []);

  const completeWelcome = useCallback(
    (v: VenueType | null, start: boolean) => {
      localStorage.setItem(lsKey(bid, 'welcome'), '1');
      if (v) {
        localStorage.setItem(lsKey(bid, 'venue'), v);
        setVenue(v);
      }
      setWelcomeOpen(false);
      if (start) startTour();
    },
    [bid, startTour]
  );

  const value: OnboardingContextValue = {
    loaded: raw !== null,
    steps,
    doneCount,
    total,
    requiredDone,
    allDone,
    refresh,
    isPending,
    markTested,
    venue,
    welcomeOpen,
    completeWelcome,
    tourActive,
    tourSteps,
    tourIndex,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    checklistHidden,
    setChecklistHidden,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {welcomeOpen && <WelcomeModal />}
      {tourActive && <OnboardingTour />}
    </OnboardingContext.Provider>
  );
};
