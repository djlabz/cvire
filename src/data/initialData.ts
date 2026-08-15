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
];
