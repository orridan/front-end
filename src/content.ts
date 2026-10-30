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
export const productPageReady = true;

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
  /** Chatwoot live chat. The website token is public (it identifies the inbox). Loads for every visitor. */
  chatwoot: { baseUrl: 'https://app.chatwoot.com', websiteToken: 'edt2ZCQ9rCHqvTpR8hHMgqRd' },
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
};

/* ================================================================== */
/* Social and citation links: only entries with a real URL render      */
/* ================================================================== */

export type ExternalLink = {
  label: string;
  href: string;
  icon?: 'linkedin' | 'facebook' | 'youtube' | 'x' | 'pinterest' | 'crunchbase' | 'f6s' | 'link';
};

/** Social profiles, shown in the footer and the contact section. An empty href stays hidden until filled. */
export const socialLinks: ExternalLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/orridan/', icon: 'linkedin' },
  { label: 'Facebook', href: '', icon: 'facebook' },
  { label: 'YouTube', href: '', icon: 'youtube' },
  { label: 'X', href: '', icon: 'x' },
  { label: 'Pinterest', href: '', icon: 'pinterest' },
];

/** Company listings. */
export const citationLinks: ExternalLink[] = [
  { label: 'Crunchbase', href: 'https://www.crunchbase.com/organization/orridan', icon: 'crunchbase' },
  { label: 'F6S', href: 'https://www.f6s.com/orridan', icon: 'f6s' },
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
      'Explore how O.VX organizes industrial assets, twin configurations, simulation scenarios, historical state records and documented results.',
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
  askText: 'Chat with the Orridan team, or send us a message through the contact form.',
  askCta: 'Chat with us',
  /** Used while live chat has not loaded yet: the button opens the contact form instead. */
  askSubject: 'General enquiry',
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
  /** Formspree form. The reCAPTCHA secret key is set in this form's Formspree settings, never here. */
  endpoint: 'https://formspree.io/f/xwllqwon',
  emailSubject: 'New Orridan website enquiry: {subject}',
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
  /** After a successful send the empty form comes back on its own, ready for the next message. */
  successResetMs: 6000,
  notConfigured: 'Contact form not configured. The reCAPTCHA site key is missing from this build.',
  devCaptchaNote: 'Development build: reCAPTCHA is not configured, so Formspree will reject submissions.',
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
  /** Formspree form for newsletter sign-ups. */
  endpoint: 'https://formspree.io/f/xdeedpgj',
  emailSubject: 'New Orridan newsletter sign-up',
  heading: 'Stay in the loop',
  text: 'Occasional product updates. No spam, and you can unsubscribe at any time.',
  label: 'Email address',
  submit: 'Subscribe',
  sending: 'Subscribing',
  success: 'Thanks. You are subscribed.',
  /** The success line clears after this long so the next address can be entered. */
  successResetMs: 5000,
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
  citationHeading: 'Listed on',
  backToTop: 'Back to top',
  newTab: '(opens in a new tab)',
  copyright: '© {year} Orridan. All rights reserved.',
};

/* ================================================================== */
/* Product page placeholder                                            */
/* ================================================================== */

