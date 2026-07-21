import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function SEO({ title, description, canonical, ogImage, noindex }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    // Update title
    document.title = title;

    // Helper function to update or create a meta tag
    const updateMetaTag = (
      attribute: 'name' | 'property',
      key: string,
      content: string
    ) => {
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function to update or create a link tag
    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Update standard meta tags
    updateMetaTag('name', 'description', description);
    
    // Update canonical if provided (or default based on location)
    if (canonical) {
      updateLinkTag('canonical', canonical);
    }

    // Update Robots tag based on noindex
    if (noindex) {
      updateMetaTag('name', 'robots', 'noindex,follow');
    } else {
      // Remove robots noindex meta tag if it exists and we don't want noindex
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta && robotsMeta.getAttribute('content') === 'noindex,follow') {
        robotsMeta.parentNode?.removeChild(robotsMeta);
      }
    }

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', canonical || window.location.href);
    if (ogImage) {
      updateMetaTag('property', 'og:image', ogImage);
    }

    // Update Twitter tags
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    if (ogImage) {
      updateMetaTag('name', 'twitter:image', ogImage);
    }
  }, [title, description, canonical, ogImage, location.pathname]);

  return null;
}
