// Lightweight CSV/HTML exporters — no heavy deps required.
function toCsv(rows, columns) {
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const head = columns.map((c) => esc(c.label)).join(',');
  const body = rows
    .map((r) => columns.map((c) => esc(typeof c.value === 'function' ? c.value(r) : r[c.key])).join(','))
    .join('\n');
  return head + '\n' + body;
}

function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.send(csv);
}

// Simple printable HTML "PDF" view — clients can print to PDF; lightweight & dep-free.
function sendHtmlPdf(res, title, rows, columns) {
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#222}
h1{font-size:20px;margin:0 0 16px}
table{width:100%;border-collapse:collapse;font-size:12px}
th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
th{background:#f3f4f6}
@media print{.noprint{display:none}}
</style></head><body>
<div class="noprint" style="margin-bottom:12px"><button onclick="window.print()">Print / Save as PDF</button></div>
<h1>${title}</h1>
<table><thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join('')}</tr></thead>
<tbody>${rows
      .map(
        (r) =>
          `<tr>${columns
            .map((c) => `<td>${(typeof c.value === 'function' ? c.value(r) : r[c.key]) ?? ''}</td>`)
            .join('')}</tr>`
      )
      .join('')}</tbody></table>
</body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}

module.exports = { toCsv, sendCsv, sendHtmlPdf };
