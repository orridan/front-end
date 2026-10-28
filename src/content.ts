/**
 * Orridan site content. Every user-facing string, number, route and link lives here.
 * Components must read from this file instead of hardcoding text.
 *
 * Truthfulness rules (see README): Orridan is a records and management application for
 * digital twin metadata. No real-time IoT, no live 3D rendering, no simulation execution,
 * no production control. Do not add claims of live data, clients, testimonials or figures.
 */
import { readEnv } from './env';

/* ================================================================== */
/* Switches                                                            */
/* ================================================================== */

/**
 * Set to true when the real product page content replaces <ProductContentSlot />.
 * While false, /product is served with noindex,follow and left out of the sitemap.
 */
export const productPageReady = false;

/* ================================================================== */
/* Site and routes                                                     */
/* ================================================================== */

export const site = {
  name: 'Orridan',
  url: readEnv('VITE_SITE_URL', 'https://orridan.net').replace(/\/+$/, '') || 'https://orridan.net',
  dashboardUrl: readEnv('VITE_DASHBOARD_URL', 'https://client.orridan.net') || 'https://client.orridan.net',
  category: 'Industrial Digital Twins & Simulation Intelligence',
  themeColor: '#021A54',
  locale: 'en',
  ogImage: '/og-image.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  logo: {
    light: '/brand/orridan-logo.svg',
    dark: '/brand/orridan-logo-dark.svg',
    mark: '/favicon.svg',
    width: 1055,
    height: 185,
    alt: 'Orridan',
  },
} as const;

export const routes = {
  home: '/',
  product: '/product',
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',
  checkoutSuccess: '/checkout/success',
} as const;

export const staticFiles = {
  sitemap: '/sitemap.xml',
  robots: '/robots.txt',
} as const;

/** Section ids on the landing page, in page order. */
export const sectionIds = {
  about: 'about',
  howItWorks: 'how-it-works',
  features: 'features',
  pricing: 'pricing',
  faq: 'faq',
  contact: 'contact',
} as const;

/* ================================================================== */
/* Company details (placeholders until the client supplies them)       */
/* ================================================================== */

/**
 * Values wrapped in [square brackets] are placeholders. They are shown as visible text
 * but never used for tel:, mailto: or JSON-LD. See src/lib/placeholder.ts.
 */
export type Office = {
  region: string;
  legalName: string;
  address: string;
  phone: string;
  /** International number for tel: links when the shown phone is local. */
  tel?: string;
};

export const company = {
  /** Both legal entities. Used where the legal pages name "{company}". */
  legalName: 'Orridan PVT LTD (Sri Lanka) and Orridan LLC (USA)',
  tradingName: 'Orridan',
  founder: 'Iraj Senanayake',
  /** ISO date. */
  founded: '2024-06-10',
  email: 'help@orridan.net',
  website: 'https://orridan.net',
  offices: [
    { region: 'Sri Lanka', legalName: 'Orridan PVT LTD', address: 'High Level Rd, Nugegoda 10250, Sri Lanka', phone: '0112 854 166', tel: '+94112854166' },
    { region: 'USA', legalName: 'Orridan LLC', address: '146 Washington St, New York, NY 10006, United States', phone: '+1 212-842-8006' },
  ] as Office[],
  governingLaw: '[Governing law and jurisdiction to be added]',
  dataRetention: '[Retention period to be added]',
};

/* ================================================================== */
/* Social and citation links: only entries with a real URL render      */
/* ================================================================== */

export type ExternalLink = { label: string; href: string; icon?: 'linkedin' | 'github' | 'x' | 'youtube' | 'link' };

export const socialLinks: ExternalLink[] = [
  { label: 'LinkedIn', href: '', icon: 'linkedin' },
  { label: 'GitHub', href: '', icon: 'github' },
  { label: 'X', href: '', icon: 'x' },
  { label: 'YouTube', href: '', icon: 'youtube' },
];

export const citationLinks: ExternalLink[] = [
  // Add listings or references here, for example a company register entry.
  { label: 'Company register entry', href: '', icon: 'link' },
];

/* ================================================================== */
/* Navigation                                                          */
/* ================================================================== */

export type NavItem = { label: string; sectionId?: string; to?: string };

export const nav = {
  homeLinks: [
    { label: 'About', sectionId: sectionIds.about },
    { label: 'How It Works', sectionId: sectionIds.howItWorks },
    { label: 'Features', sectionId: sectionIds.features },
    { label: 'Pricing', sectionId: sectionIds.pricing },
    { label: 'FAQ', sectionId: sectionIds.faq },
    { label: 'Contact', sectionId: sectionIds.contact },
  ] as NavItem[],
  productLinks: [
    { label: 'Home', to: routes.home },
    { label: 'O.VX', to: routes.product },
  ] as NavItem[],
  cta: { label: 'O.VX', to: routes.product },
  productCta: { label: 'Open Dashboard' },
  skipLink: 'Skip to content',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  menuTitle: 'Site menu',
  homeAria: 'Orridan home',
};

/* ================================================================== */
/* SEO                                                                 */
/* ================================================================== */

export type SeoEntry = { path: string; title: string; description: string; noindex?: boolean; inSitemap: boolean };

