export function stripWikiLinks(text) {
  if (!text) return '';
  return text.replace(/\[\[([^\|\]]+)\|[^\]]+\]\]/g, '$1');
}
