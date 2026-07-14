import ReactGA from 'react-ga4';

const MEASUREMENT_ID = 'G-6TJ8FZMPJY';

let analyticsEnabled = false;

export function setAnalyticsEnabled(value: boolean) {
  analyticsEnabled = value;
}

export const initGA = () => {
  if (!analyticsEnabled) return;
  ReactGA.initialize(MEASUREMENT_ID);
};

export const trackEvent = (action: string, category: string = 'User Action', label?: string) => {
  if (!analyticsEnabled) return;
  ReactGA.event({
    category,
    action,
    label,
  });
};

export const trackPageView = (path: string) => {
  if (!analyticsEnabled) return;
  ReactGA.send({ hitType: 'pageview', page: path });
};