export const seo: Record<'home' | 'product' | 'privacy' | 'terms' | 'cookies' | 'checkoutSuccess' | 'notFound', SeoEntry> = {
  home: {
    path: routes.home,
    title: 'Orridan: Industrial Digital Twin and Simulation Records',
    description:
      'Orridan brings asset records, digital twin configurations, simulation scenarios and performance history into one organized workspace.',
    inSitemap: true,
  },
  product: {
    path: routes.product,
    title: 'O.VX by Orridan: Product Overview',
    description:
      'An overview of O.VX by Orridan for industrial asset records, digital twin configurations and simulation result comparison.',
    noindex: !productPageReady,
    inSitemap: productPageReady,
  },
  privacy: {
    path: routes.privacy,
    title: 'Privacy Policy | Orridan',
    description: 'How Orridan collects, uses and protects personal data from this website, the contact form and the newsletter.',
    inSitemap: true,
  },
  terms: {
    path: routes.terms,
    title: 'Terms and Conditions | Orridan',
    description: 'The terms that apply to using the Orridan website and the Orridan dashboard.',
    inSitemap: true,
  },
  cookies: {
    path: routes.cookies,
    title: 'Cookie Policy | Orridan',
    description: 'The cookie and storage categories Orridan uses, what each one does and how to change your choice.',
    inSitemap: true,
  },
  checkoutSuccess: {
    path: routes.checkoutSuccess,
    title: 'Sandbox Payment Received | Orridan',
    description: 'Sandbox test payment confirmation. No real charge was made.',
    noindex: true,
    inSitemap: false,
  },
  notFound: {
    path: '/404',
    title: 'Page Not Found | Orridan',
    description: 'The page you were looking for could not be found on orridan.net.',
    noindex: true,
    inSitemap: false,
  },
};

/* ================================================================== */
/* Landing page                                                        */
/* ================================================================== */

export const hero = {
  eyebrow: 'Industrial Digital Twin Intelligence',
  /** Three headline sentences: solid, outline, solid with the last word in pink. */
  titleLines: ['Understand Your Assets.', 'Explore Every Scenario.', 'Engineer with Clarity.'],
  text: 'Your industrial assets hold valuable operational information. Orridan brings asset records, digital twin configurations, simulation scenarios, and performance history into one organized workspace, helping your team make better informed engineering decisions.',
  cta: { label: 'Explore the Platform', to: routes.product },
  secondaryCta: { label: 'See How It Works', sectionId: sectionIds.howItWorks },
  /** Client hero artwork, converted from the original SVG to WebP (originals in assets-source/). */
  image: {
    src: '/images/hero-1200.webp',
    srcSet: '/images/hero-640.webp 640w, /images/hero-1200.webp 1200w',
    width: 1200,
    height: 1200,
    alt: 'An engineer with a tablet reviewing an industrial pump drawn as a digital twin model.',
  },
};

/** Client illustrations (public/images/illustrations), keyed by the step or card title they belong to. */
export const illustrations: Record<string, string> = {
  'Register Assets': '/images/illustrations/register-assets-step-01.svg',
  'Create Twin Records': '/images/illustrations/create-twin-records.svg',
  'Define Scenarios': '/images/illustrations/define-scenarios.svg',
  'Record State & Telemetry': '/images/illustrations/record-state-and-telemetry.svg',
  'Compare & Review': '/images/illustrations/compare-and-review.svg',
  'Asset & State History': '/images/illustrations/asset-and-state-history.svg',
  'Twin Configuration Versions': '/images/illustrations/twin-configuration-versions.svg',
  'Scenario Result Comparison': '/images/illustrations/scenario-result-comparison.svg',
  'Simulation Scenarios': '/images/illustrations/simulation-scenarios.svg',
  'Telemetry Records': '/images/illustrations/telemetry-records.svg',
  'Maintenance Tasks': '/images/illustrations/maintenance-tasks.svg',
  'Performance Dashboard': '/images/illustrations/performance-dashboard.svg',
  'Activity Trail': '/images/illustrations/activity-trail.svg',
  'Traceable Activity': '/images/illustrations/activity-trail.svg',
  'Centralized Records': '/images/illustrations/register-assets.svg',
  'Configuration History': '/images/illustrations/configure-twins.svg',
  'Meaningful Result Comparisons': '/images/illustrations/compare-results.svg',
};


export const features = {
  eyebrow: 'Features',
  heading: 'Built around the records engineers actually keep',
  intro:
    'Orridan keeps the metadata around your digital twins organised: what an asset is, how its twin is configured, which scenarios were defined and what the recorded results were.',
  highlight: [
    {
      kind: 'timeline',
      title: 'Asset & State History',
      text: 'Every recorded state change for an asset, in order, with who recorded it and when.',
      points: ['Commissioned', 'In service', 'Maintenance', 'In service'],
    },
    {
      kind: 'stepper',
      title: 'Twin Configuration Versions',
      text: 'Each change to a twin configuration becomes a new version you can open, compare and trace.',
      points: ['v1.0', 'v2.1', 'v3.2'],
    },
    {
      kind: 'bars',
      title: 'Scenario Result Comparison',
      text: 'Recorded scenario results side by side against the expected outcome, with the delta for each.',
      points: ['Run A', 'Run B', 'Run C'],
    },
  ],
  bento: [
    { icon: 'scenario', title: 'Simulation Scenarios', text: 'Define scenarios with inputs, assumptions and expected outcomes, then version them as they change.' },
    { icon: 'telemetry', title: 'Telemetry Records', text: 'Readings entered by hand, imported from files or loaded as records. Nothing is streamed live.' },
    { icon: 'maintenance', title: 'Maintenance Tasks', text: 'Plan and log maintenance against the asset it belongs to, so history stays in context.' },
    { icon: 'dashboard', title: 'Performance Dashboard', text: 'Summaries built from the records you keep: asset counts, open tasks and recent result comparisons.' },
    { icon: 'activity', title: 'Activity Trail', text: 'A readable log of who created or changed which record, for review and handover.' },
  ],
  factsHeading: 'Product facts',
  illustrativeLabel: 'Illustrative',
  /** Decorative sample text inside the feature micro-illustrations. */
  sampleRecords: ['R-0141', 'R-0142', 'R-0143'],
  sampleTrail: ['+ asset PUMP-07 created', '~ config v3.2 saved', '+ result recorded'],
  facts: [
    { value: 6, suffix: '', label: 'core modules' },
    { value: 1, suffix: '', label: 'registry for every asset' },
    { value: null, display: 'Versioned', label: 'configurations' },
    { value: 7, suffix: '-day', label: 'delivery' },
  ] as { value: number | null; suffix?: string; display?: string; label: string }[],
};

