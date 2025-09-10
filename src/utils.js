// src/utils.js
export const escapeHTML = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export function formatMessageForHtml(raw = "") {
  const escaped = escapeHTML(raw);
  const withSpaces = escaped.replace(/ {2,}/g, (m) =>
    m.split("").map((ch, i) => (i === 0 ? " " : "&nbsp;")).join("")
  );
  const withBreaks = withSpaces
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "<br>");
  return withBreaks.replace(/(<br>){9,}/g, "<br><br><br><br><br><br><br><br>");
}
