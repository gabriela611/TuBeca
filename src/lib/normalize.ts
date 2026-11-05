/**
 * Normaliza un texto convirtiéndolo a minúsculas y removiendo acentos y tildes (marcas diacríticas).
 * Ejemplo: "Ingeniería" -> "ingenieria", "BOGOTÁ" -> "bogota".
 */
export function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Retorna true si el texto contenedor incluye el texto buscado,
 * sin distinguir mayúsculas, minúsculas ni tildes.
 */
export function fuzzyIncludes(containerText?: string | null, searchText?: string | null): boolean {
  if (!searchText) return true;
  if (!containerText) return false;
  return normalizeText(containerText).includes(normalizeText(searchText));
}

