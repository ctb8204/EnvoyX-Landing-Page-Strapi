'use strict';

// The landing app renders markdown from shared.rich-text blocks, so these
// bodies are authored in markdown and converted into blocks at import time.
const articleHtml = (sections) => sections.filter(Boolean).join('\n\n').trim();

const paragraph = (text) => text;
const heading = (level, text) => `${'#'.repeat(level)} ${text}`;
const unorderedList = (items) => items.map((item) => `- ${item}`).join('\n');
const orderedList = (items) => items.map((item, index) => `${index + 1}. ${item}`).join('\n');

const publishedAt = '2026-04-06T12:00:00.000Z';

module.exports = {
  authors: [
    {
      name: 'Edwin Tse',
      email: null,
      avatar: null,
    },
  ],
  categories: [
    {
      name: 'Announcement',
      slug: 'announcement',
      description: 'Company announcements and milestone updates.',
    },
    {
      name: 'Insight',
      slug: 'insight',
      description: 'Market, product, and infrastructure analysis from EnvoyX.',
    },
  ],
  articles: [
    {
      title: 'The EnvoyX roadmap: from healthcare invoice financing to credit infrastructure for francophone West Africa',
      slug: 'envoyx-roadmap-healthcare-invoice-financing-to-credit-infrastructure',
      description:
        'EnvoyX is starting with healthcare invoice financing in Cote d\'Ivoire and building toward a broader credit infrastructure layer for francophone West Africa.',
      authorName: 'Edwin Tse',
      categorySlug: 'insight',
      published: true,
      publishedAt,
      coverFile: null,
      blocks: [],
      HTML_Editor: articleHtml([
        paragraph(
          'In many SME markets, the financing problem is not a lack of revenue. It is the timing of revenue. Businesses deliver goods or services, issue valid invoices, and then wait weeks or months to be paid. During that gap, payroll still runs, suppliers still need to be paid, and growth still demands cash.'
        ),
        paragraph('EnvoyX is being built to close that gap with discipline, starting from a narrow problem that matters.'),
        paragraph(
          'The initial wedge is healthcare invoice financing in Cote d\'Ivoire. Healthcare providers submit reimbursement invoices, those assets go through verification and risk checks, financiers can assess them more cleanly, and businesses gain faster access to working capital. That is the beginning, not the ceiling.'
        ),
        paragraph(
          'The broader roadmap is a credit infrastructure layer for asset-based financing in francophone West Africa. The point is not to ship one financing feature. The point is to build the operating layer that makes repeatable financing possible.'
        ),
        heading(2, 'Phase 1: Solve one painful financing problem extremely well'),
        paragraph(
          'The first phase is intentionally narrow. EnvoyX starts with healthcare MSMEs in Cote d\'Ivoire that are waiting on reimbursement invoices. That is a strong entry point because the liquidity pain is recurring and the underlying asset is understandable.'
        ),
        paragraph(
          'This is the core loop EnvoyX needs to prove: MSME onboarding, eligibility and risk scoring, invoice submission, asset checks, partner routing, disbursement, repayment tracking, and performance feedback. If that loop becomes dependable, the business has a real foundation.'
        ),
        heading(2, 'Phase 2: Turn invoice financing into an operating system'),
        paragraph(
          'The second phase is about depth. EnvoyX Core is being designed to automate as much of the financing lifecycle as possible while still allowing human review where it improves control.'
        ),
        unorderedList([
          'MSME onboarding and eligibility management',
          'Rules-based credit product configuration',
          'Risk and exposure checks',
          'Partner and contract management',
          'Invoice financing operations',
          'Loanbook and performance tracking',
          'System-generated ledgering',
          'Payer intelligence',
          'Permissions, audit trails, and lifecycle automation',
        ]),
        paragraph(
          'That is what separates a manual financing workflow from financing infrastructure. Instead of treating each advance as a one-off, EnvoyX is building reusable rules, machine-readable contracts, and a system where each financing event feeds the next decision.'
        ),
        heading(2, 'Phase 3: Make financiers native to the system'),
        paragraph(
          'Capital providers rarely avoid SME financing because the opportunity is too small. More often, they avoid it because the operating burden is too high and the risk picture is too fragmented. EnvoyX is being built to improve that equation.'
        ),
        unorderedList([
          'Verified deal flow',
          'Structured borrower and asset data',
          'Contract-level controls',
          'Routing logic and approval requirements',
          'Portfolio visibility and repayment tracking',
          'Auditability across each financing event',
        ]),
        paragraph(
          'A critical product decision here is to push pricing, exposure controls, and repayment logic down to the contract layer. Different capital providers will have different economics and approval rules. The platform should support that without hard-coding one funding structure into the whole system.'
        ),
        heading(2, 'Phase 4: Strengthen payer-side intelligence'),
        paragraph(
          'Strong credit infrastructure depends on confidence in the underlying asset and the payer behind it. In the first version, invoice validation is still manual. Over time, payer-side integrations can strengthen verification, reconciliation, and accounts payable workflows.'
        ),
        paragraph(
          'That matters because good underwriting is never only about the borrower. It also depends on confidence in who owes the money, how invoices are approved, and how payment behavior is tracked over time.'
        ),
        heading(2, 'Phase 5: Expand beyond one invoice type and one vertical'),
        paragraph(
          'Healthcare reimbursement invoices are the proving ground, not the final destination. The longer-term roadmap points to additional invoice types, more SME sectors, broader receivables financing, and eventually other forms of structured credit built on the same lifecycle engine.'
        ),
        paragraph(
          'The key design principle is reuse. New products should extend through the same chain of product, contract, asset, loan account, ledger, and performance, rather than forcing the system to be rebuilt each time.'
        ),
        heading(2, 'Why this roadmap matters now'),
        paragraph(
          'A roadmap only matters if it is tied to real commercial motion. EnvoyX is pairing product architecture with partner logic, financing conversations, and early institutional signals that make the opportunity more concrete.'
        ),
        paragraph(
          'That is the strongest honest story at this stage. EnvoyX is not trying to be a generic fintech for SMEs. It is starting with one painful financing wedge, building the operating layer beneath it, and turning that architecture into deployable trust infrastructure over time.'
        ),
      ]),
    },
    {
      title: 'Where EnvoyX stands now: current progress, recent milestones, and what comes next',
      slug: 'where-envoyx-stands-now-april-2026',
      description:
        'EnvoyX has sharpened its wedge, clarified its contract and product architecture, and started pairing product depth with investor-facing communication and financing momentum.',
      authorName: 'Edwin Tse',
      categorySlug: 'business',
      published: true,
      publishedAt,
      coverFile: null,
      blocks: [],
      HTML_Editor: articleHtml([
        paragraph(
          'For early-stage infrastructure companies, progress is rarely a straight line. The real work is narrowing the wedge, structuring the system correctly, aligning financing mechanics, and turning internal architecture into something dependable enough to operate in the real world.'
        ),
        paragraph('That is the phase EnvoyX is in now, and the picture is materially clearer than it was a few weeks ago.'),
        heading(2, 'The immediate product direction is tighter'),
        paragraph(
          'EnvoyX is now clearly anchored around healthcare invoice financing in Cote d\'Ivoire as the immediate wedge. That narrowing matters. It reduces distraction, sharpens execution, and forces the team to get the first implementation right before generalizing too early.'
        ),
        paragraph(
          'Under the hood, the architecture is not shallow. The core system spans onboarding, rules, partner contracts, invoice operations, disbursement, repayment tracking, ledgering, payer intelligence, permissions, and automation. That is a real operating layer, not just a front-end financing flow.'
        ),
        heading(2, 'Pricing and contract logic are moving to the right layer'),
        paragraph(
          'Another important step has been clarifying where financing logic belongs. Different capital providers will come with different rates, tenors, exposure limits, and approval conditions. The right place to model that is the contract layer, not a one-size-fits-all product shell.'
        ),
        paragraph(
          'That creates a cleaner path for supporting multiple funding partners over time while keeping the overall product structure stable. It also makes margin visibility more legible by separating what the business pays, what the funding partner charges, and what remains as spread.'
        ),
        heading(2, 'A meaningful financing signal has arrived'),
        paragraph(
          'One of the most important recent milestones is a proposed Afreximbank term sheet for a EUR 1 million factoring line in favor of EnvoyX Sarl, Cote d\'Ivoire. The headline matters because it signals institutional interest in how capital could move through the EnvoyX model.'
        ),
        paragraph(
          'The term sheet outlines a facility of up to EUR 1 million, financing of up to 80 percent of eligible invoice value, a 5 percent debt service reserve requirement, a 1 percent facility fee, annual review, and supporting underwriting and documentation conditions. It is not the same as a fully deployed facility, but it is meaningful validation at this stage.'
        ),
        heading(2, 'Communication infrastructure is taking shape'),
        paragraph(
          'Another important form of progress is communication discipline. The team has already started building the scaffolding for a recurring investor newsletter, a more regular article cadence, and a tighter rhythm between product milestones and outward-facing communication.'
        ),
        paragraph(
          'That matters because confidence at this stage is built through rhythm, not hype. A company that can explain what it is building, what changed, what is blocked, and what comes next is easier to trust than one that only speaks in isolated milestone bursts.'
        ),
        heading(2, 'What is still unfinished'),
        paragraph(
          'The honest version is that product depth is currently ahead of verified runtime confidence. Recent review surfaced an authentication or session-routing issue that still blocks clean end-to-end testing in part of the flow.'
        ),
        paragraph(
          'That is not a reason to blur the story. It is a reason to separate product vision from production proof. At the moment, the strongest summary is simple: the architecture is strong, the wedge is clear, the financing story is getting stronger, and the communication layer is forming, but end-to-end confidence still needs to be earned through testing and validation.'
        ),
        heading(2, 'What comes next'),
        orderedList([
          'Stabilize the access and session-routing issues that currently block flow validation.',
          'Run structured end-to-end testing across onboarding, invoice submission, routing, disbursement, repayment, and reporting.',
          'Package the strongest milestones into clearer investor-facing communication.',
          'Maintain a consistent cadence across newsletter, articles, and social communication.',
        ]),
        paragraph(
          'The real progress story at EnvoyX is not just that features are being built. It is that the company is becoming more legible. The focus is sharper, the financing mechanics are clearer, and the bridge between architecture and communication is finally starting to close.'
        ),
      ]),
    },
    {
      title: 'EnvoyX Secures EUR 1M Factoring Facility to Power SME Liquidity in Cote d\'Ivoire',
      slug: 'envoyx-secures-eur-1m-factoring-facility-cote-divoire',
      description:
        'EnvoyX has closed a EUR 1 million factoring facility to support invoice-backed working capital for businesses in Cote d\'Ivoire, marking a major milestone in its growth.',
      authorName: 'Edwin Tse',
      categorySlug: 'announcement',
      published: true,
      publishedAt,
      coverFile: 'envoyx-cover-envoyx-secures-eur-1m-factoring-facility-cote-divoire.png',
      blocks: [],
      HTML_Editor: articleHtml([
        heading(
          4,
          'EnvoyX has officially closed a EUR 1 million factoring facility, marking a pivotal moment in its mission to build the financial infrastructure for SMEs across francophone West Africa.'
        ),
        heading(
          5,
          'We are proud to announce that EnvoyX has closed a EUR 1 million factoring facility to support invoice-backed working capital for businesses in Cote d\'Ivoire.'
        ),
        paragraph(
          'For EnvoyX, this is an important milestone in the company\'s growth. It strengthens our ability to finance qualifying invoices and reinforces the path we are taking to improve access to timely liquidity for SMEs operating in essential sectors of the economy.'
        ),
        paragraph(
          'Too many businesses are constrained not by lack of demand, but by delayed payment cycles. They deliver value, issue valid invoices, and then wait too long to receive the cash they have already earned. That delay creates pressure on operations, payroll, supplier relationships, and growth.'
        ),
        paragraph('This facility helps us address that challenge more directly.'),
        paragraph(
          'Structured as a factoring line, the facility is designed to enable financing of up to 80 percent of eligible invoice value, giving businesses faster access to working capital while creating a more disciplined and reliable framework for execution.'
        ),
        paragraph(
          'It also reflects growing institutional confidence in the importance of building stronger financing pathways for SMEs in Cote d\'Ivoire. For us, that confidence matters because infrastructure businesses are judged not only by product ambition, but by whether capital can move through the system with credibility.'
        ),
        paragraph(
          'We see this as a meaningful step forward in our mission to help businesses unlock cash flow faster and operate with greater confidence.'
        ),
        paragraph(
          'It is a milestone, but it is also the beginning of a larger chapter. EnvoyX remains focused on disciplined execution, responsible growth, and building a stronger foundation for SME finance in the region.'
        ),
      ]),
    },
    {
      title: 'Why the Afreximbank term sheet matters',
      slug: 'why-the-afreximbank-term-sheet-matters',
      description:
        'A term sheet is not a closed facility, but it can still be a meaningful institutional signal when a credit infrastructure company is validating how capital may flow through its model.',
      authorName: 'Edwin Tse',
      categorySlug: 'announcement',
      published: false,
      coverFile: null,
      blocks: [],
      HTML_Editor: articleHtml([
        paragraph(
          'Most people outside structured finance do not immediately understand why a term sheet matters. It can sound too early to celebrate and too technical to explain. In practice, it often matters because it shows that institutional counterparties are willing to engage with the structure, underwriting logic, and operating model behind the business.'
        ),
        paragraph(
          'For EnvoyX, the Afreximbank term sheet matters because it makes the financing side of the story more legible. It shows that the model is not being discussed only in product terms. It is also being examined in the language of facility structure, reserve requirements, eligibility criteria, and disciplined capital deployment.'
        ),
        heading(2, 'What it enables'),
        unorderedList([
          'A clearer path for invoice-backed liquidity to move through the platform',
          'A stronger institutional validation signal for partners and investors',
          'A more concrete framework for how underwriting and operational controls need to work',
        ]),
        heading(2, 'What it does not mean yet'),
        unorderedList([
          'It does not automatically mean the facility is fully documented, deployed, and live in production',
          'It does not eliminate the need for execution discipline and operating proof',
          'It does not replace the need for product validation across the actual financing workflow',
        ]),
        paragraph(
          'At this stage, the right frame is not hype for hype\'s sake. The right frame is that institutional engagement is increasing, the model is becoming easier to explain, and the company now has a better platform for turning product architecture into real financing motion.'
        ),
      ]),
    },
    {
      title: 'Why SME credit infrastructure is broken in francophone West Africa',
      slug: 'why-sme-credit-infrastructure-is-broken-in-francophone-west-africa',
      description:
        'The problem is not only lack of capital. It is the absence of dependable infrastructure for verification, underwriting, routing, repayment tracking, and portfolio visibility.',
      authorName: 'Edwin Tse',
      categorySlug: 'insight',
      published: false,
      coverFile: null,
      blocks: [],
      HTML_Editor: articleHtml([
        paragraph(
          'The conversation around SME finance often gets reduced to a single diagnosis: not enough capital. That explanation is incomplete. In many markets, capital is constrained because the infrastructure required to deploy it with confidence is weak.'
        ),
        paragraph(
          'When borrower information is fragmented, invoice validation is inconsistent, contract structures are not standardized, and repayment monitoring is weak, the result is predictable. Capital providers either step back or demand terms that make financing inaccessible to the businesses that need it most.'
        ),
        paragraph(
          'That is why the deeper problem is not simply liquidity. It is trust infrastructure. Without better systems for verification, risk controls, disbursement logic, and ongoing monitoring, the cost of underwriting remains high and the visibility required for institutional confidence remains low.'
        ),
        paragraph(
          'EnvoyX\'s thesis is that fixing SME finance requires more than a marketplace or a lending surface. It requires an operating layer that reduces uncertainty across the lifecycle of each financing event.'
        ),
      ]),
    },
    {
      title: 'Why invoice financing is the beachhead',
      slug: 'why-invoice-financing-is-the-beachhead',
      description:
        'Invoice financing is a disciplined starting point because the pain is recurring, the asset is legible, and the operational loop creates the data needed for broader credit infrastructure over time.',
      authorName: 'Edwin Tse',
      categorySlug: 'insight',
      published: false,
      coverFile: null,
      blocks: [],
      HTML_Editor: articleHtml([
        paragraph(
          'A good wedge solves a painful problem today while teaching the system how to scale tomorrow. For EnvoyX, invoice financing fits that requirement better than a broad attempt to solve every form of SME credit at once.'
        ),
        paragraph(
          'The pain is direct. Businesses with valid receivables still face cash pressure long before they are paid. The asset is also easier to reason about than many other financing categories because the claim, payer, amount, and maturity are more concrete.'
        ),
        paragraph(
          'Just as importantly, the workflow produces useful data. Onboarding, invoice submission, asset checks, routing, disbursement, and repayment tracking all feed the operating layer that later products will depend on. That is why invoice financing is not just a product choice. It is the right beachhead for building credit infrastructure.'
        ),
      ]),
    },
    {
      title: 'Why trust infrastructure matters more than feature count',
      slug: 'why-trust-infrastructure-matters-more-than-feature-count',
      description:
        'In financial infrastructure, the strongest product is not the one with the most features. It is the one that reduces uncertainty for every party involved in the flow of capital.',
      authorName: 'Edwin Tse',
      categorySlug: 'insight',
      published: false,
      coverFile: null,
      blocks: [],
      HTML_Editor: articleHtml([
        paragraph(
          'Financial products are easy to over-describe and hard to operationalize. Teams can spend months adding interface features while leaving the underlying trust problem untouched.'
        ),
        paragraph(
          'In practice, capital moves when uncertainty falls. Borrowers need clarity on eligibility and disbursement timing. Financiers need visibility into asset quality, exposure, and controls. Payers need reliable approval and reconciliation. Internal teams need auditability and permissions that hold under pressure.'
        ),
        paragraph(
          'That is why trust infrastructure matters more than feature count. A smaller product with stronger verification, clearer controls, and better operational traceability can be more valuable than a broader product that still depends on fragile manual intervention.'
        ),
      ]),
    },
    {
      title: 'What EnvoyX is and is not',
      slug: 'what-envoyx-is-and-is-not',
      description:
        'EnvoyX is building financial infrastructure for asset-based financing. It is not a bank, not a generic ERP, and not a claim that every layer of automation is already live today.',
      authorName: 'Edwin Tse',
      categorySlug: 'resources',
      published: false,
      coverFile: null,
      blocks: [],
      HTML_Editor: articleHtml([
        heading(2, 'What EnvoyX is'),
        unorderedList([
          'A company building financial infrastructure for asset-based financing in francophone West Africa',
          'Initially focused on healthcare invoice financing in Cote d\'Ivoire',
          'A platform designed to automate underwriting, verification, routing, disbursement, repayment tracking, and portfolio visibility over time',
        ]),
        heading(2, 'What EnvoyX is not'),
        unorderedList([
          'Not a bank',
          'Not a generic lender description with no operating depth behind it',
          'Not a claim that the full platform is already launched end to end',
          'Not a claim that every workflow is fully automated today',
          'Not a generic ERP framed as a financing company',
        ]),
        paragraph(
          'This distinction matters because strong companies become easier to trust when their story is precise. Clear boundaries are not a weakness in the narrative. They are part of what makes the narrative credible.'
        ),
      ]),
    },
    {
      title: 'Why now: proof points behind the EnvoyX wedge',
      slug: 'why-now-proof-points-behind-the-envoyx-wedge',
      description:
        'The most credible near-term proof points are a clear healthcare invoice wedge, strong system depth, institutional financing interest, and a product thesis built around reducing uncertainty.',
      authorName: 'Edwin Tse',
      categorySlug: 'insight',
      published: false,
      coverFile: null,
      blocks: [],
      HTML_Editor: articleHtml([
        paragraph(
          'A strong early-stage narrative needs repeatable proof points. For EnvoyX, the strongest ones are not vanity metrics. They are structural signals that the business is becoming more concrete.'
        ),
        unorderedList([
          'A clear starting wedge in healthcare invoice financing',
          'A product architecture that covers the operational lifecycle, not just application intake',
          'Institutional financing engagement that strengthens the capital story',
          'A trust-infrastructure thesis that matches how asset-based financing actually gets executed',
        ]),
        paragraph(
          'These proof points matter because they make the company easier to understand across audiences. They help customers, partners, financiers, and investors see the same business from different angles without changing the underlying story.'
        ),
      ]),
    },
    {
      title: 'EnvoyX launch language stack',
      slug: 'envoyx-launch-language-stack',
      description:
        'A reusable set of company descriptions, pitch language, investor blurbs, customer blurbs, announcement headlines, and social hooks for consistent communication.',
      authorName: 'Edwin Tse',
      categorySlug: 'resources',
      published: false,
      coverFile: null,
      blocks: [],
      HTML_Editor: articleHtml([
        heading(2, 'One-sentence company description'),
        paragraph(
          'EnvoyX is building the financial infrastructure for asset-based SME financing in francophone West Africa, starting with healthcare invoice financing in Cote d\'Ivoire.'
        ),
        heading(2, '30-second pitch'),
        paragraph(
          'EnvoyX helps turn valid receivables into faster working capital through a financing infrastructure layer built for verification, underwriting, routing, disbursement, repayment tracking, and portfolio visibility. We are starting with healthcare invoice financing in Cote d\'Ivoire and building toward broader credit infrastructure for francophone West Africa.'
        ),
        heading(2, '100-word investor blurb'),
        paragraph(
          'EnvoyX is building a credit infrastructure layer for asset-based financing in francophone West Africa, beginning with healthcare invoice financing in Cote d\'Ivoire. The company is focused on the operational layer behind credit: underwriting, verification, contract logic, routing, disbursement, repayment tracking, and portfolio visibility. Its current story is strongest at the intersection of a clear market wedge, serious product depth, and institutional financing momentum. Over time, the platform is designed to support a broader set of receivables and structured credit workflows for MSMEs, financiers, and larger organizations.'
        ),
        heading(2, '100-word customer blurb'),
        paragraph(
          'EnvoyX is designed to help businesses access working capital faster by financing eligible invoices through a more structured and reliable process. We are beginning with healthcare invoice financing in Cote d\'Ivoire, where delayed reimbursement cycles can create serious operating pressure. Our goal is to reduce the friction between valid receivables and usable liquidity while building better visibility for businesses and financing partners alike.'
        ),
        heading(2, 'Announcement headline options'),
        unorderedList([
          'EnvoyX sharpens its healthcare financing wedge in Cote d\'Ivoire',
          'Building the infrastructure behind invoice-backed SME finance',
          'EnvoyX and the next phase of credit infrastructure in francophone West Africa',
          'From delayed revenue to deployable liquidity: the EnvoyX thesis',
          'Why EnvoyX is starting with healthcare invoice financing',
        ]),
        heading(2, 'Repeatable social hooks'),
        unorderedList([
          'The SME financing problem is often delayed revenue, not missing revenue.',
          'We are starting where the cash-flow pain is immediate: healthcare invoice financing.',
          'We are not building a lending app. We are building the infrastructure layer behind asset-based credit.',
          'The strongest fintech systems do not just move money. They reduce uncertainty.',
          'Trust infrastructure matters more than feature count.',
        ]),
      ]),
    },
    {
      title: 'EnvoyX 30-day content sequence',
      slug: 'envoyx-30-day-content-sequence',
      description:
        'A four-week editorial sequence that turns product and financing milestones into a consistent investor, article, and social communication rhythm.',
      authorName: 'Edwin Tse',
      categorySlug: 'resources',
      published: false,
      coverFile: null,
      blocks: [],
      HTML_Editor: articleHtml([
        paragraph(
          'Content should compound with product motion rather than sit beside it. The right sequence gives each milestone more surface area and turns one update into multiple useful assets.'
        ),
        heading(2, 'Week 1'),
        unorderedList([
          'Publish the roadmap article',
          'Send the investor newsletter',
          'Post a founder note on why the Afreximbank signal matters',
        ]),
        heading(2, 'Week 2'),
        unorderedList([
          'Publish the current progress article',
          'Release a visual post explaining how invoice financing works',
          'Record one podcast or interview conversation with a banker, operator, or funder',
        ]),
        heading(2, 'Week 3'),
        unorderedList([
          'Publish a what-we-are-building explainer carousel',
          'Share a founder post on the trust-infrastructure thesis',
          'Cut short podcast clips into social snippets',
        ]),
        heading(2, 'Week 4'),
        unorderedList([
          'Send a short investor follow-up note with product and testing updates',
          'Post bilingual milestone graphics',
          'Release a term-sheet explainer one-pager or visual thread',
        ]),
        heading(2, 'Milestone workflow'),
        orderedList([
          'Internal update',
          'Investor note',
          'Article or blog post',
          'Founder post',
          'Visual carousel',
          'Short-form clip',
          'Podcast talking point',
        ]),
      ]),
    },
  ],
  newsletterIssue: {
    title: 'Investor Connection - April 2026',
    slug: 'investor-connection-april-2026',
    overwriteExistingSlug: 'envoyx-monthly-update-preview',
    subject: 'EnvoyX Investor Connection - April 2026',
    preheader:
      'A sharper product wedge, a proposed EUR 1M financing line, and the next phase of execution for EnvoyX.',
    issueDate: '2026-04-06',
    intro:
      'This month, EnvoyX became materially clearer. We tightened the immediate product focus, improved the structure around how we communicate progress, and added a meaningful financing signal to the story. We are still in build-and-validate mode, but the direction is sharper than before.',
    featuredArticleSlugs: [
      'envoyx-roadmap-healthcare-invoice-financing-to-credit-infrastructure',
      'where-envoyx-stands-now-april-2026',
      'envoyx-secures-eur-1m-factoring-facility-cote-divoire',
    ],
    headerImageFile: null,
    productUpdateTitle: 'Product and execution update',
    productUpdateBody:
      'Our immediate wedge is now clearly healthcare invoice financing in Cote d\'Ivoire. Internally, we are keeping the operating model tightly scoped while pushing pricing, funding terms, and partner logic down to the contract layer. The biggest short-term priority remains validation: resolving the current auth or session-routing blocker and then running deeper end-to-end testing across onboarding, invoice handling, routing, disbursement, repayment, and reporting.',
    ecosystemInsightTitle: 'Visibility, narrative, and the next phase',
    ecosystemInsightBody:
      'We are becoming more deliberate about how product work turns into outward-facing communication. That means a stronger monthly investor rhythm, tighter article cadence, and clearer packaging of milestones like the proposed Afreximbank financing signal. We also see bilingual visibility as increasingly important, especially for a company building for francophone markets. The work ahead is simple: prove the flows, tighten reliability, and keep communicating progress with consistency.',
    ctaLabel: 'Contact EnvoyX',
    ctaUrl: 'https://www.tryenvoyx.com/en/contact',
  },
};
