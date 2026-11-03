import type { Lang } from './types';

export interface Shot {
  alt: string;
  caption: string;
}
export interface Row {
  title: string;
  body: string;
}

export interface SiteDict {
  hero: {
    roleLines: [string, string];
    lead: string;
    stackLabel: string;
    stackWhere: string;
  };
  projects: {
    heading: string;
    ownProject: string;
    personalProject: string;
    caseLink: string;
    truekapp: {
      shots: { catalog: Shot; trades: Shot; chat: Shot; assistant: Shot };
    };
    valodex: {
      summary: string;
      decisions: [string, string];
      status: string;
      demoLabel: string;
      shot: Shot;
      decisionsLabel: string;
    };
  };
  experience: {
    heading: string;
    techLabel: string;
    items: {
      company: string;
      role: string;
      period: string;
      description: string;
      highlights: { topic?: string; text: string }[];
      tech: string[];
    }[];
    educationHeading: string;
    education: { title: string; school: string; period: string }[];
    cvNote: string;
  };
  caseStudy: {
    title: string;
    description: string;
    back: string;
    status: string;
    intro: string;
    roleHeading: string;
    decisionsHeading: string;
    otherLang: string;
  };
  footer: { legal: string; privacy: string; top: string };
  notFound: { title: string; body: string; home: string };
}

