import ReactGA from 'react-ga4';

const MEASUREMENT_ID = 'G-6TJ8FZMPJY';

export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

export const trackEvent = (action: string, category: string = 'User Action', label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};

export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};
