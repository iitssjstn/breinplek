export type CategorySlug = 'adhd' | 'autisme' | 'audhd' | 'werk-school' | 'dagelijks-leven';

export interface Category {
  slug: CategorySlug;
  naam: string;
  omschrijving: string;
  kleur: 'teal' | 'plum' | 'amber';
}

export const categories: Category[] = [
  {
    slug: 'adhd',
    naam: 'ADHD',
    omschrijving: 'Focus, prikkels en energie beter leren sturen.',
    kleur: 'teal',
  },
  {
    slug: 'autisme',
    naam: 'Autisme',
    omschrijving: 'Structuur, sensoriek en jezelf begrijpen.',
    kleur: 'plum',
  },
  {
    slug: 'audhd',
    naam: 'AuDHD',
    omschrijving: 'Voor wanneer ADHD en autisme allebei meespelen.',
    kleur: 'amber',
  },
  {
    slug: 'werk-school',
    naam: 'Werk & school',
    omschrijving: 'Presteren en overleven in systemen die niet op jou zijn ingericht.',
    kleur: 'teal',
  },
  {
    slug: 'dagelijks-leven',
    naam: 'Dagelijks leven',
    omschrijving: 'Huishouden, geld, energie en het gewone leven.',
    kleur: 'plum',
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
