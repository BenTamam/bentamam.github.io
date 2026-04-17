import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Ben Tamam',
  description: 'Offensive Security Engineer & Security Researcher',
  appearance: 'dark',
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,
  head: [
    ['link', { rel: 'icon', href: '/img/avatar-icon.png' }],
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['meta', { name: 'author', content: 'Ben Tamam' }],
    ['meta', { name: 'keywords', content: 'security research, red team, offensive security, penetration testing, EDR evasion' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Ben Tamam - Security Research' }],
    ['meta', { property: 'og:description', content: 'Offensive Security Engineer & Security Researcher' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
  ],
  themeConfig: {
    logo: '/img/avatar-icon.png',
    siteTitle: 'Ben Tamam',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/blog/bypassing-cortex-xdr' },
      { text: 'About', link: '/about' }
    ],
    sidebar: {
      '/blog/': [
        {
          text: 'Posts',
          collapsed: false,
          items: [
            { text: 'Bypassing Cortex XDR (PAN-SA-2022-0005)', link: '/blog/bypassing-cortex-xdr' },
            { text: 'MSSQL CLR Code Execution', link: '/blog/mssql-clr-code-exec' },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/BenTamam' },
      { icon: 'linkedin', link: 'https://linkedin.com/in/bentamam' }
    ],
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 4],
      label: 'On this page'
    },
    externalLinkIcon: false,
    returnToTopLabel: 'Back to top',
    docFooter: {
      prev: 'Previous Post',
      next: 'Next Post'
    },
    footer: {
      message: 'Security Research & Red Teaming',
      copyright: 'Copyright © 2026 Ben Tamam'
    },
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium'
      }
    }
  },
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    image: {
      lazyLoading: true
    },
    container: {
      tipLabel: 'PRO TIP',
      warningLabel: 'CAUTION',
      dangerLabel: 'DANGER',
      infoLabel: 'NOTE',
      detailsLabel: 'Details'
    }
  }
})
