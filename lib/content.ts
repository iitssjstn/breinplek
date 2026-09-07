import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import readingTime from 'reading-time';
import type { CategorySlug } from './categories';

const ARTIKELEN_DIR = path.join(process.cwd(), 'content', 'artikelen');
const VRAGEN_DIR = path.join(process.cwd(), 'content', 'vragen');

export interface Artikel {
  slug: string;
  titel: string;
  samenvatting: string;
  categorie: CategorySlug;
  datum: string;
  leestijd: string;
  inhoudHtml: string;
}

export interface Vraag {
  slug: string;
  vraag: string;
  categorie: CategorySlug;
  antwoordKortHtml: string;
  antwoordHtml: string;
}

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
}

export function getAllArtikelen(): Artikel[] {
  const files = listMarkdownFiles(ARTIKELEN_DIR);
  const artikelen = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(ARTIKELEN_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const html = remark().use(remarkHtml).processSync(content).toString();
    return {
      slug,
      titel: data.titel as string,
      samenvatting: data.samenvatting as string,
      categorie: data.categorie as CategorySlug,
      datum: data.datum as string,
      leestijd: readingTime(content, { wordsPerMinute: 180 }).text.replace('min read', 'min leestijd'),
      inhoudHtml: html,
    };
  });
  return artikelen.sort((a, b) => (a.datum < b.datum ? 1 : -1));
}

export function getArtikelBySlug(slug: string): Artikel | undefined {
  return getAllArtikelen().find((a) => a.slug === slug);
}

export function getArtikelenByCategorie(categorie: CategorySlug): Artikel[] {
  return getAllArtikelen().filter((a) => a.categorie === categorie);
}

export function getAllVragen(): Vraag[] {
  const files = listMarkdownFiles(VRAGEN_DIR);
  return files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(VRAGEN_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const html = remark().use(remarkHtml).processSync(content).toString();
    const kortHtml = remark()
      .use(remarkHtml)
      .processSync((data.antwoordKort as string) ?? '')
      .toString();
    return {
      slug,
      vraag: data.vraag as string,
      categorie: data.categorie as CategorySlug,
      antwoordKortHtml: kortHtml,
      antwoordHtml: html,
    };
  });
}

export function getVraagBySlug(slug: string): Vraag | undefined {
  return getAllVragen().find((v) => v.slug === slug);
}

export function getVragenByCategorie(categorie: CategorySlug): Vraag[] {
  return getAllVragen().filter((v) => v.categorie === categorie);
}
