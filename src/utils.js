import { STORAGE_KEY } from './constants';

export function loadAll(initial) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('load error', e);
  }
  return initial;
}

export function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('save error', e);
  }
}

export function stripWikiLinks(text) {
  if (!text) return '';
  return text.replace(/\[\[([^\|\]]+)\|[^\]]+\]\]/g, '$1');
}
