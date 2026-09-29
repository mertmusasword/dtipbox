import React from 'react';
import { CustomerFeedbacks } from '../../components/CustomerFeedbacks';
import { useLanguage } from '../../i18n';
import { usePageTitle } from '../../hooks/usePageTitle';

export const FeedbacksPage: React.FC = () => {
  const { t } = useLanguage();
  usePageTitle(t('nav.feedbacks'));

  return (
    <div className="page-wrapper">
      <CustomerFeedbacks />
    </div>
  );
};
