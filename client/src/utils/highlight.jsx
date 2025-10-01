function escapeHTML(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function highlight(text, query) {
  const safeText = escapeHTML(text ?? '');

  const q = String(query ?? '').trim();
  if (!q) return safeText;

  // экранируем спецсимволы в строке поиска — как в твоём примере
  const escaped = q.replace(/[\\^$|.*?+{}()[\]]/g, '\\$&');
  const reg = new RegExp(escaped, 'gi');

  // вставляем <mark> поверх уже экранированного текста
  return safeText.replace(reg, '<mark>$&</mark>');
}