const es: SiteDict = {
  hero: {
    roleLines: ['Desarrollador', 'Full-Stack'],
    lead: 'Desarrollo aplicaciones de gestión y SaaS para web y móvil. He trabajado en productos de logística y nutrición, y en un marketplace de trueques.',
    stackLabel: 'Stack',
    stackWhere: 'dónde lo he usado',
  },
  projects: {
    heading: 'Proyectos',
    ownProject: 'proyecto propio',
    personalProject: 'proyecto personal',
    caseLink: 'Ver el caso',
    truekapp: {
      shots: {
        catalog: {
          alt: 'Catálogo de Truekapp: filtros por nombre, ubicación, categoría y estado, y una cuadrícula de objetos publicados',
          caption: 'Explorar: los objetos publicados, con filtros por nombre, ubicación, categoría y estado.',
        },
        trades: {
          alt: 'Pantalla Mis trueques de Truekapp: una propuesta aceptada de un set de herramientas de jardín a cambio de un pack de cómics de Astérix, con el botón para completar el trueque',
          caption: 'Mis trueques: propuestas recibidas, enviadas y completadas.',
        },
        chat: {
          alt: 'Chat de Truekapp entre dos usuarios con el trueque aceptado fijado arriba',
          caption: 'El chat se abre cuando la otra persona acepta el trueque.',
        },
        assistant: {
          alt: 'El asistente de Truekapp recomienda dos objetos publicados',
          caption: 'El asistente busca entre los anuncios publicados y enlaza cada uno.',
        },
      },
    },
    valodex: {
      summary: 'Una web para consultar agentes, armas, mapas y estadísticas de jugadores de Valorant.',
      decisions: [
        'Las peticiones pasan por una función serverless que guarda la clave de la API, así nunca llega al navegador.',
        'Limité las peticiones a 25 por minuto por pestaña y añadí un aviso cuando la API alcanza su límite.',
      ],
      status: 'Proyecto personal con demo pública.',
      demoLabel: 'Abrir la demo',
      shot: {
        alt: 'Rejilla de agentes de Valorant en VALO·DEX',
        caption: 'Explorar: la rejilla de agentes, con filtro por rol.',
      },
      decisionsLabel: 'Dos decisiones',
    },
  },
  experience: {
    heading: 'Experiencia',
    techLabel: 'Tecnologías',
    items: [
      {
        company: 'FleetX',
        role: 'Desarrollador Full-Stack',
        period: 'Enero 2026 – actualidad',
        description: 'SaaS de logística multi-tenant para empresas de transporte.',
        highlights: [
          { topic: 'Parte diario', text: 'construí el flujo completo: app Flutter que funciona sin conexión, donde el conductor registra las horas, el trabajo hecho y los gastos del día como dietas u hotel; aprobación en Vue, y backend Laravel conectado al tacógrafo y a la nómina.' },
          { topic: 'Emisiones por envío', text: 'diseñé y desarrollé el cálculo según GLEC v3.2, alineado con ISO 14083 y con cada factor trazable a su fuente publicada.' },
          { topic: 'Rentabilidad por ruta', text: 'desarrollé el cálculo que combina combustible, salario y horas extra del conductor.' },
        ],
        tech: ['Laravel', 'PHP', 'MySQL', 'Vue', 'Flutter'],
      },
      {
        company: 'Gesa Mediación S.L.',
        role: 'Desarrollador Full-Stack',
        period: 'Octubre – noviembre 2025',
        description: 'Único desarrollador de una app de nutrición con IA.',
        highlights: [
          { text: 'Diseñé la arquitectura y construí el núcleo en Laravel: API REST, modelo de datos y lógica de negocio.' },
          { text: 'Desarrollé la base de la app en Flutter, con análisis nutricional por IA de fotos y PDF, notificaciones push y sincronización en tiempo real.' },
        ],
        tech: ['Laravel', 'Flutter', 'Firebase'],
      },
      {
        company: 'Apuestas de Murcia',
        role: 'Desarrollador Full-Stack en prácticas',
        period: 'Marzo – junio 2025',
        description: 'Aplicación de gestión para una empresa de salones de juego.',
        highlights: [
          { text: 'Diseñé y desarrollé ManagePoint, que sustituyó al sistema antiguo: salones, personal, mobiliario y terminales en un solo sitio.' },
          { text: 'Añadí partes de trabajo por salón e informes en PDF, con un histórico de cambios que solo un administrador puede corregir.' },
        ],
        tech: ['Laravel', 'PHP', 'MySQL', 'JavaScript', 'Tailwind CSS'] /* JavaScript: confirmado por Camilo 2026-11-01 */,
      },
    ],
    educationHeading: 'Formación',
    education: [
      { title: 'Técnico Superior en Desarrollo de Aplicaciones Web', school: 'EFA El Campico, Jacarilla', period: '2023 – 2025' },
      { title: 'Técnico en Sistemas Microinformáticos y Redes', school: 'IES Las Espeñetas, Orihuela', period: '2020 – 2023' },
    ],
    cvNote: 'Ver el CV completo',
  },
  caseStudy: {
    title: 'Truekapp, caso de estudio · Camilo Taba',
    description:
      'Cómo está hecho Truekapp, una plataforma de trueque con chat en directo y un asistente con IA: mi aportación y tres decisiones técnicas, cada una con su pantalla.',
    back: 'Volver a proyectos',
    status: 'Caso de estudio · Proyecto en producción',
    intro:
      'Una plataforma para intercambiar objetos sin dinero. Buscas en Explorar, propones un trueque y, si la otra persona lo acepta, se abre un chat entre los dos. Un asistente con IA ayuda a encontrar anuncios.',
    roleHeading: 'Mi aportación',
    decisionsHeading: 'Tres decisiones',
    otherLang: 'Read in English',
  },
  footer: { legal: 'Aviso legal', privacy: 'Privacidad', top: 'Volver arriba' },
  notFound: { title: 'Página no encontrada', body: 'Esta dirección no existe o ha cambiado.', home: 'Ir a la portada' },
};

