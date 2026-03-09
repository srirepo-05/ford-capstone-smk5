import { useEffect } from 'react';

// ── usePageTitle ──────────────────────────────────────────────────────────────
// Sets the browser tab title for the current page.
// Appends the site name so every tab reads "Page — SRIStore".
// Resets to the default site name when the component unmounts.
//
// Usage:
//   usePageTitle('Products');          → "Products — SRIStore"
//   usePageTitle('Fjallraven Bag');    → "Fjallraven Bag — SRIStore"
//   usePageTitle('');                  → "SRIStore"

const SITE_NAME = 'SRIStore';

const usePageTitle = (pageTitle: string): void => {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} — ${SITE_NAME}` : SITE_NAME;

    // Reset to the plain site name when navigating away
    return () => { document.title = SITE_NAME; };
  }, [pageTitle]);
};

export default usePageTitle;
