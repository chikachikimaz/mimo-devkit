/**
 * Regex Helper Module
 */
const RegexHelper = (() => {
  const elements = {};

  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
    { name: 'URL', pattern: 'https?://[^\\s/$.?#].[^\\s]*', flags: 'gi' },
    { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: 'g' },
    { name: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
    { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}[-/]\\d{2}[-/]\\d{2}', flags: 'g' },
    { name: 'Hex Color', pattern: '#[0-9a-fA-F]{3,8}\\b', flags: 'gi' },
    { name: 'HTML Tag', pattern: '<[^>]+>', flags: 'g' },
    { name: 'Digits Only', pattern: '^\\d+$', flags: '' },
    { name: 'Alphanumeric', pattern: '^[a-zA-Z0-9]+$', flags: '' },
    { name: 'Password (Strong)', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', flags: '' },
    { name: 'UUID', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', flags: 'gi' },
    { name: 'JSON String', pattern: '"(?:[^"\\\\]|\\\\.)*"', flags: 'g' },
  ];

  function init() {
    elements.patternInput = document.getElementById('regexPattern');
    elements.flagsInput = document.getElementById('regexFlags');
    elements.testInput = document.getElementById('regexTestString');
    elements.resultEl = document.getElementById('regexResult');
    elements.matchCount = document.getElementById('regexMatchCount');
    elements.commonList = document.getElementById('regexCommonPatterns');
    elements.testBtn = document.getElementById('regexTest');
    elements.explainBtn = document.getElementById('regexExplain');
    elements.generateBtn = document.getElementById('regexGenerate');
    elements.generateInput = document.getElementById('regexGenerateInput');

    renderCommonPatterns();

    elements.testBtn.addEventListener('click', testRegex);
    elements.explainBtn.addEventListener('click', explainRegex);
    elements.generateBtn.addEventListener('click', generateRegex);

    elements.patternInput.addEventListener('input', liveTest);
    elements.testInput.addEventListener('input', liveTest);
    elements.flagsInput.addEventListener('input', liveTest);
  }

  function renderCommonPatterns() {
    elements.commonList.innerHTML = commonPatterns.map(p => `
      <button class="common-pattern-btn" data-pattern="${escapeHtml(p.pattern)}" data-flags="${p.flags}" title="${escapeHtml(p.pattern)}">${p.name}</button>
    `).join('');

    elements.commonList.querySelectorAll('.common-pattern-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.patternInput.value = btn.dataset.pattern;
        elements.flagsInput.value = btn.dataset.flags;
        liveTest();
      });
    });
  }

  function liveTest() {
    const pattern = elements.patternInput.value;
    const flags = elements.flagsInput.value;
    const testStr = elements.testInput.value;

    if (!pattern || !testStr) {
      elements.resultEl.innerHTML = '';
      elements.matchCount.textContent = '0 matches';
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regex.exec(testStr)) !== null) {
          matches.push({ value: match[0], index: match.index, groups: match.slice(1) });
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testStr);
        if (match) matches.push({ value: match[0], index: match.index, groups: match.slice(1) });
      }

      elements.matchCount.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;

      let highlighted = '';
      let lastIndex = 0;
      const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

      for (const m of sortedMatches) {
        highlighted += escapeHtml(testStr.substring(lastIndex, m.index));
        highlighted += `<mark class="regex-match">${escapeHtml(m.value)}</mark>`;
        lastIndex = m.index + m.value.length;
      }
      highlighted += escapeHtml(testStr.substring(lastIndex));

      let html = `<div class="regex-highlighted">${highlighted || escapeHtml(testStr)}</div>`;

      if (matches.length > 0) {
        html += '<div class="regex-matches-list"><h4>Matches:</h4>';
        matches.forEach((m, i) => {
          html += `<div class="regex-match-item">
            <span class="match-index">#${i + 1}</span>
            <code>${escapeHtml(m.value)}</code>
            <span class="match-pos">pos ${m.index}</span>
            ${m.groups.length > 0 ? `<span class="match-groups">Groups: ${m.groups.map((g, j) => `<code>$${j + 1}=${escapeHtml(g || '')}</code>`).join(' ')}</span>` : ''}
          </div>`;
        });
        html += '</div>';
      }

      elements.resultEl.innerHTML = html;
    } catch (e) {
      elements.resultEl.innerHTML = `<div style="color:var(--error);padding:12px">${escapeHtml(e.message)}</div>`;
      elements.matchCount.textContent = 'Error';
    }
  }

  function testRegex() {
    liveTest();
  }

  async function explainRegex() {
    const pattern = elements.patternInput.value.trim();
    if (!pattern) {
      App.showToast('Enter a regex pattern first', 'error');
      return;
    }

    if (!mimoAPI.isConfigured()) {
      App.showToast('Please configure your API key in Settings', 'error');
      return;
    }

    elements.resultEl.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:16px"><div class="loading-spinner"></div> Explaining regex...</div>';

    try {
      const result = await mimoAPI.chatCompletion([
        { role: 'system', content: 'You are a regex expert. Explain regex patterns in clear, simple language. Break down each part of the pattern.' },
        { role: 'user', content: `Explain this regex pattern in detail:\n\n/${pattern}/${elements.flagsInput.value}\n\nBreak down each component, explain what it matches, and provide examples of strings that would and would not match.` },
      ]);

      const content = result.choices?.[0]?.message?.content || 'No response';
      elements.resultEl.innerHTML = `<div class="regex-explanation">${renderMarkdown(content)}</div>`;
      highlightCode(elements.resultEl);
    } catch (err) {
      elements.resultEl.innerHTML = `<div style="color:var(--error);padding:16px">${escapeHtml(err.message)}</div>`;
    }
  }

  async function generateRegex() {
    const desc = elements.generateInput.value.trim();
    if (!desc) {
      App.showToast('Describe what you want to match', 'error');
      return;
    }

    if (!mimoAPI.isConfigured()) {
      App.showToast('Please configure your API key in Settings', 'error');
      return;
    }

    elements.resultEl.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:16px"><div class="loading-spinner"></div> Generating regex...</div>';

    try {
      const result = await mimoAPI.chatCompletion([
        { role: 'system', content: 'You are a regex expert. Generate regex patterns based on descriptions. Always provide the pattern, flags, explanation, and test examples.' },
        { role: 'user', content: `Generate a regex pattern for: ${desc}\n\nProvide:\n1. The regex pattern\n2. Recommended flags\n3. Explanation of each part\n4. 3 examples of matching strings\n5. 3 examples of non-matching strings` },
      ]);

      const content = result.choices?.[0]?.message?.content || 'No response';
      elements.resultEl.innerHTML = `<div class="regex-explanation">${renderMarkdown(content)}</div>`;
      highlightCode(elements.resultEl);
    } catch (err) {
      elements.resultEl.innerHTML = `<div style="color:var(--error);padding:16px">${escapeHtml(err.message)}</div>`;
    }
  }

  return { init };
})();
