/**
 * JSON Formatter & Validator Module
 */
const JsonFormatter = (() => {
  const elements = {};

  function init() {
    elements.input = document.getElementById('jsonInput');
    elements.output = document.getElementById('jsonOutput');
    elements.formatBtn = document.getElementById('jsonFormat');
    elements.minifyBtn = document.getElementById('jsonMinify');
    elements.validateBtn = document.getElementById('jsonValidate');
    elements.fixBtn = document.getElementById('jsonFix');
    elements.copyBtn = document.getElementById('copyJsonResult');
    elements.convertCsvBtn = document.getElementById('jsonToCsv');
    elements.convertYamlBtn = document.getElementById('jsonToYaml');
    elements.statusBar = document.getElementById('jsonStatus');

    elements.formatBtn.addEventListener('click', formatJson);
    elements.minifyBtn.addEventListener('click', minifyJson);
    elements.validateBtn.addEventListener('click', validateJson);
    elements.fixBtn.addEventListener('click', fixJson);
    elements.convertCsvBtn.addEventListener('click', convertToCsv);
    elements.convertYamlBtn.addEventListener('click', convertToYaml);
    elements.copyBtn.addEventListener('click', copyOutput);

    elements.input.addEventListener('input', () => {
      updateStatus();
    });
  }

  function updateStatus() {
    const text = elements.input.value.trim();
    if (!text) {
      elements.statusBar.innerHTML = '<span class="text-muted">Enter JSON to get started</span>';
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const type = Array.isArray(parsed) ? 'Array' : typeof parsed;
      const size = new Blob([text]).size;
      elements.statusBar.innerHTML = `<span style="color:var(--success)">Valid JSON</span> &middot; Type: ${type} &middot; Size: ${formatBytes(size)}`;
    } catch (e) {
      elements.statusBar.innerHTML = `<span style="color:var(--error)">Invalid JSON</span> &middot; ${escapeHtml(e.message)}`;
    }
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatJson() {
    const text = elements.input.value.trim();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      elements.output.innerHTML = `<pre><code class="language-json">${escapeHtml(formatted)}</code></pre>`;
      highlightCode(elements.output);
      App.showToast('JSON formatted', 'success');
    } catch (e) {
      elements.output.innerHTML = `<div style="color:var(--error);padding:16px"><strong>Parse Error:</strong><br>${escapeHtml(e.message)}</div>`;
    }
  }

  function minifyJson() {
    const text = elements.input.value.trim();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      const minified = JSON.stringify(parsed);
      elements.output.innerHTML = `<pre style="word-break:break-all;white-space:pre-wrap"><code>${escapeHtml(minified)}</code></pre>`;
      App.showToast('JSON minified', 'success');
    } catch (e) {
      elements.output.innerHTML = `<div style="color:var(--error);padding:16px"><strong>Parse Error:</strong><br>${escapeHtml(e.message)}</div>`;
    }
  }

  function validateJson() {
    const text = elements.input.value.trim();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      const stats = analyzeJson(parsed);
      elements.output.innerHTML = `
        <div style="padding:16px">
          <h3 style="color:var(--success);margin-bottom:12px">JSON is Valid</h3>
          <div class="json-stats">
            <div class="stat-item"><span class="stat-label">Type</span><span class="stat-value">${stats.type}</span></div>
            <div class="stat-item"><span class="stat-label">Size</span><span class="stat-value">${formatBytes(new Blob([text]).size)}</span></div>
            <div class="stat-item"><span class="stat-label">Keys</span><span class="stat-value">${stats.keys}</span></div>
            <div class="stat-item"><span class="stat-label">Depth</span><span class="stat-value">${stats.depth}</span></div>
            <div class="stat-item"><span class="stat-label">Arrays</span><span class="stat-value">${stats.arrays}</span></div>
            <div class="stat-item"><span class="stat-label">Objects</span><span class="stat-value">${stats.objects}</span></div>
            <div class="stat-item"><span class="stat-label">Strings</span><span class="stat-value">${stats.strings}</span></div>
            <div class="stat-item"><span class="stat-label">Numbers</span><span class="stat-value">${stats.numbers}</span></div>
            <div class="stat-item"><span class="stat-label">Booleans</span><span class="stat-value">${stats.booleans}</span></div>
            <div class="stat-item"><span class="stat-label">Nulls</span><span class="stat-value">${stats.nulls}</span></div>
          </div>
        </div>`;
    } catch (e) {
      const line = getErrorLine(text, e.message);
      elements.output.innerHTML = `
        <div style="padding:16px">
          <h3 style="color:var(--error);margin-bottom:12px">JSON is Invalid</h3>
          <p><strong>Error:</strong> ${escapeHtml(e.message)}</p>
          ${line ? `<p><strong>Approximate location:</strong> Line ${line}</p>` : ''}
          <p style="margin-top:12px;color:var(--text-muted)">Click "Fix with AI" to attempt automatic repair.</p>
        </div>`;
    }
  }

  function analyzeJson(obj, depth = 0) {
    const stats = { type: Array.isArray(obj) ? 'Array' : typeof obj, keys: 0, depth: depth, arrays: 0, objects: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 };

    function walk(val, d) {
      if (d > stats.depth) stats.depth = d;
      if (val === null) { stats.nulls++; return; }
      if (Array.isArray(val)) {
        stats.arrays++;
        val.forEach(v => walk(v, d + 1));
      } else if (typeof val === 'object') {
        stats.objects++;
        const keys = Object.keys(val);
        stats.keys += keys.length;
        keys.forEach(k => walk(val[k], d + 1));
      } else if (typeof val === 'string') stats.strings++;
      else if (typeof val === 'number') stats.numbers++;
      else if (typeof val === 'boolean') stats.booleans++;
    }

    walk(obj, 0);
    return stats;
  }

  function getErrorLine(text, errorMsg) {
    const match = errorMsg.match(/position (\d+)/);
    if (!match) return null;
    const pos = parseInt(match[1]);
    return text.substring(0, pos).split('\n').length;
  }

  async function fixJson() {
    const text = elements.input.value.trim();
    if (!text) return;

    if (!mimoAPI.isConfigured()) {
      App.showToast('Please configure your API key in Settings', 'error');
      return;
    }

    elements.output.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;gap:8px"><div class="loading-spinner"></div> Fixing JSON with AI...</div>';

    try {
      const result = await mimoAPI.chatCompletion([
        { role: 'system', content: 'You are a JSON repair expert. Fix the given invalid JSON and return ONLY the corrected JSON, nothing else. No explanations, no markdown code blocks, just pure valid JSON.' },
        { role: 'user', content: `Fix this invalid JSON:\n\n${text}` },
      ]);

      let fixed = result.choices?.[0]?.message?.content || '';
      fixed = fixed.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();

      try {
        const parsed = JSON.parse(fixed);
        const formatted = JSON.stringify(parsed, null, 2);
        elements.output.innerHTML = `
          <div style="padding:16px">
            <h3 style="color:var(--success);margin-bottom:12px">JSON Fixed Successfully</h3>
            <button class="btn btn-sm btn-primary" id="applyFixedJson" style="margin-bottom:12px">Apply Fix to Input</button>
          </div>
          <pre><code class="language-json">${escapeHtml(formatted)}</code></pre>`;
        highlightCode(elements.output);

        document.getElementById('applyFixedJson').addEventListener('click', () => {
          elements.input.value = formatted;
          updateStatus();
          App.showToast('Fixed JSON applied to input', 'success');
        });
      } catch {
        elements.output.innerHTML = `<div style="padding:16px;color:var(--error)">AI could not produce valid JSON. Please check your input manually.</div>`;
      }
    } catch (err) {
      elements.output.innerHTML = `<div style="color:var(--error);padding:16px">Error: ${escapeHtml(err.message)}</div>`;
    }
  }

  function convertToCsv() {
    const text = elements.input.value.trim();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0 || typeof arr[0] !== 'object') {
        App.showToast('JSON must be an array of objects for CSV', 'error');
        return;
      }
      const headers = [...new Set(arr.flatMap(obj => Object.keys(obj)))];
      const csv = [headers.join(','), ...arr.map(obj => headers.map(h => {
        const val = obj[h] ?? '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(','))].join('\n');

      elements.output.innerHTML = `<pre style="white-space:pre-wrap"><code>${escapeHtml(csv)}</code></pre>`;
      App.showToast('Converted to CSV', 'success');
    } catch (e) {
      elements.output.innerHTML = `<div style="color:var(--error);padding:16px">${escapeHtml(e.message)}</div>`;
    }
  }

  function convertToYaml() {
    const text = elements.input.value.trim();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      const yaml = jsonToYaml(parsed, 0);
      elements.output.innerHTML = `<pre><code class="language-yaml">${escapeHtml(yaml)}</code></pre>`;
      highlightCode(elements.output);
      App.showToast('Converted to YAML', 'success');
    } catch (e) {
      elements.output.innerHTML = `<div style="color:var(--error);padding:16px">${escapeHtml(e.message)}</div>`;
    }
  }

  function jsonToYaml(obj, indent) {
    const pad = '  '.repeat(indent);
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj.toString();
    if (typeof obj === 'number') return obj.toString();
    if (typeof obj === 'string') return obj.includes('\n') ? `|\n${obj.split('\n').map(l => pad + '  ' + l).join('\n')}` : (/[:#{}[\],&*?|>!%@`]/.test(obj) ? `"${obj}"` : obj);
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return '\n' + obj.map(v => `${pad}- ${jsonToYaml(v, indent + 1).trimStart()}`).join('\n');
    }
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    return '\n' + keys.map(k => {
      const v = jsonToYaml(obj[k], indent + 1);
      const needsNewline = typeof obj[k] === 'object' && obj[k] !== null;
      return `${pad}${k}:${needsNewline ? v : ' ' + v}`;
    }).join('\n');
  }

  function copyOutput() {
    const text = elements.output.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      App.showToast('Copied to clipboard', 'success');
    }
  }

  return { init };
})();
