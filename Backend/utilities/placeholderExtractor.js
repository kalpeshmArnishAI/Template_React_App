function extractPlaceholders(text) {
  const matches = text.match(/{{(.*?)}}/g);
  if (!matches) return [];

  const seen = new Set();
  const uniquePlaceholders = [];

  for (const raw of matches) {
    // Normalize robustly:
    // - strip braces
    // - replace non-breaking spaces with regular spaces
    // - collapse multiple spaces
    // - trim
    const innerRaw = raw.replace(/^\{\{|\}\}$/g, '')
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Use a case/whitespace-insensitive key for dedupe
    const dedupeKey = innerRaw.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    // Re-wrap normalized inner
    uniquePlaceholders.push(`{{${innerRaw}}}`);
  }

  return uniquePlaceholders;
}

module.exports = extractPlaceholders;
