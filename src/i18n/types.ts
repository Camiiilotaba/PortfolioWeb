export const LANGS = ['en', 'es'] as const;
export type Lang = (typeof LANGS)[number];

export interface FigureCopy {
  alt: string;
  caption: string;
}

export interface ProjectCopy {
  summary: string;
  contribution: string;
  decisions: { title: string; body: string }[];
  status: string;
  demoLabel: string;
  codeNote: string;
  figures: [FigureCopy, FigureCopy];
}

export interface Dict {
  meta: { title: string; description: string };
  skip: string;
  nav: {
    label: string;
    projects: string;
    experience: string;
    contact: string;
    cv: string;
    langSwitch: string;
    home: string;
  };
  hero: {
    ctaProjects: string;
    ctaContact: string;
    spec: {
      base: string;
      baseValue: string;
    };
  };
  projects: {
    labels: { decisions: string; stack: string };
    truekapp: ProjectCopy;
  };
  contact: {
    heading: string;
    subtitle: string;
    copy: string;
    copied: string;
    copyLabel: string;
    copyFailed: string;
    cvEs: string;
    cvEn: string;
    location: string;
  };
  pdf: string;
  newTab: string;
}
