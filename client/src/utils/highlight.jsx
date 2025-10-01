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

  const escaped = q.replace(/[\\^$|.*?+{}()[\]]/g, '\\$&');
  const reg = new RegExp(escaped, 'gi');

  return safeText.replace(reg, '<mark>$&</mark>');
}
