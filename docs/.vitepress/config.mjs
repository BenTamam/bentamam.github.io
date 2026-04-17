import { defineConfig, createContentLoader } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { Feed } from 'feed'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const hostname = 'https://bentamam.github.io'

export default withMermaid(defineConfig({
  title: 'Ben Tamam',
  description: 'Offensive Security Engineer & Security Researcher',
  appearance: 'dark',
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,
  sitemap: {
    hostname: hostname,
  },
  head: [
    ['link', { rel: 'icon', href: '/img/avatar-icon.png' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'Ben Tamam - RSS Feed', href: '/feed.xml' }],
    ['link', { rel: 'alternate', type: 'application/atom+xml', title: 'Ben Tamam - Atom Feed', href: '/atom.xml' }],
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['meta', { name: 'author', content: 'Ben Tamam' }],
    ['meta', { name: 'keywords', content: 'security research, red team, offensive security, penetration testing, EDR evasion' }],
    ['meta', { name: 'robots', content: 'index, follow, noai, noimageai' }],
    ['meta', { name: 'googlebot', content: 'index, follow, noarchive' }],
    ['meta', { name: 'GPTBot', content: 'noindex, nofollow' }],
    ['meta', { name: 'ClaudeBot', content: 'noindex, nofollow' }],
    ['meta', { name: 'CCBot', content: 'noindex, nofollow' }],
    ['meta', { name: 'PerplexityBot', content: 'noindex, nofollow' }],
    ['meta', { name: 'Google-Extended', content: 'noindex, nofollow' }],
    ['meta', { name: 'Applebot-Extended', content: 'noindex, nofollow' }],
    ['meta', { name: 'Bytespider', content: 'noindex, nofollow' }],
    ['meta', { name: 'DataForSeoBot', content: 'noindex, nofollow' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Ben Tamam - Security Research' }],
    ['meta', { property: 'og:description', content: 'Offensive security research, vulnerability disclosures, and technique writeups.' }],
    ['meta', { property: 'og:image', content: 'https://bentamam.github.io/img/avatar-icon.png' }],
    ['meta', { property: 'og:site_name', content: 'Ben Tamam' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'Ben Tamam - Security Research' }],
    ['meta', { name: 'twitter:description', content: 'Offensive security research, vulnerability disclosures, and technique writeups.' }],
  ],
  buildEnd: async (config) => {
    const feed = new Feed({
      title: 'Ben Tamam',
      description: 'Offensive security research, vulnerability disclosures, and technique writeups.',
      id: hostname,
      link: hostname,
      language: 'en',
      favicon: `${hostname}/img/avatar-icon.png`,
      copyright: `Copyright © ${new Date().getFullYear()} Ben Tamam`,
      author: {
        name: 'Ben Tamam',
        link: hostname,
      },
    })

    const posts = await createContentLoader(['blog/*.md', 'advisories/*.md'], {
      excerpt: true,
      render: true,
    }).load()

    posts
      .filter((p) => p.frontmatter.title)
      .sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))
      .forEach((post) => {
        feed.addItem({
          title: post.frontmatter.title,
          id: `${hostname}${post.url}`,
          link: `${hostname}${post.url}`,
          description: post.frontmatter.description,
          content: post.html,
          date: new Date(post.frontmatter.date),
          author: [{ name: 'Ben Tamam', link: hostname }],
          category: post.frontmatter.category
            ? [{ name: post.frontmatter.category }]
            : undefined,
        })
      })

    writeFileSync(resolve(config.outDir, 'feed.xml'), feed.rss2())
    writeFileSync(resolve(config.outDir, 'atom.xml'), feed.atom1())
    writeFileSync(resolve(config.outDir, 'feed.json'), feed.json1())
  },
  themeConfig: {
    logo: '/img/avatar-icon.png',
    siteTitle: 'Ben Tamam',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Advisories', link: '/advisories/tcexam-cve-2026-39202' },
      { text: 'Blog', link: '/blog/bypassing-cortex-xdr' },
      { text: 'About', link: '/aboutme' }
    ],
    sidebar: {
      '/advisories/': [
        {
          text: 'Advisories',
          collapsed: false,
          items: [
            { text: 'TCExam SQL Injection (CVE-2026-39202)', link: '/advisories/tcexam-cve-2026-39202' },
            { text: 'Bypassing Cortex XDR (PAN-SA-2022-0005)', link: '/blog/bypassing-cortex-xdr' },
          ]
        },
        {
          text: 'Blog',
          collapsed: false,
          items: [
            { text: 'MSSQL CLR Code Execution', link: '/blog/mssql-clr-code-exec' },
          ]
        }
      ],
      '/blog/': [
        {
          text: 'Advisories',
          collapsed: false,
          items: [
            { text: 'TCExam SQL Injection (CVE-2026-39202)', link: '/advisories/tcexam-cve-2026-39202' },
            { text: 'Bypassing Cortex XDR (PAN-SA-2022-0005)', link: '/blog/bypassing-cortex-xdr' },
          ]
        },
        {
          text: 'Blog',
          collapsed: false,
          items: [
            { text: 'MSSQL CLR Code Execution', link: '/blog/mssql-clr-code-exec' },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/BenTamam' },
      { icon: 'linkedin', link: 'https://linkedin.com/in/bentamam' },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/></svg>',
        },
        link: '/feed.xml',
        ariaLabel: 'RSS feed',
      },
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
      message: 'Content free to quote and share with attribution.',
      copyright: '© 2026 Ben Tamam. All rights reserved.'
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
  },
  mermaid: {
    theme: 'dark',
  },
}))
