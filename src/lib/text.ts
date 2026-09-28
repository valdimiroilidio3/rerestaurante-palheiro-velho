/**
 * Texto: pequenas funções que o site e o painel usam da mesma maneira.
 * São puras — é o que permite testá-las sem montar nada.
 */

/** Texto com parágrafos separados por uma linha em branco. */
export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** "2026-09-28" → "28 de setembro de 2026". Datas inválidas voltam como estão. */
export function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return value;
  }
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}
