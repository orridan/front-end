/// <reference types="vite/client" />

declare const __BUILD_DATE__: string;

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_DASHBOARD_URL?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_STRIPE_LINK_ORGANISATION_MONTHLY?: string;
  readonly VITE_STRIPE_LINK_ORGANISATION_ANNUAL?: string;
  readonly VITE_STRIPE_LINK_TWIN_MONTHLY?: string;
  readonly VITE_STRIPE_LINK_TWIN_ANNUAL?: string;
  readonly VITE_STRIPE_LINK_ENTERPRISE_MONTHLY?: string;
  readonly VITE_STRIPE_LINK_ENTERPRISE_ANNUAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