export const howItWorks = {
  eyebrow: 'How It Works',
  stepLabel: 'Step',
  heading: 'From first asset to compared result in five steps',
  intro: 'Each step adds a record that the next one builds on, so every result can be traced back to the asset and configuration it came from.',
  steps: [
    { icon: 'asset', title: 'Register Assets', text: 'Add facilities, lines and assets with owners and status.' },
    { icon: 'twin', title: 'Create Twin Records', text: 'Link each asset to its twin: model references, components and a first configuration version.' },
    { icon: 'scenario', title: 'Define Scenarios', text: 'Describe simulation scenarios with their inputs and the outcome you expect.' },
    { icon: 'telemetry', title: 'Record State & Telemetry', text: 'Enter or import state changes and readings as records against the asset.' },
    { icon: 'compare', title: 'Compare & Review', text: 'Put recorded results next to expectations and review the deviation for each scenario version.' },
  ],
};




export const about = {
  eyebrow: 'Why Orridan exists',
  heading: 'Industrial Clarity Starts with Connected Information.',
  story: [
    'Orridan brings these essential records into one structured workspace, helping your team connect industrial assets with their digital twin configurations, simulation scenarios, recorded states, and results.',
  ],
  valuesEyebrow: 'About Orridan',
  valuesHeading: 'One Workspace. A Clearer Picture.',
  values: [
    {
      icon: 'registry',
      title: 'Centralized Records',
      text: 'Keep your industrial assets, digital twins, and simulation scenarios organized in one place, so the information you need is easier to find and manage.',
    },
    {
      icon: 'version',
      title: 'Configuration History',
      text: 'Track configuration versions and review changes over time, giving your team a clearer understanding of how digital twin records evolve.',
    },
    {
      icon: 'activity',
      title: 'Traceable Activity',
      text: 'Maintain a record of relevant changes, including who made them and when, to support accountability and more informed engineering reviews.',
    },
    {
      icon: 'compare',
      title: 'Meaningful Result Comparisons',
      text: 'Review recorded simulation results alongside expected outcomes, making it easier to identify differences and understand what deserves further investigation.',
    },
  ],
};

/* ================================================================== */
/* Pricing                                                             */
/* ================================================================== */

export type PlanId = 'organisation' | 'twin' | 'enterprise';
export type Interval = 'monthly' | 'annual';

export type Plan = {
  id: PlanId;
  name: string;
  /** Short plan headline, for example "A Clearer Foundation for Asset Management." */
  headline: string;
  tagline: string;
  ctaLabel: string;
  featuresIntro: string;
  footnote?: string;
  /** Monthly list price in whole currency units. null means custom pricing. */
  monthly: number | null;
  highlighted?: boolean;
  features: string[];
};

