import type { Dict } from './types';

export const en: Dict = {
  meta: {
    title: 'Camilo Taba · Full-Stack Developer (Laravel & PHP) in Alicante, Spain',
    description:
      'Full-Stack developer for management applications and SaaS: Laravel backend, Vue and JavaScript interfaces, Flutter mobile apps. Based in Orihuela, Alicante, Spain.',
  },
  skip: 'Skip to content',
  nav: {
    label: 'Main navigation',
    projects: 'Projects',
    experience: 'Experience',
    contact: 'Contact',
    cv: 'CV',
    langSwitch: 'Español',
    home: 'Camilo Taba, home',
  },
  hero: {
    ctaProjects: 'See projects',
    ctaContact: 'Contact',
    spec: {
      base: 'Based in',
      baseValue: 'Orihuela, Alicante · CET/CEST',
    },
  },
  projects: {
    labels: {
      decisions: 'Three decisions',
      stack: 'Stack',
    },
    truekapp: {
      summary: 'A swapping platform with live chat and an AI assistant to find items.',
      contribution:
        'It started in 2025 as a final degree project by three classmates. Since 2026 I have maintained it on my own: I rebuilt it to deploy on my own server and added the AI assistant, the public demo and the bilingual interface. Pest tests run on GitHub Actions and deployment is still manual.',
      decisions: [
        {
          title: 'Chat with Laravel Reverb',
          body: 'I chose Laravel Reverb to run the chat without relying on an external messaging service and its quotas. In return, I maintain it on my own server.',
        },
        {
          title: 'An assistant with fallback models',
          body: 'When a Gemini model runs out of quota, the assistant tries another. I separated the integration from the rest of the application to make future provider changes easier.',
        },
        {
          title: 'Semantic search without a vector database',
          body: 'Embeddings are stored in MySQL and cosine similarity runs in PHP. The ceiling is around 900 items, far above what the demo holds, so another service would only add cost.',
        },
      ],
      status: 'No account needed; the demo data resets daily.',
      demoLabel: 'Try the demo',
      codeNote: 'The code is private; the demo shows the full application.',
      figures: [
        {
          alt: 'Truekapp chat between two users negotiating a swap',
          caption: 'The chat opens when the other person accepts the swap.',
        },
        {
          alt: 'The Truekapp assistant recommends two published items',
          caption: 'The assistant searches the published listings and links each one.',
        },
      ],
    },
  },
  contact: {
    heading: "Let's talk",
    subtitle: "If you'd like to work together, email me.",
    copy: 'Copy',
    copied: 'Copied',
    copyLabel: 'Copy the email address',
    copyFailed: 'Could not copy. Select the address to copy it.',
    cvEs: 'CV in Spanish',
    cvEn: 'CV in English',
    location: 'Orihuela, Alicante, Spain',
  },
  pdf: 'PDF',
  newTab: '(opens in a new tab)',
};
