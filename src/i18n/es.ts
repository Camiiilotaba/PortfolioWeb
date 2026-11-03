import type { Dict } from './types';

export const es: Dict = {
  meta: {
    title: 'Camilo Taba · Desarrollador Full-Stack con Laravel en Alicante',
    description:
      'Desarrollador Full-Stack para aplicaciones de gestión y SaaS: backend en Laravel, interfaces en Vue y JavaScript, apps móviles en Flutter. En Orihuela, Alicante.',
  },
  skip: 'Saltar al contenido',
  nav: {
    label: 'Navegación principal',
    projects: 'Proyectos',
    experience: 'Experiencia',
    contact: 'Contacto',
    cv: 'CV',
    langSwitch: 'English',
    home: 'Camilo Taba, inicio',
  },
  hero: {
    ctaProjects: 'Ver proyectos',
    ctaContact: 'Contacto',
    spec: {
      base: 'Base',
      baseValue: 'Orihuela, Alicante · CET/CEST',
    },
  },
  projects: {
    labels: {
      decisions: 'Tres decisiones',
      stack: 'Stack',
    },
    truekapp: {
      summary: 'Una plataforma de trueques con chat en directo y un asistente de IA para encontrar objetos.',
      contribution:
        'Empezó en 2025 como proyecto de fin de grado entre tres compañeros. Desde 2026 lo mantengo yo solo: lo rehíce para desplegarlo en un servidor propio y añadí el asistente con IA, la demo pública y la interfaz en dos idiomas. Los tests de Pest se ejecutan en GitHub Actions y el despliegue sigue siendo manual.',
      decisions: [
        {
          title: 'Chat con Laravel Reverb',
          body: 'Elegí Laravel Reverb para gestionar el chat sin depender de las cuotas de un servicio externo. A cambio, me encargo de mantenerlo en mi servidor.',
        },
        {
          title: 'Un asistente con modelos de respaldo',
          body: 'Si un modelo de Gemini agota su cuota, el asistente intenta continuar con otro. Separé la integración del resto de la aplicación para facilitar futuros cambios de proveedor.',
        },
        {
          title: 'Búsqueda semántica sin base de datos vectorial',
          body: 'Los embeddings se guardan en MySQL y la similitud se calcula en PHP. Con este volumen basta y me ahorro otro servicio.',
        },
      ],
      status: 'Demo sin necesidad de registro, los datos se reinician diariamente.',
      demoLabel: 'Probar la demo',
      codeNote: 'El código es privado; la demo muestra la aplicación completa.',
      figures: [
        {
          alt: 'Chat de Truekapp entre dos usuarios negociando un trueque',
          caption: 'El chat se abre cuando la otra persona acepta el trueque.',
        },
        {
          alt: 'El asistente de Truekapp recomienda dos objetos publicados',
          caption: 'El asistente busca entre los anuncios publicados y enlaza cada uno.',
        },
      ],
    },
  },
  contact: {
    heading: 'Hablemos',
    subtitle: 'Si quieres que trabajemos juntos, escríbeme.',
    copy: 'Copiar',
    copied: 'Copiado',
    copyLabel: 'Copiar la dirección de email',
    copyFailed: 'No se pudo copiar. Selecciona la dirección para copiarla.',
    cvEs: 'CV en español',
    cvEn: 'CV en inglés',
    location: 'Orihuela, Alicante',
  },
  pdf: 'PDF',
  newTab: '(se abre en una pestaña nueva)',
};