// PLACEHOLDER PRICES: confirm with client
// PLACEHOLDER PRICES: confirm with client
export const pricing = {
  eyebrow: 'Pricing',
  heading: 'Straightforward Plans for Industrial Intelligence.',
  intro: 'Choose a plan that fits the way your team manages industrial assets, digital twin configurations, and simulation records.',
  currency: 'USD',
  currencySymbol: '$',
  /** Annual billing is not offered on the site (monthly only); kept for the pricing function. */
  annualDiscount: 0.2,
  defaultInterval: 'monthly' as Interval,
  perMonth: '/ month',
  billedAnnually: 'billed {total} per year',
  billedMonthly: 'Billed monthly.',
  customPrice: 'Custom pricing',
  customNote: 'Tailored to your organisation.',
  popularLabel: 'Most complete',
  plans: [
    {
      id: 'organisation',
      name: 'Organisation',
      headline: 'A Clearer Foundation for Asset Management.',
      tagline: 'For industrial teams bringing asset, facility, maintenance, and operational records into one structured workspace.',
      monthly: 50,
      ctaLabel: 'Explore Organisation',
      featuresIntro: 'Ideal for teams that need to:',
      features: [
        'Centralize industrial asset and facility records.',
        'Maintain historical asset-state information.',
        'Organize maintenance tasks and activity records.',
        'Improve visibility into equipment and operational changes.',
      ],
    },
    {
      id: 'twin',
      name: 'Twin Management',
      headline: 'More Control Over Your Digital Twin Workflows.',
      tagline: 'For engineering and manufacturing teams managing digital twin configurations, simulation scenarios, and recorded results alongside their industrial assets.',
      monthly: 150,
      highlighted: true,
      ctaLabel: 'Explore Twin Management',
      featuresIntro: 'Everything in Organisation, with additional capabilities for teams that need to:',
      features: [
        'Maintain versioned digital twin configurations.',
        'Organize simulation scenarios and their parameters.',
        'Record telemetry samples and operational states.',
        'Compare documented simulation results.',
        'Maintain clearer engineering history and traceability.',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      headline: 'A Solution Shaped Around Your Operations.',
      tagline: 'For larger industrial organisations with complex asset structures, specialized engineering workflows, or specific deployment requirements.',
      monthly: null,
      ctaLabel: 'Contact Our Team',
      featuresIntro: 'Discuss your requirements for:',
      features: [
        'Managing assets across facilities and production lines.',
        'Organizing digital twin and simulation records.',
        'Defining role based access and governance requirements.',
        'Planning onboarding and implementation support.',
        'Evaluating potential customizations and additional integrations.',
      ],
      footnote: 'Final scope and pricing are determined through consultation.',
    },
  ] as Plan[],
  comparison: {
    caption: 'Feature comparison by plan',
    eyebrow: 'Feature comparison',
    heading: 'Find the Right Fit for Your Engineering Workflow.',
    intro: "Compare the plans to understand which capabilities best match your organisation's requirements.",
    featureHeader: 'Feature',
    priceRow: 'Price',
    yes: 'Included',
    no: 'Not included',
    rows: [
      { feature: 'Asset registry', organisation: true, twin: true, enterprise: true },
      { feature: 'Asset state history', organisation: true, twin: true, enterprise: true },
      { feature: 'Maintenance tasks', organisation: true, twin: true, enterprise: true },
      { feature: 'Activity trail', organisation: true, twin: true, enterprise: true },
      { feature: 'Twin configuration versions', organisation: false, twin: true, enterprise: true },
      { feature: 'Simulation scenarios', organisation: false, twin: true, enterprise: true },
      { feature: 'Scenario result comparison', organisation: false, twin: true, enterprise: true },
      { feature: 'Telemetry records', organisation: false, twin: true, enterprise: true },
      { feature: 'Onboarding support', organisation: false, twin: false, enterprise: true },
    ] as { feature: string; organisation: boolean; twin: boolean; enterprise: boolean }[],
  },
  fit: {
    eyebrow: 'Which plan fits your team?',
    heading: 'Your Industrial Workflows Are Unique. Your Software Should Make Them Easier to Manage.',
    lines: [
      'Tell us about your assets, workflows, and operational requirements.',
      "We'll help you identify the most suitable plan for your organisation.",
    ],
    cta: 'Talk to Our Team',
    subject: 'Pricing',
  },
  enterpriseSubject: 'Enterprise plan',
  sandbox: {
    badge: 'Sandbox mode: no real charges',
    notConfigured: 'Sandbox checkout not configured',
  },
};

/** Stripe test-mode Payment Links, read from .env. Empty string means not configured. */
export const stripeLinks: Record<PlanId, Record<Interval, string>> = {
  organisation: {
    monthly: readEnv('VITE_STRIPE_LINK_ORGANISATION_MONTHLY'),
    annual: readEnv('VITE_STRIPE_LINK_ORGANISATION_ANNUAL'),
  },
  twin: {
    monthly: readEnv('VITE_STRIPE_LINK_TWIN_MONTHLY'),
    annual: readEnv('VITE_STRIPE_LINK_TWIN_ANNUAL'),
  },
  enterprise: {
    monthly: readEnv('VITE_STRIPE_LINK_ENTERPRISE_MONTHLY'),
    annual: readEnv('VITE_STRIPE_LINK_ENTERPRISE_ANNUAL'),
  },
};

/* ================================================================== */
/* FAQ                                                                 */
/* ================================================================== */

export type FaqItem = { id: string; question: string; answer: string; keywords: string[] };

export const faq = {
  eyebrow: 'FAQ',
  heading: 'Clarity Behind Every Industrial Decision',
  askTitle: 'Still have a question?',
  askText: 'The site assistant answers common questions straight away.',
  askCta: 'Ask the assistant',
  /** {organisationPrice} and {twinPrice} are filled from getPrice() so prices never drift. */
  items: [
    {
      id: 'organize-assets',
      question: 'How Can I Organize Assets Better?',
      answer:
        'Orridan helps you centralize industrial asset records, facility details, ownership information, and operational statuses in one structured workspace. You can find and review essential asset information without relying on scattered spreadsheets and disconnected records.',
      keywords: ['organize', 'organise', 'asset', 'assets', 'facility', 'facilities', 'ownership', 'status', 'spreadsheet', 'spreadsheets', 'better'],
    },
    {
      id: 'track-config',
      question: 'Can I Track Twin Configuration Changes?',
      answer:
        'Yes. Orridan is designed to maintain digital twin configuration records, including model references, parameters, and version history. This helps you review configuration changes and understand which version is associated with a particular asset or engineering workflow.',
      keywords: ['track', 'configuration', 'config', 'version', 'versions', 'change', 'changes', 'twin', 'parameters', 'rollback'],
    },
    {
      id: 'manage-scenarios',
      question: 'How Do I Manage Scenarios?',
      answer:
        'You can organize simulation scenarios by documenting their objectives, parameters, versions, and expected outcomes. Associate each scenario with a relevant asset or digital twin to make your engineering records easier to navigate and review.',
      keywords: ['manage', 'scenario', 'scenarios', 'objective', 'objectives', 'document', 'documenting'],
    },
    {
      id: 'historical-conditions',
      question: 'Can I Review Historical Asset Conditions?',
      answer:
        'Orridan supports timestamped telemetry samples and recorded asset-state information. You can review historical records associated with your assets and digital twins to better understand documented operational changes over time. Live industrial sensor connectivity is outside the current scope.',
      keywords: ['historical', 'history', 'condition', 'conditions', 'timestamp', 'timestamped', 'sample', 'samples', 'past', 'review'],
    },
    {
      id: 'compare-results',
      question: 'How Can I Compare Simulation Results?',
      answer:
        'Orridan is designed to help you compare recorded simulation metrics across scenario versions, review deviations from expected outcomes, and document engineering observations. Comparisons depend on the results and metrics available in your records; the platform does not execute physical simulations.',
      keywords: ['compare', 'comparison', 'result', 'results', 'metric', 'metrics', 'deviation', 'deviations', 'expected', 'outcome'],
    },
    {
      id: 'which-plan',
      question: 'Which Plan Fits My Organisation?',
      answer:
        'The Organisation plan, at {organisationPrice} per month, is designed for teams centralizing industrial asset records. Twin Management, at {twinPrice} per month, adds digital twin configuration and simulation scenario management capabilities. Larger organisations can contact our team to discuss Enterprise requirements.',
      keywords: ['which', 'plan', 'fit', 'fits', 'organisation', 'organization', 'tier', 'choose'],
    },
    {
      id: 'accountability',
      question: 'How Does Orridan Protect Accountability?',
      answer:
        'Orridan is designed to support role-based access for administrators, engineering managers, engineers, and viewers. Activity tracking and configuration history help your team review recorded changes and maintain clearer accountability. Actual permissions depend on the implemented application configuration.',
      keywords: ['accountability', 'protect', 'role', 'roles', 'access', 'permission', 'permissions', 'admin', 'administrator', 'viewer', 'audit'],
    },
  ] as FaqItem[],
};

/* ================================================================== */
/* Contact, newsletter and closing banner                              */
/* ================================================================== */

export const contact = {
  eyebrow: 'Contact',
  heading: "Let's Bring Clarity to Your Industrial Workflows.",
  intro: [
    "Tell us what your team is working on, what challenges you're facing, and what you'd like to improve.",
    "Let's explore how Orridan could fit into your engineering workflow.",
  ],
  workOrderHeading: 'Start a Conversation',
  workOrderText: [
    'Have a question about our plans, platform capabilities, or suitability for your organisation?',
    'Get in touch to discuss your requirements and explore the next steps.',
  ],
  availabilityLabel: 'Contact form availability:',
  availabilityOpen: 'Open',
  availabilityClosed: 'Not yet configured',
  endpoint: '/api/contact.php',
  subjects: ['General enquiry', 'Pricing', 'Enterprise plan', 'Product demo', 'Support', 'Partnership'],
  fields: {
    name: { label: 'Name', min: 2, max: 100 },
    email: { label: 'Email', max: 254 },
    company: { label: 'Company (optional)', max: 120 },
    subject: { label: 'Subject' },
    message: { label: 'Message', min: 10, max: 2000 },
  },
  errors: {
    required: 'This field is required.',
    email: 'Enter a valid email address, like name@company.com.',
    tooShort: 'Please enter at least {min} characters.',
    tooLong: 'Please keep this under {max} characters.',
    subject: 'Choose a subject.',
    captcha: 'Please confirm you are not a robot.',
    server: 'Your message could not be sent. Please try again in a few minutes.',
    rateLimited: 'Too many messages from this connection. Please wait a few minutes and try again.',
  },
  submit: 'Send message',
  sending: 'Sending',
  success: 'Thank you. Your message was sent and we will reply by email.',
  sendAnother: 'Send another message',
  notConfigured: 'Contact form not configured. The reCAPTCHA site key is missing from this build.',
  devCaptchaNote: 'Development build: reCAPTCHA is not configured, so the server will reject submissions.',
  captchaLoading: 'Loading security check',
  captchaFailed: 'The security check could not load. Check your connection and reload the page, or try again later.',
  subjectPlaceholder: 'Choose a subject',
  requiredNote: 'All fields are required unless marked optional.',
  captchaNotice: 'This form is protected by Google reCAPTCHA. Google may set cookies when the check loads.',
  infoHeading: 'Find your way to Orridan',
  infoLabels: { phone: 'Phone', email: 'Email', address: 'Registered Address', website: 'Website', founder: 'Founder', founded: 'Founded' },
  preferEmail: 'Prefer email?',
  preferEmailLink: 'Write to us directly',
  mapAlt: 'Stylised map illustration marking the Orridan office location.',
  honeypotLabel: 'Leave this field empty',
};

export const newsletter = {
  heading: 'Stay in the loop',
  text: 'Occasional product updates. No spam, and you can unsubscribe at any time.',
  label: 'Email address',
  submit: 'Subscribe',
  sending: 'Subscribing',
  success: 'Thanks. You are subscribed.',
  error: 'That did not work. Please try again later.',
  invalid: 'Enter a valid email address.',
  honeypotLabel: 'Leave this field empty',
};

export const closingBanner = {
  heading: 'Every Industrial Workflow Starts with a Question.',
  text: 'From asset management and digital twin configurations to simulation records and engineering traceability, tell us what matters to your team.',
  cta: 'Discuss Your Requirements',
  subject: 'General enquiry',
};

/* ================================================================== */
/* Footer                                                              */
/* ================================================================== */

export type FooterLink =
  | { label: string; kind: 'section'; sectionId: string }
  | { label: string; kind: 'route'; to: string }
  | { label: string; kind: 'external'; href: string }
  | { label: string; kind: 'file'; href: string }
  | { label: string; kind: 'cookie-preferences' };

export const footer = {
  tagline: 'Records and management for industrial digital twins.',
  /** Drawing index rows. The dashboard is linked only from the product page, so it is not listed. */
  index: [
    { label: 'O.VX', kind: 'route', to: routes.product },
    { label: 'About', kind: 'section', sectionId: sectionIds.about },
    { label: 'How It Works', kind: 'section', sectionId: sectionIds.howItWorks },
    { label: 'Features', kind: 'section', sectionId: sectionIds.features },
    { label: 'Pricing', kind: 'section', sectionId: sectionIds.pricing },
    { label: 'FAQ', kind: 'section', sectionId: sectionIds.faq },
    { label: 'Contact', kind: 'section', sectionId: sectionIds.contact },
    { label: 'Sitemap', kind: 'file', href: staticFiles.sitemap },
    { label: 'Privacy', kind: 'route', to: routes.privacy },
    { label: 'Terms', kind: 'route', to: routes.terms },
  ] as FooterLink[],
  titleBlock: {
    label: 'Drawing title block',
    drawing: 'Drawing',
    drawingValue: 'Orridan',
    revision: 'Revision',
    sheet: 'Sheet',
    sheetValue: '1 of 1',
    scale: 'Scale',
    scaleValue: '1:1',
    contact: 'Contact',
    index: 'Index',
    revisionRequest: 'Revision request',
    links: 'Links',
  },
  socialHeading: 'Follow',
  citationHeading: 'References',
  backToTop: 'Back to top',
  newTab: '(opens in a new tab)',
  copyright: '© {year} Orridan. All rights reserved.',
};

/* ================================================================== */
/* Product page placeholder                                            */
/* ================================================================== */

export const productPage = {
  eyebrow: 'Product',
  heading: 'O.VX',
  line: 'Detailed product information is coming soon.',
  dashboardCta: 'Open Dashboard',
  homeCta: 'Back to Home',
};

/* ================================================================== */
/* Checkout success and 404                                            */
/* ================================================================== */

export const checkoutSuccess = {
  eyebrow: 'Sandbox mode',
  heading: 'Sandbox test payment received',
  text: 'Sandbox test payment received. No real charge was made and no account was created.',
  homeCta: 'Back to Home',
  productCta: 'Go to the Product page',
  productTo: routes.product,
};

export const notFound = {
  eyebrow: 'Error 404',
  heading: 'This page could not be found',
  text: 'The link may be out of date, or the page may have moved.',
  homeCta: 'Back to Home',
};

export const loading = { label: 'Loading' };

/* ================================================================== */
/* Cookie consent                                                      */
/* ================================================================== */

export const cookieConsent = {
  /** Bump this when the cookie policy changes to ask every visitor again. */
  policyVersion: '2026-10-1',
  storageKey: 'orridan.consent',
  title: 'Your privacy choices',
  text: 'We use necessary storage to run this site. With your permission we would also remember preferences and measure usage.',
  policyLink: 'Read the cookie policy',
  acceptAll: 'Accept all',
  rejectAll: 'Reject non-essential',
  customise: 'Customise',
  dialogTitle: 'Cookie preferences',
  dialogText: 'Choose which optional categories to allow. You can change this at any time from the footer.',
  save: 'Save preferences',
  close: 'Close',
  alwaysOn: 'Always on',
  categories: [
    {
      id: 'necessary',
      title: 'Necessary',
      text: 'Keeps the site working: your cookie choice, the contact form security check and the chat session.',
      locked: true,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      text: 'Remembers optional choices such as the pricing interval you last viewed, and allows a third-party chat widget if one is enabled.',
      locked: false,
    },
    {
      id: 'analytics',
      title: 'Analytics',
      text: 'Lets us measure visits in aggregate so we can improve the site. Nothing loads until you allow it.',
      locked: false,
    },
  ] as { id: 'necessary' | 'preferences' | 'analytics'; title: string; text: string; locked: boolean }[],
};

/* ================================================================== */
/* Chatbot                                                             */
/* ================================================================== */

export const chatbot = {
  openLabel: 'Open the Orridan assistant',
  closeLabel: 'Close the assistant',
  title: 'Orridan assistant',
  disclaimer: 'Automated assistant, not a live agent.',
  greeting: 'Hi. I can answer common questions about Orridan. Pick a topic or type a question.',
  inputLabel: 'Type your question',
  inputPlaceholder: 'Ask about Orridan',
  send: 'Send',
  typing: 'Assistant is typing',
  storageKey: 'orridan.chat',
  fallback:
    'I do not have a reliable answer to that. The team can help directly: use the contact form and I will fill in the subject for you.',
  fallbackAction: 'Go to the contact form',
  pricingAction: 'See pricing',
  productAction: 'Go to the Product page',
  quickRepliesLabel: 'Suggested questions',
  botPrefix: 'Assistant: ',
  userPrefix: 'You: ',
  fallbackSubject: 'General enquiry',
  quickReplies: [
    { label: 'What is Orridan?', intent: 'what-is-orridan' },
    { label: 'Pricing', intent: 'pricing' },
    { label: 'Does it use live data?', intent: 'live-data' },
    { label: 'How do I sign in?', intent: 'sign-in' },
    { label: 'Contact', intent: 'contact' },
  ],
  /** Extra facts beyond the FAQ that the matcher can answer from. */
  facts: [
    {
      id: 'what-is-orridan',
      question: 'What is Orridan?',
      answer:
        'Orridan is a records and management application for industrial digital twins. It keeps asset records, twin configurations, simulation scenarios, recorded states and results in one traceable place.',
      keywords: ['what', 'orridan', 'about', 'platform', 'product', 'does', 'overview', 'explain'],
    },
    {
      id: 'live-data',
      question: 'Does it connect to live machines or IoT?',
      answer: 'No. Orridan does not connect to machines or stream live data. Readings are entered, imported or loaded as records.',
      keywords: ['live', 'iot', 'machine', 'machines', 'realtime', 'stream', 'sensor', 'sensors', 'connect', 'data', 'monitoring'],
    },
    {
      id: 'render-simulate',
      question: 'Does it render 3D twins or run simulations?',
      answer: 'No. Orridan manages twin metadata, configurations and recorded results. It does not render 3D models or execute simulations.',
      keywords: ['3d', 'render', 'rendering', 'simulate', 'simulation', 'run', 'execute', 'model', 'visual', 'cad'],
    },
    {
      id: 'sign-in',
      question: 'How do I sign in?',
      answer:
        'Go to the Product page and choose Open Dashboard. Anyone can sign up there with their email address, and each user gets a private workspace. Use the same email to sign in afterwards.',
      keywords: ['sign', 'signin', 'login', 'log', 'account', 'register', 'signup', 'password', 'dashboard', 'workspace'],
    },
    {
      id: 'get-started',
      question: 'How do I get started?',
      answer:
        'Go to the Product page, open the dashboard from there and sign up with your email, then register your first asset. If you want help choosing a plan, send us a message through the contact form.',
      keywords: ['start', 'started', 'begin', 'trial', 'onboard', 'onboarding', 'setup', 'first'],
    },
    {
      id: 'pricing',
      question: 'How much does Orridan cost?',
      answer: '',
      keywords: ['price', 'prices', 'pricing', 'cost', 'costs', 'plan', 'plans', 'subscription', 'pay', 'billing', 'annual', 'monthly', 'cheap', 'expensive'],
    },
    {
      id: 'contact',
      question: 'How do I contact Orridan?',
      answer: 'The quickest way to reach the team is the contact form on this page. I can take you there with the subject filled in.',
      keywords: ['contact', 'email', 'phone', 'call', 'talk', 'human', 'person', 'support', 'help', 'sales', 'reach'],
    },
    {
      id: 'modules',
      question: 'What modules does Orridan include?',
      answer:
        'Orridan has six core modules: Asset Registry, Twin Configurations, Simulation Scenarios, State & Telemetry Records, Maintenance Tasks, and Result Comparison with a Performance Dashboard.',
      keywords: ['module', 'modules', 'feature', 'features', 'include', 'includes', 'maintenance', 'registry', 'dashboard', 'activity'],
    },
    {
      id: 'delivery',
      question: 'How long does setup take?',
      answer: 'Orridan quotes a 7-day delivery for setting up an organisation. Ask through the contact form for details for your team.',
      keywords: ['delivery', 'setup', 'deploy', 'deployment', 'long', 'days', 'time', 'implementation'],
    },
    {
      id: 'privacy',
      question: 'Is my data private?',
      answer: 'Each user has a private workspace. The privacy policy explains what this website collects and why.',
      keywords: ['privacy', 'private', 'secure', 'security', 'gdpr', 'personal', 'cookies'],
    },
  ] as FaqItem[],
};

/* ================================================================== */
/* Legal pages                                                         */
/* ================================================================== */

export const legalCommon = {
  draftBanner: 'Draft text, to be reviewed by the company’s legal advisor.',
  lastUpdated: 'Last updated',
  contents: 'On this page',
  contactHeading: 'Contact us',
  contactIntro: 'Questions about this page can be sent to:',
};

export type LegalSection = { id: string; heading: string; paragraphs?: string[]; list?: string[] };

export const privacyPage = {
  heading: 'Privacy Policy',
  intro:
    'This policy explains what personal data the Orridan website collects, why we collect it and the choices you have. It covers orridan.net. The Orridan dashboard at client.orridan.net has its own account terms.',
  sections: [
    {
      id: 'data-we-collect',
      heading: 'Data we collect',
      list: [
        'Contact form: your name, email address, optional company name, the subject you choose and your message.',
        'Newsletter: your email address.',
        'Cookie choice: the categories you accepted or rejected, the policy version and the time of your choice, stored in your browser.',
        'Security check: the contact form uses Google reCAPTCHA, which processes information about your device and browser to tell people from automated traffic.',
        'Optional analytics: only if you allow the Analytics category, aggregate usage data about pages visited.',
        'Chat assistant: the conversation with the automated assistant is kept in your browser session storage and cleared when you close the tab. It is not sent to us.',
        'Sandbox payments: checkout buttons open payment pages hosted by Stripe in test mode. We do not receive card details.',
        'Server logs: our hosting provider records standard request data such as IP address and time of request. The contact endpoint stores a one-way hash of your IP address for a short time to limit abuse.',
      ],
    },
    {
      id: 'purposes',
      heading: 'Why we use it',
      list: [
        'To reply to your message and keep a record of the conversation.',
        'To send the newsletter you asked for.',
        'To remember your cookie choice.',
        'To protect forms from spam and abuse.',
        'To understand how the site is used, only when you allow analytics.',
      ],
    },
    {
      id: 'retention',
      heading: 'How long we keep it',
      paragraphs: [
        'Contact messages and newsletter subscriptions are kept for {retention}, or until you ask us to delete them.',
        'Your cookie choice stays in your browser until you clear it or the policy version changes. Rate limit records on the server expire after ten minutes.',
      ],
    },
    {
      id: 'your-rights',
      heading: 'Your rights',
      paragraphs: [
        'Depending on where you live, you may have the right to access, correct, delete or export your personal data, to object to or restrict its use, and to withdraw consent at any time. You can also complain to your local data protection authority.',
        'To use any of these rights, contact us using the details below. You can change your cookie choice at any time on the Cookie Policy page.',
      ],
    },
    {
      id: 'third-parties',
      heading: 'Third parties',
      list: [
        'Google reCAPTCHA, for the contact form security check. Google’s privacy policy applies to that service.',
        'Stripe, which hosts the sandbox checkout pages. Stripe’s privacy policy applies on those pages.',
        'Our web hosting provider, which stores the site and processes the requests it receives.',
        'An analytics provider, only if one is added and only after you allow the Analytics category.',
      ],
    },
  ] as LegalSection[],
};

export const termsPage = {
  heading: 'Terms and Conditions',
  intro:
    'These terms apply to your use of the Orridan website at orridan.net and the Orridan dashboard at client.orridan.net. By using either, you agree to them.',
  sections: [
    {
      id: 'use-of-site',
      heading: 'Use of the website and dashboard',
      paragraphs: [
        'You may use the website to learn about Orridan and contact us. You may use the dashboard to keep records for your own organisation under the plan you choose.',
      ],
    },
    {
      id: 'accounts',
      heading: 'Accounts',
      paragraphs: [
        'Anyone can sign up for the dashboard with an email address. Each user has a private workspace. You are responsible for keeping access to your email and account secure and for the records you add.',
      ],
    },
    {
      id: 'acceptable-use',
      heading: 'Acceptable use',
      list: [
        'Do not try to access other users’ workspaces or data.',
        'Do not upload unlawful content or content you do not have the right to use.',
        'Do not disrupt, probe or overload the service.',
        'Do not use Orridan to control equipment or for safety-critical decisions. It is a records application.',
      ],
    },
    {
      id: 'intellectual-property',
      heading: 'Intellectual property',
      paragraphs: [
        'The Orridan name, logo, website and software belong to {company}. The records you add remain yours.',
      ],
    },
    {
      id: 'disclaimers',
      heading: 'Disclaimers',
      paragraphs: [
        'Orridan stores and organises records that you provide. It does not connect to machines, stream live data, render 3D models or run simulations. Illustrations on this website are labelled as illustrative and are not real data.',
        'The website and dashboard are provided as they are, without warranties of any kind beyond those required by law.',
      ],
    },
    {
      id: 'liability',
      heading: 'Limitation of liability',
      paragraphs: [
        'To the extent the law allows, we are not liable for indirect or consequential losses, or for decisions made using records stored in Orridan.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to these terms',
      paragraphs: [
        'We may update these terms. The date at the top of this page shows when they last changed. Continued use after a change means you accept the updated terms.',
      ],
    },
    {
      id: 'governing-law',
      heading: 'Governing law',
      paragraphs: ['These terms are governed by: {governingLaw}.'],
    },
  ] as LegalSection[],
};

export const cookiesPage = {
  heading: 'Cookie Policy',
  intro:
    'This page lists the cookie and browser storage categories used on orridan.net. Optional categories stay off until you allow them.',
  openPreferences: 'Change cookie preferences',
  categoriesHeading: 'Cookie categories',
  tableCaption: 'Storage used on this site',
  tableHeaders: { name: 'Name', category: 'Category', purpose: 'Purpose', duration: 'Duration' },
  items: [
    { name: 'orridan.consent', category: 'Necessary', purpose: 'Stores your cookie choice and the policy version.', duration: 'Until cleared or the policy changes' },
    { name: 'orridan.chat', category: 'Necessary', purpose: 'Keeps the assistant conversation during your visit.', duration: 'Browser session' },
    { name: 'orridan.intro', category: 'Necessary', purpose: 'Plays the opening animation once per visit.', duration: 'Browser session' },
    { name: 'Google reCAPTCHA', category: 'Necessary', purpose: 'Security check on the contact form. Loads only when the form comes into view and may set Google cookies.', duration: 'Set by Google' },
    { name: 'orridan.prefs', category: 'Preferences', purpose: 'Remembers the pricing interval you last chose.', duration: 'Until cleared' },
    { name: 'Analytics', category: 'Analytics', purpose: 'Aggregate usage measurement. No analytics tool is active yet; none loads without consent.', duration: 'Set by the provider' },
  ],
};

/* ================================================================== */
/* Drawing motif (decorative labels only, never data)                  */
/* ================================================================== */

/** Landing page sections in order. The index gives each one a sheet reference (03 / FEATURES). */
export const sectionMeta: { id: string; label: string }[] = [
  { id: 'top', label: 'Overview' },
  { id: sectionIds.about, label: 'About' },
  { id: sectionIds.howItWorks, label: 'How it works' },
  { id: sectionIds.features, label: 'Features' },
  { id: sectionIds.pricing, label: 'Pricing' },
  { id: sectionIds.faq, label: 'FAQ' },
  { id: sectionIds.contact, label: 'Contact' },
];

export const drawing = {
  /** Decorative drawing-header strips. Deliberately generic, not real data. */
  headerStrip: ['DWG 001', 'REV A', 'SCALE 1:1', 'SHEET 1 OF 1'],
  footerStrip: ['ORRIDAN', 'TWIN RECORD SYSTEM', 'DRAWN IN 4 INKS', 'NOT TO SCALE'],
  columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
  heroCallouts: [
    { label: 'Asset', note: 'registered record' },
    { label: 'Twin', note: 'versioned configuration' },
    { label: 'Scenario', note: 'defined inputs' },
    { label: 'Result', note: 'compared to expected' },
  ],
  menuLabel: 'Menu',
  progressLabel: 'Page progress',
  activeSectionLabel: 'Current section',
  menuTree: { root: 'Orridan', facility: 'Facility', line: 'Line', asset: 'Asset' },
  outlineWord: 'Orridan',
  /** Decorative measurement and reference labels on the drawings. */
  labels: {
    diameter: 'Ø 300',
    radius: 'R 150',
    angle: '120°',
    factsDim: 'FACTS',
    aboutDim: 'ORRIDAN / RECORD SYSTEM',
    titleBlockCode: 'TB-01',
    productSheet: 'P1 / Product',
    productRef: 'P1',
    featureCode: 'F-',
  },
};

/**
 * Built for / Who uses it explorer: which roles (by persona title) belong to each organisation
 * type (by builtFor title). Grouping only, no new copy.
 */

export const workOrder = {
  title: 'Work order',
  reference: 'WO / ORR / 001',
  referenceLabel: 'Reference',
  cells: { name: 'A1', email: 'A2', company: 'B1', subject: 'B2', message: 'C1', check: 'D1' },
  titleBlock: 'Title block',
};

