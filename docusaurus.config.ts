import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// NOTE: organizationName / projectName / url below assume the repo lives at
// github.com/nordiq/nordiq-developer-guide. Update them (and the `editUrl`s)
// once the real GitHub org/repo is decided — see README.md.
const GITHUB_ORG = 'nordiq';
const GITHUB_REPO = 'nordiq-developer-guide';

const config: Config = {
  title: 'Nordiq Developer Guide',
  tagline: 'The AI-driven field service operations platform — architecture, repos, and agent workflow',
  favicon: 'img/favicon.ico',

  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: `https://${GITHUB_ORG}.github.io`,
  baseUrl: `/${GITHUB_REPO}/`,

  organizationName: GITHUB_ORG,
  projectName: GITHUB_REPO,
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // serve docs at the site root, like Fava's guide
          editUrl: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/tree/main/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // No social-card image or logo yet — add real Nordiq brand assets to
    // static/img/ and wire them back in here once available.
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Nordiq Developer Guide',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guideSidebar',
          position: 'left',
          label: 'Guide',
        },
        {
          href: `https://github.com/${GITHUB_ORG}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Guide',
          items: [
            {label: 'Introduction', to: '/intro'},
            {label: 'Architecture', to: '/architecture/overview'},
            {label: 'Repos', to: '/repos/overview'},
            {label: 'AI Agent Context', to: '/ai-agent-context/overview'},
          ],
        },
        {
          title: 'Repos',
          items: [
            {label: 'NDS', to: '/repos/nds'},
            {label: 'NAS', to: '/repos/nas'},
            {label: 'SHOVL', to: '/repos/shovl'},
            {label: 'Mission Control', to: '/repos/mission-control'},
            {label: 'Website', to: '/repos/website'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Nordiq. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
