import { CVProfile, ThemeSettings } from '../types/cv';

export const defaultTheme: ThemeSettings = {
  primaryColor: '#2563eb',   // Royal Blue
  accentColor: '#1d4ed8',
  textColor: '#0f172a',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter',
  fontSizeScale: 'md',
  lineHeight: 1.45,
  columnGap: 24,
  sectionSpacing: 'normal',
  pageMargins: 'normal',
  borderRadius: 6,
  headerStyle: 'classic',
  dividerStyle: 'solid',
  bulletStyle: 'disc',
  textAlignment: 'left',
};

/**
 * Catalog behind the "Demo Templates" picker — each entry is one selectable
 * sample. Order matters: `DemoTemplateModal` maps its cards to these indices.
 */
export const demoProfiles: CVProfile[] = [
  {
    id: 'demo-software-engineer',
    title: 'Senior Frontend Engineer (US Remote)',
    language: 'en-US',
    isFavorite: true,
    isArchived: false,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000,
    templateId: 'modern-tech',
    personal: {
      fullName: 'Alex Morgan',
      jobTitle: 'Senior Frontend Engineer',
      email: 'alex.morgan@devmail.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA (Remote)',
      linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
      githubUrl: 'https://github.com/alexmorgan-dev',
      portfolioUrl: 'https://alexmorgan.dev',
      photoFormat: 'circle',
    },
    summary: 'Results-driven Senior Frontend Engineer with 7+ years of experience building high-scale React, TypeScript, and web applications. Spearheaded frontend performance optimizations that improved page load speed by 42% for over 2M active monthly users. Passionate about web accessiblity, clean architecture, and offline-first PWA applications.',
    sectionsOrder: ['sec-exp', 'sec-skills', 'sec-edu', 'sec-proj', 'sec-lang'],
    sections: {
      'sec-exp': {
        id: 'sec-exp',
        type: 'experience',
        title: 'Work Experience',
        column: 'main',
        visible: true,
        items: [
          {
            id: 'exp-1',
            title: 'Senior Frontend Engineer',
            subtitle: 'TechScale Cloud Inc.',
            location: 'San Francisco, CA',
            startDate: 'Jan 2022',
            endDate: 'Present',
            current: true,
            bulletItems: [
              {
                id: 'b-1',
                text: 'Architected and migrated legacy dashboard to React 19 and Next.js App Router, resulting in a 42% reduction in initial bundle size.',
                enabled: true,
                isMetricHighlighted: true,
              },
              {
                id: 'b-2',
                text: 'Spearheaded design system component library adopted across 14 internal product teams, improving UI velocity by 35%.',
                enabled: true,
                isMetricHighlighted: true,
              },
              {
                id: 'b-3',
                text: 'Mentored 5 junior developers through code reviews, paired programming, and technical architecture workshops.',
                enabled: true,
              },
            ],
            tags: ['React 19', 'TypeScript', 'Tailwind CSS', 'Zustand'],
          },
          {
            id: 'exp-2',
            title: 'Frontend Web Developer',
            subtitle: 'Nexus Digital Solutions',
            location: 'Austin, TX',
            startDate: 'Mar 2019',
            endDate: 'Dec 2021',
            current: false,
            bulletItems: [
              {
                id: 'b-4',
                text: 'Engineered real-time data visualization charts using D3.js and WebSockets, rendering 50,000+ data points smoothly at 60 FPS.',
                enabled: true,
                isMetricHighlighted: true,
              },
              {
                id: 'b-5',
                text: 'Implemented comprehensive E2E testing pipeline with Playwright and GitHub Actions, cutting production regression bugs by 60%.',
                enabled: true,
                isMetricHighlighted: true,
              },
            ],
            tags: ['React', 'TypeScript', 'D3.js', 'Playwright'],
          },
        ],
      },
      'sec-skills': {
        id: 'sec-skills',
        type: 'skills',
        title: 'Technical Skills',
        column: 'sidebar',
        visible: true,
        items: [
          {
            id: 'sk-1',
            title: 'Frontend Core',
            subtitle: 'Expert',
            bulletItems: [
              { id: 'b-sk1', text: 'React 19, TypeScript, JavaScript (ESNext), HTML5/CSS3', enabled: true },
            ],
          },
          {
            id: 'sk-2',
            title: 'State & Styling',
            subtitle: 'Advanced',
            bulletItems: [
              { id: 'b-sk2', text: 'Tailwind CSS v4, Zustand, Redux Toolkit, CSS Modules', enabled: true },
            ],
          },
          {
            id: 'sk-3',
            title: 'Testing & Build',
            subtitle: 'Advanced',
            bulletItems: [
              { id: 'b-sk3', text: 'Vite, Vitest, Playwright, Webpack, Git, CI/CD', enabled: true },
            ],
          },
        ],
      },
      'sec-edu': {
        id: 'sec-edu',
        type: 'education',
        title: 'Education',
        column: 'main',
        visible: true,
        items: [
          {
            id: 'edu-1',
            title: 'B.S. in Computer Science',
            subtitle: 'University of California, Berkeley',
            location: 'Berkeley, CA',
            startDate: 'Aug 2015',
            endDate: 'May 2019',
            bulletItems: [
              { id: 'b-edu1', text: 'Graduated with Honors (GPA 3.85 / 4.0). Specialization in Software Systems and Human-Computer Interaction.', enabled: true },
            ],
          },
        ],
      },
      'sec-proj': {
        id: 'sec-proj',
        type: 'projects',
        title: 'Featured Projects',
        column: 'main',
        visible: true,
        items: [
          {
            id: 'proj-1',
            title: 'cvire — Modern Client-Side CV Builder',
            subtitle: 'Creator & Maintainer',
            startDate: '2026',
            bulletItems: [
              { id: 'b-pr1', text: 'Created an offline-first PWA resume builder supporting multi-profile Dexie.js database storage and real-time A4 pagination.', enabled: true },
            ],
            linkUrl: 'https://github.com/djlabz/cvire',
            tags: ['React 19', 'TypeScript', 'IndexedDB', '@react-pdf/renderer'],
          },
        ],
      },
      'sec-lang': {
        id: 'sec-lang',
        type: 'languages',
        title: 'Languages',
        column: 'sidebar',
        visible: true,
        items: [
          {
            id: 'lang-1',
            title: 'English',
            subtitle: 'Native / Fluent',
            bulletItems: [],
          },
          {
            id: 'lang-2',
            title: 'Portuguese',
            subtitle: 'Full Professional Proficiency',
            bulletItems: [],
          },
        ],
      },
    },
    theme: defaultTheme,
  },
  {
    id: 'demo-product-designer',
    title: 'UI/UX Product Designer (Hybrid)',
    language: 'en-US',
    isFavorite: false,
    isArchived: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 7200000,
    templateId: 'creative-accent',
    personal: {
      fullName: 'Riley Chen',
      jobTitle: 'Senior Product Designer',
      email: 'riley.chen@designmail.com',
      phone: '+1 (555) 907-3312',
      location: 'Seattle, WA (Hybrid)',
      linkedinUrl: 'https://linkedin.com/in/rileychen-design',
      portfolioUrl: 'https://rileychen.design',
      photoFormat: 'circle',
    },
    summary: 'Senior Product Designer with 8 years shaping end-to-end experiences for B2B SaaS and consumer mobile. Led the redesign of a checkout flow that lifted completion by 27%, and built the design system now used by 6 product squads. Fluent in research-to-handoff: discovery interviews, prototyping, accessibility audits, and shipping alongside engineers.',
    sectionsOrder: ['dsn-exp', 'dsn-skills', 'dsn-edu', 'dsn-proj', 'dsn-lang'],
    sections: {
      'dsn-exp': {
        id: 'dsn-exp',
        type: 'experience',
        title: 'Work Experience',
        column: 'main',
        visible: true,
        items: [
          {
            id: 'dsn-exp-1',
            title: 'Senior Product Designer',
            subtitle: 'Northwind Commerce',
            location: 'Seattle, WA',
            startDate: 'Apr 2021',
            endDate: 'Present',
            current: true,
            bulletItems: [
              {
                id: 'dsn-b-1',
                text: 'Redesigned the multi-step checkout flow from research through handoff, lifting completion rate by 27% across 1.4M monthly sessions.',
                enabled: true,
                isMetricHighlighted: true,
              },
              {
                id: 'dsn-b-2',
                text: 'Built and documented a Figma design system of 120+ components, adopted by 6 product squads and cutting design-to-dev handoff time by 40%.',
                enabled: true,
                isMetricHighlighted: true,
              },
              {
                id: 'dsn-b-3',
                text: 'Ran a WCAG 2.2 AA accessibility audit across the core purchase funnel and drove remediation of 34 blocking issues with the frontend team.',
                enabled: true,
              },
            ],
            tags: ['Figma', 'Design Systems', 'Accessibility', 'Prototyping'],
          },
          {
            id: 'dsn-exp-2',
            title: 'Product Designer',
            subtitle: 'Lumen Health',
            location: 'Portland, OR',
            startDate: 'Jun 2018',
            endDate: 'Mar 2021',
            current: false,
            bulletItems: [
              {
                id: 'dsn-b-4',
                text: 'Designed the patient onboarding experience for iOS and Android, reducing drop-off between signup and first appointment by 31%.',
                enabled: true,
                isMetricHighlighted: true,
              },
              {
                id: 'dsn-b-5',
                text: 'Led 40+ moderated usability sessions and synthesized findings into a research repository that shaped three quarterly roadmaps.',
                enabled: true,
              },
            ],
            tags: ['User Research', 'Mobile Design', 'Usability Testing'],
          },
        ],
      },
      'dsn-skills': {
        id: 'dsn-skills',
        type: 'skills',
        title: 'Design Toolkit',
        column: 'sidebar',
        visible: true,
        items: [
          {
            id: 'dsn-sk-1',
            title: 'Design & Prototyping',
            subtitle: 'Expert',
            bulletItems: [
              { id: 'dsn-b-sk1', text: 'Figma, FigJam, Framer, Adobe Creative Suite, Principle', enabled: true },
            ],
          },
          {
            id: 'dsn-sk-2',
            title: 'Research & Validation',
            subtitle: 'Advanced',
            bulletItems: [
              { id: 'dsn-b-sk2', text: 'Usability testing, interviews, surveys, A/B testing, Maze, Dovetail', enabled: true },
            ],
          },
          {
            id: 'dsn-sk-3',
            title: 'Systems & Handoff',
            subtitle: 'Advanced',
            bulletItems: [
              { id: 'dsn-b-sk3', text: 'Design tokens, WCAG 2.2 AA, Storybook, HTML/CSS literacy, Git basics', enabled: true },
            ],
          },
        ],
      },
      'dsn-edu': {
        id: 'dsn-edu',
        type: 'education',
        title: 'Education',
        column: 'main',
        visible: true,
        items: [
          {
            id: 'dsn-edu-1',
            title: 'B.F.A. in Interaction Design',
            subtitle: 'Rhode Island School of Design',
            location: 'Providence, RI',
            startDate: 'Sep 2014',
            endDate: 'May 2018',
            bulletItems: [
              { id: 'dsn-b-edu1', text: 'Thesis on inclusive interface patterns for low-vision users; departmental award for senior capstone.', enabled: true },
            ],
          },
        ],
      },
      'dsn-proj': {
        id: 'dsn-proj',
        type: 'projects',
        title: 'Selected Work',
        column: 'main',
        visible: true,
        items: [
          {
            id: 'dsn-proj-1',
            title: 'Atlas — Open Design System',
            subtitle: 'Creator & Maintainer',
            startDate: '2025',
            bulletItems: [
              { id: 'dsn-b-pr1', text: 'Published an accessible component library with paired Figma and code tokens, used by 400+ designers across the community.', enabled: true },
            ],
            linkUrl: 'https://rileychen.design/atlas',
            tags: ['Design Tokens', 'Accessibility', 'Documentation'],
          },
        ],
      },
      'dsn-lang': {
        id: 'dsn-lang',
        type: 'languages',
        title: 'Languages',
        column: 'sidebar',
        visible: true,
        items: [
          {
            id: 'dsn-lang-1',
            title: 'English',
            subtitle: 'Native / Fluent',
            bulletItems: [],
          },
          {
            id: 'dsn-lang-2',
            title: 'Mandarin',
            subtitle: 'Full Professional Proficiency',
            bulletItems: [],
          },
        ],
      },
    },
    theme: {
      ...defaultTheme,
      primaryColor: '#7c3aed',
      accentColor: '#6d28d9',
      fontFamily: 'Outfit',
    },
  },
];

/**
 * What a fresh install is seeded with. The rest of `demoProfiles` stays opt-in
 * through the picker, so a first run still opens on a single resume.
 */
export const starterProfiles: CVProfile[] = [demoProfiles[0]];