export const productPage = {
  eyebrow: 'Industrial Digital Twin Intelligence',
  heading: 'Connect Industrial Assets to Every Engineering Record.',
  line: 'Explore how Orridan organizes industrial assets, digital twin configurations, simulation scenarios, historical state records, and documented results in one structured engineering workspace.',
  dashboardCta: 'Explore Platform',
  technologyCta: 'Technology Foundation',
  visualLabel: 'Illustrative record path',
  visualDescription: 'Illustrative, non-live diagram linking an industrial asset record to a twin configuration, scenario record, state history, and recorded result comparison.',
  visualRecords: [
    { label: 'Asset registry', detail: 'Identity / location / status' },
    { label: 'Twin configuration', detail: 'Model reference / parameters' },
    { label: 'Scenario record', detail: 'Inputs / expected outcomes' },
  ],
  visualHistory: 'Recorded state history',
  visualComparison: 'Result comparison',
  visualNote: 'Illustrative workflow, not live data',
  foundation: {
    eyebrow: 'Current application foundation',
    heading: 'A structured record system for engineering work.',
    intro: 'O.VX is described as a responsive web application for organizing industrial asset and digital twin records, with historical context for review. It does not connect to live equipment or execute physical simulations.',
    items: [
      { label: 'Application', value: 'PHP / Laravel' },
      { label: 'Data layer', value: 'SQL database' },
      { label: 'Interfaces', value: 'Responsive web application and backend APIs' },
      { label: 'Access model', value: 'Authentication and role-based permissions' },
      { label: 'Records', value: 'Assets, twin configurations, scenarios, telemetry samples, state history, results and maintenance' },
      { label: 'Traceability', value: 'Configuration history, validation, activity tracking and structured engineering records' },
    ],
    note: 'Telemetry values are historical records entered or imported into the application; they are not streamed live.',
  },
  technology: {
    eyebrow: 'Technology foundation',
    heading: 'A clear boundary between current records and future integrations.',
    intro: 'The current application foundation is separate from the NVIDIA technologies shown here as possible future integrations.',
    proposedLabel: 'Proposed integration',
    currentLabel: 'Current application foundation',
    futureMeta: 'Future',
    applicationTitle: 'O.VX application stack',
    currentIndex: 'Current',
    boundaryLabel: 'Separate from current application flow',
    proposedOnlyLabel: 'Proposed only',
    items: [
      {
        name: 'NVIDIA Omniverse',
        description: 'Technologies for developing industrial digital-twin and 3D workflows. A future Orridan integration could connect suitable scene representations with engineering records; no Omniverse connection is implemented today.',
      },
      {
        name: 'OpenUSD',
        description: 'An extensible framework for describing, composing, and exchanging 3D scene data across compatible tools. It could support future asset representation and interoperability; Orridan does not currently import, export, validate, or render USD assets.',
      },
      {
        name: 'NVIDIA Isaac Sim',
        description: 'A robotics development and simulation environment for physically based testing in virtual worlds. It may suit selected future robotics workflows; Orridan does not launch Isaac Sim, execute simulations, or control robots.',
      },
      {
        name: 'NVIDIA PhysicsNeMo',
        description: 'A framework for physics-informed and scientific machine-learning workflows. Future use would depend on suitable datasets, validated models, and compute infrastructure; it does not power current predictions or simulation execution in Orridan.',
      },
    ],
    foundationItems: [
      { label: 'Application', value: 'PHP / Laravel' },
      { label: 'Data', value: 'SQL database' },
      { label: 'Interfaces', value: 'Responsive web app / backend APIs' },
      { label: 'Records', value: 'Assets / configurations / scenarios / history / results' },
    ],
  },
  architecture: {
    eyebrow: 'Technical architecture',
    heading: 'Records move through a defined application layer.',
    intro: 'The current application path organizes user-entered or imported records and makes their history available for review and summary.',
    stages: [
      { title: 'Engineering users', detail: 'Administrators, engineering managers, engineers and viewers.', icon: 'building' },
      { title: 'Responsive web application', detail: 'Browser-based interface for working with structured records.', icon: 'dashboard' },
      { title: 'Laravel application layer', detail: 'Application logic and backend APIs.', icon: 'gear' },
      { title: 'Authentication and permissions', detail: 'Access is governed by configured user roles.', icon: 'lock' },
      { title: 'Structured SQL records', detail: 'Validated application records stored in a relational data layer.', icon: 'registry' },
      { title: 'Engineering record groups', detail: 'Assets, configurations, scenarios, telemetry, results and maintenance.', icon: 'twin' },
      { title: 'History and summaries', detail: 'Activity, asset-state history and dashboard summaries from stored records.', icon: 'activity' },
    ],
    futureHeading: 'Proposed future integrations',
    futureIntro: 'These are separate assessment areas, not active connections or current data-flow stages.',
    futureItems: [
      { title: 'Omniverse + OpenUSD', detail: 'Assess suitable 3D scene and data-exchange workflows.' },
      { title: 'Isaac Sim', detail: 'Assess supported robotics simulation use cases.' },
      { title: 'PhysicsNeMo', detail: 'Assess physics-informed machine-learning feasibility.' },
    ],
  },
  capabilities: {
    eyebrow: 'Application capabilities',
    heading: 'The records that keep engineering work connected.',
    intro: 'Organize assets, configuration changes, scenario definitions, historical measurements, documented outcomes and maintenance activity without implying live operational control.',
    items: [
      {
        title: 'Asset registry', icon: 'asset',
        text: 'Keep each industrial asset identifiable and connected to its operating context.',
        points: ['Identity, type, location, owner and status', 'Facility and production-line associations', 'Asset record and state history'],
      },
      {
        title: 'Twin configuration management', icon: 'twin',
        text: 'Maintain the metadata that describes how a digital twin is configured.',
        points: ['Twin metadata and model references', 'Component and parameter records', 'Draft, active and archived versions'],
      },
      {
        title: 'Simulation scenario management', icon: 'scenario',
        text: 'Document scenario definitions and keep their revisions connected to the relevant asset.',
        points: ['Objectives, parameters and expected outcomes', 'Asset and twin associations', 'Scenario versions and recorded status'],
      },
      {
        title: 'Telemetry and state history', icon: 'telemetry',
        text: 'Review historical readings and recorded operating-state changes.',
        points: ['Timestamped readings and states', 'Historical measurements and changes', 'Manually entered or imported records; no live stream'],
      },
      {
        title: 'Simulation result comparison', icon: 'compare',
        text: 'Compare documented outcomes without suggesting Orridan runs the underlying simulation.',
        points: ['Recorded outcomes and metrics', 'Comparisons across scenario versions', 'Deviations and engineering review comments'],
      },
      {
        title: 'Maintenance and performance summaries', icon: 'maintenance',
        text: 'Keep maintenance work and record-based summaries in the asset context.',
        points: ['Asset and configuration summaries', 'Recorded-state and result summaries', 'Maintenance tasks and recent activity'],
      },
    ],
  },
  governance: {
    eyebrow: 'Governance and engineering review',
    heading: 'Keep decisions attached to the records they change.',
    intro: 'History, activity and recorded outcomes support engineering review, accountability and handover. Role access depends on application configuration; validation is presented as an application requirement because its backend implementation is not verifiable in this public-site repository.',
    items: [
      { title: 'Twin configuration history', status: 'Described capability', detail: 'Version records make configuration changes easier to review and trace.' },
      { title: 'Traceable simulation records', status: 'Described capability', detail: 'Keep scenario definitions, recorded outcomes and review notes in context.' },
      { title: 'Role-based permissions', status: 'Configuration-dependent', detail: 'The specified roles are Administrators, Engineering Managers, Engineers and Viewers; effective permissions depend on application configuration.' },
      { title: 'Asset-state history', status: 'Described capability', detail: 'Recorded state changes help teams reconstruct an asset’s historical context.' },
      { title: 'Data validation', status: 'Application requirement', detail: 'Validation is required for reliable records; implementation details are not verifiable from this repository.' },
      { title: 'Activity tracking', status: 'Described capability', detail: 'A record of who changed what supports review and team handover.' },
    ],
  },
  roadmap: {
    eyebrow: 'Proposed Q3-Q4 roadmap',
    heading: 'Planned Milestones & Development Stages.',
    intro: 'A forward-looking sequence for strengthening record workflows and assessing where future integrations may be useful. These are proposed milestones, not delivery commitments.',
    items: [
      { title: 'Asset and twin record foundation', detail: 'Organize asset records, twin metadata and configuration versions.' },
      { title: 'Scenario definition and versioning', detail: 'Improve scenario parameters, expected outcomes and version traceability.' },
      { title: 'Historical state and telemetry records', detail: 'Strengthen timestamped measurement records, state history and review workflows.' },
      { title: 'Result comparison and engineering review', detail: 'Improve comparison of recorded outcomes with expected results, deviations and review comments.' },
      { title: 'Dashboard and maintenance visibility', detail: 'Consolidate asset summaries, maintenance tasks, recent changes and documented outcomes.' },
      { title: 'OpenUSD interoperability assessment', detail: 'Evaluate requirements and feasibility for future scene-data exchange.' },
      { title: 'Omniverse and robotics workflow assessment', detail: 'Assess suitable digital-twin integration approaches and relevant Isaac Sim robotics workflows.' },
      { title: 'PhysicsNeMo feasibility assessment', detail: 'Evaluate potential use cases, datasets, model validation and infrastructure needs.' },
    ],
    note: 'All stages are planned for assessment or development. No dates, integration outcomes or delivery guarantees are implied.',
    statusLabel: 'Planned',
  },
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
  policyVersion: '2026-10-2',
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
      text: 'Keeps the site working: your cookie choice, the contact form security check and the Chatwoot live chat.',
      locked: true,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      text: 'Remembers optional choices such as the pricing interval you last viewed.',
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
/* Legal pages                                                         */
/* ================================================================== */

export const legalCommon = {
  draftBanner: 'Draft text, to be reviewed by the company’s legal advisor.',
  lastUpdated: 'Last updated',
  contents: 'On this page',
  contactHeading: 'Contact us',
  contactIntro: 'Questions about this page can be sent to:',
};

/**
 * Legal text supplied by the client (TermsFeed). Inline markup: **bold** and [text](href).
 * A list item is either one line or a group of paragraphs with an optional nested list.
 */
export type LegalListItem = string | { paragraphs: string[]; sub?: string[] };
export type LegalBlock = { h3: string } | { h4: string } | { p: string } | { ul: LegalListItem[] };
export type LegalSection = { id: string; heading: string; blocks: LegalBlock[] };

const legalContactBlocks = (intro: string, site: string): LegalBlock[] => [
  { p: intro },
  {
    ul: [
      'By email: [help@orridan.net](mailto:help@orridan.net)',
      `By visiting this page on ${site}: [https://orridan.net/#contact](/#contact)`,
      'By phone (USA): [+1 212-842-8006](tel:+12128428006)',
      'By phone (Sri Lanka): [0112 854 166](tel:+94112854166)',
      'By mail: USA Address: Orridan LLC, 146 Washington St, New York, NY 10006, United States',
      'By mail: Sri Lanka Address: Orridan PVT LTD, High Level Rd, Nugegoda 10250, Sri Lanka',
    ],
  },
];

const interpretation = 'The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.';
const affiliate = '**Affiliate** means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.';
const website = '**Website** refers to Orridan, accessible from [https://orridan.net/](https://orridan.net/)';
const you = '**You** means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.';

export const privacyPage = {
  heading: 'Privacy Policy',
  updated: '2026-10-29',
  intro: [
    'This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.',
    'We use Your Personal Data to provide and improve the Service. We collect, use, and disclose Your information as described in this Privacy Policy and, where required by applicable law, only where We have a valid legal basis to do so, including Your consent (where consent is required).',
  ],
  sections: [
    {
      id: 'interpretation-and-definitions',
      heading: 'Interpretation and Definitions',
      blocks: [
        { h3: 'Interpretation' },
        { p: interpretation },
        { h3: 'Definitions' },
        { p: 'For the purposes of this Privacy Policy:' },
        {
          ul: [
            '**Account** means a unique account created for You to access Our Service or parts of Our Service.',
            affiliate,
            '**Company** (referred to as either "the Company", "We", "Us" or "Our" in this Privacy Policy) refers to Orridan.',
            '**Cookies** are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website, among its many uses.',
            '**Country/State** refers to: New York, United States.',
            '**Device** means any device that can access the Service, such as a computer, a cell phone or a digital tablet.',
            {
              paragraphs: [
                '**Personal Data** (or "Personal Information") is any information that relates to an identified or identifiable individual.',
                'We use "Personal Data" and "Personal Information" interchangeably unless a law uses a specific term.',
              ],
            },
            '**Service** refers to the Website.',
            '**Service Provider** means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.',
            '**Usage Data** refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).',
            '**User** means any individual who accesses or uses the Service.',
            `${website}.`,
            you,
          ],
        },
      ],
    },
    {
      id: 'collecting-and-using',
      heading: 'Collecting and Using Your Personal Information',
      blocks: [
        { h3: 'Types of Data Collected' },
        { h4: 'Personal Data' },
        { p: 'While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:' },
        { ul: ['Email address', 'First name and last name', 'Phone number', 'Address, State, Province, ZIP/Postal code, City'] },
        { h4: 'Usage Data' },
        { p: 'Usage Data is collected automatically when using the Service.' },
        { p: 'Usage Data may include information such as Your Device’s Internet Protocol address (e.g. IP address), browser type, browser version, the pages of Our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.' },
        { p: 'When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device’s unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.' },
        { p: 'We may also collect information that Your browser sends whenever You visit Our Service or when You access the Service by or through a mobile device.' },
        { h4: 'Tracking Technologies and Cookies' },
        { p: 'We use tracking technologies (such as cookies) to track the activity and to improve Our Service. The technologies We use may include:' },
        {
          ul: [
            '**Cookies or Browser Cookies.** A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of Our Service.',
            '**Web Beacons.** Certain sections of Our Service may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).',
          ],
        },
        { p: 'Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.' },
        { p: 'Where required by law, We use non-essential cookies (that is, Cookies other than the Necessary / Essential Cookies described below) only with Your consent. You can withdraw or change Your consent at any time using Our cookie preferences tool (if available) or through Your browser/device settings. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.' },
        { p: 'We use both Session and Persistent Cookies for the purposes set out below:' },
        {
          ul: [
            {
              paragraphs: [
                '**Necessary / Essential Cookies**',
                'Type: Session Cookies',
                'Administered by: Us',
                'Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.',
              ],
            },
            {
              paragraphs: [
                '**Cookies Policy / Notice Acceptance Cookies**',
                'Type: Persistent Cookies',
                'Administered by: Us',
                'Purpose: These Cookies identify whether users have accepted the use of cookies on the Website and record the consent choices You have made, so that We can honor those choices on future visits.',
              ],
            },
            {
              paragraphs: [
                '**Functionality Cookies**',
                'Type: Persistent Cookies',
                'Administered by: Us',
                'Purpose: These Cookies allow Us to remember choices You make when You use the Website, such as remembering Your Account login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter Your preferences every time You use the Website.',
              ],
            },
          ],
        },
        { h3: 'Use of Your Personal Data' },
        { p: 'The Company may use Personal Data for the following purposes:' },
        {
          ul: [
            '**To provide and maintain Our Service**, including to monitor the usage of Our Service.',
            '**To manage Your Account:** to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.',
            '**For the performance of a contract:** the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.',
            '**To contact You:** To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application’s push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.',
            '**To provide You** with news, special offers, and general information about other goods, services and events which We offer that are similar to those that You have already purchased or inquired about. We send such marketing communications only where permitted by applicable law: where prior consent is required (for example, under the laws applicable in the EEA and the UK), We will send them only with Your consent; otherwise, We may send them until You opt out. You may opt out or withdraw Your consent at any time by using the unsubscribe link in any marketing email We send or by contacting Us.',
            '**To manage Your requests:** To attend and manage Your requests to Us.',
            '**For business transfers:** We may use Your Personal Data to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about Our Service users is among the assets transferred.',
            '**For other purposes**: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of Our promotional campaigns, and evaluating and improving Our Service, products, services, marketing and Your experience.',
          ],
        },
        { p: 'We may share Your Personal Data in the following situations:' },
        {
          ul: [
            '**With Service Providers:** We may share Your Personal Data with Service Providers to monitor and analyze the use of Our Service, and to contact You.',
            '**For business transfers:** We may share or transfer Your Personal Data in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.',
            '**With Affiliates:** We may share Your Personal Data with Our affiliates, in which case We will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.',
            '**With other users:** If Our Service offers public areas, when You share Personal Data or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside the Service.',
            '**With Your consent**: We may disclose Your Personal Data for any other purpose with Your consent.',
          ],
        },
        { h4: 'Text Messages Privacy Notice' },
        { p: 'You have the option to receive text (SMS) messages from Us. If You opt in to text messages, We will send You updates, notifications, and other communications as described below. When You opt in, We will collect and store the information You provide in connection with text messaging, such as Your phone number, the date and method of Your consent, and message delivery and read information.' },
        { p: 'No mobile information will be shared with or sold to third parties or affiliates for marketing or promotional purposes. The phone numbers and consent records We collect for texting are never shared with anyone for any purpose, except the Service Providers that technically have to handle them to deliver the texts.' },
        { p: 'Consent to receive text messages is not a condition of any purchase or use of Our Service. If You consent to receive SMS from Us, You agree to receive text messages from Us related to:' },
        {
          ul: [
            'Customer care and support',
            'Account notifications, such as activity, status, or renewal reminders',
            'Delivery notifications and updates on the status of a delivery',
            'Authentication messages, such as one-time passwords (OTP) and passcodes',
            'Security alerts, such as suspicious login attempts or unusual account activity',
            'Marketing and promotional offers, discounts, and other promotional content',
          ],
        },
        { p: 'Reply STOP to opt-out. Reply HELP for support. Message & data rates may apply. Messaging frequency may vary. Carriers are not liable for delayed or undelivered messages.' },
        { h3: 'Retention of Your Personal Data' },
        { p: 'The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with Our legal obligations (for example, if We are required to retain Your data to comply with applicable laws), resolve disputes, and enforce Our legal agreements and policies.' },
        { p: 'Where possible, We apply shorter retention periods and/or reduce identifiability by deleting, aggregating, or anonymizing data. Unless otherwise stated, the retention periods below are maximum periods ("up to") and We may delete or anonymize data sooner when it is no longer needed for the relevant purpose. We apply different retention periods to different categories of Personal Data based on the purpose of processing and legal obligations:' },
        {
          ul: [
            {
              paragraphs: ['Account Information'],
              sub: ['User Accounts: retained for the duration of Your Account relationship plus up to 24 months after account closure to handle any post-termination issues or resolve disputes.'],
            },
            {
              paragraphs: ['Customer Support Data'],
              sub: [
                'Support tickets and correspondence: up to 24 months from the date of ticket closure to resolve follow-up inquiries, track service quality, and defend against potential legal claims.',
                'Chat transcripts: up to 24 months for quality assurance and staff training purposes.',
              ],
            },
            {
              paragraphs: ['Usage Data'],
              sub: [
                'Website analytics data (cookies, IP addresses, device identifiers): up to 24 months from the date of collection, which allows us to analyze trends while respecting privacy principles.',
                'Server logs (IP addresses, access times): up to 24 months for security monitoring and troubleshooting purposes.',
              ],
            },
          ],
        },
        { p: 'Usage Data is retained in accordance with the retention periods described above, and may be retained longer only where necessary for security, fraud prevention, or legal compliance.' },
        { p: 'We may retain Personal Data beyond the periods stated above for different reasons:' },
        {
          ul: [
            'Legal obligation: We are required by law to retain specific data (e.g., financial records for tax authorities).',
            'Legal claims: Data is necessary to establish, exercise, or defend legal claims.',
            'Your explicit request: You ask Us to retain specific information.',
            'Technical limitations: Data exists in backup systems that are scheduled for routine deletion.',
          ],
        },
        { p: 'You may request information about how long We will retain Your Personal Data by contacting Us.' },
        { p: 'When retention periods expire, We securely delete or anonymize Personal Data according to the following procedures:' },
        {
          ul: [
            'Deletion: Personal Data is removed from Our systems and no longer actively processed.',
            'Backup retention: Residual copies may remain in encrypted backups for a limited period consistent with Our backup retention schedule and are not restored except where necessary for security, disaster recovery, or legal compliance.',
            'Anonymization: In some cases, We convert Personal Data into anonymous statistical data that cannot be linked back to You. This anonymized data may be retained indefinitely for research and analytics.',
          ],
        },
        { h3: 'Transfer of Your Personal Data' },
        { p: 'Your information, including Personal Data, is processed at the Company’s operating offices and in any other places where the parties involved in the processing are located. This means that this information may be transferred to, and maintained on, computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of Your jurisdiction.' },
        { p: 'Where required by applicable law, We will ensure that international transfers of Your Personal Data are subject to appropriate safeguards and, where relevant, supplementary measures. The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place, including the security of Your data and other personal information.' },
        { h3: 'Delete Your Personal Data' },
        { p: 'You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.' },
        { p: 'Our Service may give You the ability to delete certain information about You from within the Service.' },
        { p: 'You may update, amend, or delete Your information at any time by signing in to Your Account, if You have one, and visiting the account settings section that allows You to manage Your personal information. You may also contact Us to request access to, correct, or delete any Personal Data that You have provided to Us.' },
        { p: 'Please note, however, that We may need to retain certain information when We have a legal obligation or lawful basis to do so.' },
        { h3: 'Disclosure of Your Personal Data' },
        { h4: 'Business Transactions' },
        { p: 'If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.' },
        { h4: 'Law Enforcement' },
        { p: 'Under certain circumstances, the Company may disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).' },
        { h4: 'Other Legal Requirements' },
        { p: 'The Company may disclose Your Personal Data in the good-faith belief that such action is necessary to:' },
        {
          ul: [
            'Comply with a legal obligation',
            'Protect and defend the rights or property of the Company',
            'Prevent or investigate possible wrongdoing in connection with the Service',
            'Protect the personal safety of Users of the Service or the public',
            'Protect against legal liability',
          ],
        },
        { h3: 'Security of Your Personal Data' },
        { p: 'The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.' },
      ],
    },
    {
      id: 'processing-details',
      heading: 'Detailed Information on the Processing of Your Personal Data',
      blocks: [
        { p: 'The Service Providers We use may have access to Your Personal Data. These third-party vendors collect, store, use, process and transfer information about Your activity on Our Service in accordance with their Privacy Policies.' },
        { h3: 'Usage, Performance and Miscellaneous' },
        { p: 'We may use third-party Service Providers to maintain and improve Our Service.' },
        {
          ul: [
            {
              paragraphs: [
                '**Mouseflow**',
                'Mouseflow is a session replay and heatmap tool that shows how visitors click, move, scroll, browse, and pay attention on websites. The service is operated by Mouseflow ApS.',
                'Mouseflow service may collect information from Your device.',
                'The information gathered by Mouseflow is held in accordance with its Privacy Policy: [https://mouseflow.com/privacy/](https://mouseflow.com/privacy/)',
              ],
            },
            {
              paragraphs: [
                '**FreshDesk**',
                'FreshDesk is customer support software. The service is operated by Freshworks, Inc.',
                'FreshDesk service may collect information from Your Device.',
                'The information gathered by FreshDesk is held in accordance with its Privacy Policy: [https://www.freshworks.com/privacy/](https://www.freshworks.com/privacy/)',
              ],
            },
            {
              paragraphs: [
                '**Google Places**',
                'Google Places is a service that returns information about places using HTTP requests. It is operated by Google.',
                'Google Places service may collect information from You and from Your Device for security purposes.',
                'The information gathered by Google Places is held in accordance with the Privacy Policy of Google: [https://www.google.com/intl/en/policies/privacy/](https://www.google.com/intl/en/policies/privacy/)',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'children',
      heading: 'Children’s and Minors’ Privacy',
      blocks: [
        { p: 'The Service is not directed to, and We do not knowingly collect Personal Information from, anyone under the age of 16.' },
        { p: 'If You are a parent or guardian and You believe Your child has provided Us with Personal Information, please contact Us. If We become aware that We have collected Personal Information from anyone under the age of 16, We will take steps to remove that information from Our servers as soon as reasonably possible.' },
        { p: 'Some countries and states set a higher age at which an individual can consent to the processing of their own Personal Information. Where We rely on consent as a legal basis and the law applicable to a User sets an age higher than 16, We may require the consent of that User’s parent or guardian before We collect and use their Personal Information.' },
      ],
    },
    {
      id: 'links',
      heading: 'Links to Other Websites',
      blocks: [
        { p: 'Our Service may contain links to other websites that are not operated by Us. If You click on a third-party link, You will be directed to that third party’s site. We strongly advise You to review the Privacy Policy of every site You visit.' },
        { p: 'We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services.' },
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to this Privacy Policy',
      blocks: [
        { p: 'We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.' },
        { p: 'We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.' },
        { p: 'You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.' },
      ],
    },
    { id: 'contact-us', heading: 'Contact Us', blocks: legalContactBlocks('If You have any questions about this Privacy Policy, You can contact Us:', 'Our Website') },
  ] as LegalSection[],
};

export const termsPage = {
  heading: 'Terms and Conditions',
  updated: '2026-10-29',
  intro: ['Please read these terms and conditions carefully before using Our Service.'],
  sections: [
    {
      id: 'interpretation-and-definitions',
      heading: 'Interpretation and Definitions',
      blocks: [
        { h3: 'Interpretation' },
        { p: interpretation },
        { h3: 'Definitions' },
        { p: 'For the purposes of these Terms and Conditions:' },
        {
          ul: [
            affiliate,
            '**Country/State** refers to: New York, United States',
            '**Company** (referred to as either "the Company", "We", "Us" or "Our" in these Terms and Conditions) refers to Orridan.',
            '**Device** means any device that can access the Service such as a computer, a cell phone or a digital tablet.',
            '**Service** refers to the Website.',
            '**Terms and Conditions** (also referred to as "Terms") means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service.',
            '**Third-Party Social Media Service** means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service.',
            website,
            you,
          ],
        },
      ],
    },
    {
      id: 'acknowledgment',
      heading: 'Acknowledgment',
      blocks: [
        { p: 'These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.' },
        { p: 'Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.' },
        { p: 'By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.' },
        { p: 'You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.' },
        { p: 'Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.' },
      ],
    },
    {
      id: 'links',
      heading: 'Links to Other Websites',
      blocks: [
        { p: 'Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.' },
        { p: 'The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such websites or services.' },
        { p: 'We strongly advise You to read the terms and conditions and privacy policies of any third-party websites or services that You visit.' },
        { h3: 'Links from a Third-Party Social Media Service' },
        { p: 'The Service may display, include, make available, or link to content or services provided by a Third-Party Social Media Service. A Third-Party Social Media Service is not owned or controlled by the Company, and the Company does not endorse or assume responsibility for any Third-Party Social Media Service.' },
        { p: 'You acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with Your access to or use of any Third-Party Social Media Service, including any content, goods, or services made available through them. Your use of any Third-Party Social Media Service is governed by that Third-Party Social Media Service’s terms and privacy policies.' },
      ],
    },
    {
      id: 'termination',
      heading: 'Termination',
      blocks: [
        { p: 'We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.' },
        { p: 'Upon termination, Your right to use the Service will cease immediately.' },
      ],
    },
    {
      id: 'limitation-of-liability',
      heading: 'Limitation of Liability',
      blocks: [
        { p: 'Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven’t purchased anything through the Service.' },
        { p: 'To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.' },
        { p: 'Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party’s liability will be limited to the greatest extent permitted by law.' },
      ],
    },
    {
      id: 'disclaimer',
      heading: '"AS IS" and "AS AVAILABLE" Disclaimer',
      blocks: [
        { p: 'The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.' },
        { p: 'Without limiting the foregoing, neither the Company nor any of the company’s provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.' },
        { p: 'Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.' },
      ],
    },
    {
      id: 'governing-law',
      heading: 'Governing Law',
      blocks: [{ p: 'The laws of the Country/State, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.' }],
    },
    {
      id: 'disputes',
      heading: 'Disputes Resolution',
      blocks: [{ p: 'If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.' }],
    },
    {
      id: 'eu-users',
      heading: 'For European Union (EU) Users',
      blocks: [{ p: 'If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.' }],
    },
    {
      id: 'us-compliance',
      heading: 'United States Legal Compliance',
      blocks: [{ p: 'You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a "terrorist supporting" country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.' }],
    },
    {
      id: 'severability-and-waiver',
      heading: 'Severability and Waiver',
      blocks: [
        { h3: 'Severability' },
        { p: 'If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.' },
        { h3: 'Waiver' },
        { p: 'Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party’s ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.' },
      ],
    },
    {
      id: 'translation',
      heading: 'Translation Interpretation',
      blocks: [{ p: 'These Terms and Conditions may have been translated if We have made them available to You on our Service. You agree that the original English text shall prevail in the case of a dispute.' }],
    },
    {
      id: 'changes',
      heading: 'Changes to These Terms and Conditions',
      blocks: [
        { p: 'We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days’ notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.' },
        { p: 'By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the Service.' },
      ],
    },
    { id: 'contact-us', heading: 'Contact Us', blocks: legalContactBlocks('If you have any questions about these Terms and Conditions, You can contact us:', 'our website') },
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
    { name: 'orridan.intro', category: 'Necessary', purpose: 'Plays the opening animation once per visit.', duration: 'Browser session' },
    { name: 'Google reCAPTCHA', category: 'Necessary', purpose: 'Security check on the contact form. Loads only when the form comes into view and may set Google cookies.', duration: 'Set by Google' },
    { name: 'Chatwoot (cw_conversation, cw_user_*)', category: 'Necessary', purpose: 'Live chat with the Orridan team. Loads on every visit and keeps your conversation between visits.', duration: 'Set by Chatwoot' },
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

