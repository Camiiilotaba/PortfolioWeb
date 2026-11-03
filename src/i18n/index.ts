import { en } from './en';
import { es } from './es';
import type { Dict, Lang } from './types';

export { LANGS, type Lang, type Dict } from './types';

const DICTS: Record<Lang, Dict> = { en, es };

export const useDict = (lang: Lang): Dict => DICTS[lang];

export const HOME_PATH: Record<Lang, string> = { en: '/', es: '/es/' };

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'es' : 'en');
