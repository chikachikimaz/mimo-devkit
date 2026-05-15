/**
 * Translator Module
 */
const Translator = (() => {
  const elements = {};

  const langNames = {
    auto: 'Auto-detect',
    en: 'English', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
    es: 'Spanish', fr: 'French', de: 'German', id: 'Indonesian',
    ar: 'Arabic', pt: 'Portuguese', ru: 'Russian', hi: 'Hindi',
  };

  function init() {
    elements.sourceText = document.getElementById('sourceText');
    elements.sourceLang = document.getElementById('sourceLang');
    elements.targetLang = document.getElementById('targetLang');
    elements.result = document.getElementById('translationResult');
    elements.charCount = document.getElementById('sourceCharCount');
    elements.translateBtn = document.getElementById('translateBtn');
    elements.swapBtn = document.getElementById('swapLanguages');
    elements.copyBtn = document.getElementById('copyTranslation');

    elements.translateBtn.addEventListener('click', translate);
    elements.swapBtn.addEventListener('click', swapLanguages);

    elements.sourceText.addEventListener('input', () => {
      elements.charCount.textContent = elements.sourceText.value.length;
    });

    elements.sourceText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        translate();
      }
    });

    elements.copyBtn.addEventListener('click', () => {
      const text = elements.result.innerText;
      if (text && text !== 'Translation will appear here...') {
        navigator.clipboard.writeText(text);
        App.showToast('Copied to clipboard', 'success');
      }
    });
  }

  function swapLanguages() {
    const srcLang = elements.sourceLang.value;
    const tgtLang = elements.targetLang.value;

    if (srcLang === 'auto') {
      App.showToast('Cannot swap when source is auto-detect', 'info');
      return;
    }

    elements.sourceLang.value = tgtLang;
    elements.targetLang.value = srcLang;

    const srcText = elements.sourceText.value;
    const resultText = elements.result.innerText;
    if (resultText && resultText !== 'Translation will appear here...') {
      elements.sourceText.value = resultText;
      elements.result.innerHTML = escapeHtml(srcText);
      elements.charCount.textContent = elements.sourceText.value.length;
    }
  }

  async function translate() {
    const text = elements.sourceText.value.trim();
    if (!text) {
      App.showToast('Please enter text to translate', 'error');
      return;
    }

    if (!mimoAPI.isConfigured()) {
      App.showToast('Please configure your API key in Settings', 'error');
      return;
    }

    const srcLang = langNames[elements.sourceLang.value] || 'auto-detected language';
    const tgtLang = langNames[elements.targetLang.value];

    elements.result.innerHTML = '<div style="display:flex;align-items:center;gap:8px;color:var(--text-muted)"><div class="loading-spinner"></div> Translating...</div>';

    try {
      const result = await mimoAPI.chatCompletion([
        {
          role: 'system',
          content: `You are an expert translator. Translate the given text from ${srcLang} to ${tgtLang}. 
Rules:
- Provide ONLY the translated text, no explanations or notes
- Preserve the original formatting, paragraph breaks, and punctuation style
- Use natural, fluent ${tgtLang} that sounds native
- Maintain the tone and register of the original text
- For technical terms, use the commonly accepted ${tgtLang} equivalent`,
        },
        { role: 'user', content: text },
      ]);

      const translated = result.choices?.[0]?.message?.content || 'Translation failed';
      elements.result.innerHTML = escapeHtml(translated);
      elements.result.style.whiteSpace = 'pre-wrap';
      UsageDashboard.trackUsage('translator', text.length);
    } catch (err) {
      elements.result.innerHTML = `<span style="color:var(--error)">Error: ${escapeHtml(err.message)}</span>`;
    }
  }

  return { init };
})();