const en: SiteDict = {
  hero: {
    roleLines: ['Full-Stack', 'Developer'],
    lead: "I build business applications and SaaS products for web and mobile. I've worked on logistics and nutrition products, as well as a barter marketplace.",
    stackLabel: 'Stack',
    stackWhere: 'where I have used it',
  },
  projects: {
    heading: 'Projects',
    ownProject: 'own project',
    personalProject: 'personal project',
    caseLink: 'Read the case study',
    truekapp: {
      shots: {
        catalog: {
          alt: 'Truekapp catalogue: filters by name, location, category and condition, and a grid of published items',
          caption: 'Browse: the published items, with filters by name, location, category and condition.',
        },
        trades: {
          alt: 'Truekapp My Trades screen: an accepted proposal of a garden tool set for an Asterix comics pack, with the button to complete the trade',
          caption: 'My trades: received, sent and completed proposals.',
        },
        chat: {
          alt: 'Truekapp chat between two users with the accepted swap pinned at the top',
          caption: 'The chat opens when the other person accepts the swap.',
        },
        assistant: {
          alt: 'The Truekapp assistant recommends two published items',
          caption: 'The assistant searches the published listings and links each one.',
        },
      },
    },
    valodex: {
      summary: 'A site for browsing Valorant agents, weapons, maps and player stats.',
      decisions: [
        'Requests go through a serverless function that holds the API key, so it never reaches the browser.',
        'I limited requests to 25 per minute per tab and added a warning when the API hits its rate limit.',
      ],
      status: 'Personal project with a public demo.',
      demoLabel: 'Open the demo',
      shot: {
        alt: 'Grid of Valorant agents in VALO·DEX',
        caption: 'Explore: the agent grid, filtered by role.',
      },
      decisionsLabel: 'Two decisions',
    },
  },
  experience: {
    heading: 'Experience',
    techLabel: 'Technologies',
    items: [
      {
        company: 'FleetX',
        role: 'Full-Stack Developer',
        period: 'January 2026 – present',
        description: 'Multi-tenant logistics SaaS for transport companies.',
        highlights: [
          { topic: 'Daily report', text: "built the whole flow: a Flutter app that works offline, where drivers log the day's hours, the work done and expenses such as meals or hotel; approval in Vue, and a Laravel backend connected to the tachograph and payroll." },
          { topic: 'Emissions per shipment', text: 'designed and built the calculation following GLEC v3.2, aligned with ISO 14083, with every factor traceable to its published source.' },
          { topic: 'Route profitability', text: 'built the calculation that combines fuel, driver salary and overtime.' },
        ],
        tech: ['Laravel', 'PHP', 'MySQL', 'Vue', 'Flutter'],
      },
      {
        company: 'Gesa Mediación S.L.',
        role: 'Full-Stack Developer',
        period: 'October – November 2025',
        description: 'Sole developer of a nutrition app with AI.',
        highlights: [
          { text: 'Designed the architecture and built the Laravel core: REST API, data model and business logic.' },
          { text: 'Built the foundation of the Flutter app, with AI nutrition analysis of photos and PDFs, push notifications and sync in real time.' },
        ],
        tech: ['Laravel', 'Flutter', 'Firebase'],
      },
      {
        company: 'Apuestas de Murcia',
        role: 'Full-Stack Developer (internship)',
        period: 'March – June 2025',
        description: 'Management application for a company that runs gaming venues.',
        highlights: [
          { text: 'Designed and built ManagePoint, which replaced the old system: venues, staff, furniture and terminals in one place.' },
          { text: 'Added work reports for each venue and PDF reports, with a change history that only an administrator can correct.' },
        ],
        tech: ['Laravel', 'PHP', 'MySQL', 'JavaScript', 'Tailwind CSS'] /* JavaScript: confirmado por Camilo 2026-11-01 */,
      },
    ],
    educationHeading: 'Education',
    education: [
      { title: 'Higher Technician in Web Application Development', school: 'EFA El Campico, Jacarilla, Spain', period: '2023 – 2025' },
      { title: 'Technician in IT Systems & Networks', school: 'IES Las Espeñetas, Orihuela, Spain', period: '2020 – 2023' },
    ],
    cvNote: 'See the full CV',
  },
  caseStudy: {
    title: 'Truekapp case study · Camilo Taba',
    description:
      'How Truekapp is built, a barter platform with live chat and an AI assistant: my contribution and three technical decisions, each with its screen.',
    back: 'Back to projects',
    status: 'Case study · Live project',
    intro:
      'A platform for swapping items without money. You search in Explore, propose a swap and, if the other person accepts, a chat opens between you. An AI assistant helps you find listings.',
    roleHeading: 'My contribution',
    decisionsHeading: 'Three decisions',
    otherLang: 'Leer en español',
  },
  footer: { legal: 'Legal notice (ES)', privacy: 'Privacy (ES)', top: 'Back to top' },
  notFound: { title: 'Page not found', body: 'This address does not exist or has changed.', home: 'Go to the home page' },
};

const SITE: Record<Lang, SiteDict> = { es, en };
export const useSite = (lang: Lang): SiteDict => SITE[lang];
