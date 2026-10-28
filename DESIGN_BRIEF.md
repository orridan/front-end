# Design brief: "The Engineering Drawing, Alive"

**Concept.** Orridan keeps the records behind industrial assets, so the site is drawn as a living
technical drawing. Navy is the drafting film, pink and blush are the ink, and the light sections
read as clean drafting paper. Nothing pretends to be a dashboard screenshot. Everything is
construction geometry that measures out, snaps into place and labels itself.

**Signature motif.** Construction lines, dimension arrows with mono measurements, callout leaders
ending in small mono labels, corner crop marks around panels, and a drawing title block. A
12-column guide grid with column labels (A to L) runs behind the page on desktop. A mono section
tag (for example `03 / FEATURES`) gives every section a sheet reference. Type pairs Big Shoulders
Display (oversized, tight, solid and outline words mixed) with JetBrains Mono for every label and
Inter for reading text. All three are self-hosted. Lines are 0.5 to 1px, shadows are nearly gone,
and depth comes from layered lines, glow and overlap.

**How each part differs from a template**

| Part | Standard template | This site |
|---|---|---|
| Nav | Full-width top bar | Floating command capsule: logo inside a scroll-progress ring, sliding pink indicator, one CTA, condenses to ring plus Menu, mono active-section label beside it |
| Mobile menu | Stacked links | Full-screen asset tree (Facility, Line, Asset branches) whose branch lines draw in |
| Hero | Headline plus product shot | Blueprint ring with dimension lines, angle arcs and four callouts (Asset, Twin, Scenario, Result) that snap in; decorative drawing-header strips top and bottom |
| Pillars | Three icon columns | One dimension chain: three nodes on an arrowed measuring line |
| Features | Centered heading, card grid | Asymmetric overlapping bento joined by leader lines, one tall pink card, a different micro-animation per card |
| How It Works | Numbered cards | Central blueprint spine with numbered nodes and alternating callouts; progress line fills on scroll |
| Result vs Expectation | Sliders and bars | Instrument panel: arc gauge with tolerance band, needle and mono readout |
| Built for / Who uses it | Two sections plus carousel | One tabbed explorer: organisation types on the left, their roles on the right |
| About | Text plus image | Split with a huge outline "Orridan", values as stamped labels on drafting paper |
| Pricing | Three cards | Comparison board: plan columns with the highlighted plan raised, sticky header row, stacked cards on mobile |
| FAQ | Accordion | Two-pane index (numbered questions, answer panel); accordion on mobile |
| Contact | Plain form | Work order with grid-referenced fields and a separate title-block card for company details |
| Footer | Four link columns | Engineering title block: Drawing, Revision, Sheet, Scale, Contact and Index cells, a "revision request" newsletter strip, giant outline wordmark that fills on scroll |

**Rules.** Same four colours, AA contrast, transform and opacity animation only, nothing hidden
if scripts fail, reduced motion turns every animation off. The drawing strips use obviously
decorative values (DWG 001 / REV A / SCALE 1:1), never fake data.

## Deviations

- **Dashboard link placement.** The redesign prompt asks for an "Open the Dashboard" button in
  the closing banner and a "Dashboard" row in the footer index. The client's earlier instruction
  is that only the product page links to the dashboard, so the banner button goes to /product and
  the footer index has no Dashboard row. Both are enforced by `check:links` and e2e.
- **Built for / Who uses it.** The explorer needs to know which roles belong to which organisation
  type. That grouping is new data, added to `content.ts` as role ids per type, with no new copy.
- **Logo.** The logo wordmark stays in Sora so the favicons, OG image and brand files remain
  unchanged as required. Headlines use the new display face.
