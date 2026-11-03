import type { ImageMetadata } from 'astro';
import truekappAssistant from '../assets/projects/truekapp-assistant-crop.jpg';
import truekappCatalogEn from '../assets/projects/truekapp-catalog-en.jpg';
import truekappCatalogEs from '../assets/projects/truekapp-catalog-es.jpg';
import truekappChatEn from '../assets/projects/truekapp-chat-en.jpg';
import truekappChatEs from '../assets/projects/truekapp-chat-es.jpg';
import truekappTradesEn from '../assets/projects/truekapp-trades-en.jpg';
import truekappTradesEs from '../assets/projects/truekapp-trades-es.jpg';
import truekappTradesMobileEn from '../assets/projects/truekapp-trades-mobile-en.jpg';
import truekappTradesMobileEs from '../assets/projects/truekapp-trades-mobile-es.jpg';
import valodexGrid from '../assets/projects/valodex.jpg';
import type { Lang } from '../i18n';

interface TruekappImages {
  catalog: ImageMetadata;
  trades: ImageMetadata;
  tradesMobile: ImageMetadata;
  chat: ImageMetadata;
  assistant: ImageMetadata;
}

export const TRUEKAPP = {
  url: 'https://truekapp.xyz',
  label: 'truekapp.xyz',
  stack: ['Laravel', 'PHP', 'MySQL', 'JavaScript', 'Reverb', 'Gemini', 'Pest', 'Tailwind CSS'],
  images: {
    es: { catalog: truekappCatalogEs, trades: truekappTradesEs, tradesMobile: truekappTradesMobileEs, chat: truekappChatEs, assistant: truekappAssistant },
    en: { catalog: truekappCatalogEn, trades: truekappTradesEn, tradesMobile: truekappTradesMobileEn, chat: truekappChatEn, assistant: truekappAssistant },
  } satisfies Record<Lang, TruekappImages>,
  casePath: { es: '/es/proyectos/truekapp/', en: '/projects/truekapp/' } satisfies Record<Lang, string>,
} as const;

export const VALODEX = {
  url: 'https://valodex-app.vercel.app/',
  label: 'valodex-app.vercel.app',
  stack: ['React', 'JavaScript', 'Vite', 'Tailwind CSS'],
  image: valodexGrid,
} as const;
