/**
 * Code Assistant Module
 */
const CodeAssistant = (() => {
  const elements = {};

  function init() {
    elements.codeInput = document.getElementById('codeInput');
    elements.codeResult = document.getElementById('codeResult');
    elements.codeLanguage = document.getElementById('codeLanguage');
    elements.codeModel = document.getElementById('codeModel');
    elements.copyResult = document.getElementById('copyResult');

    document.getElementById('reviewCode').addEventListener('click', () => runAction('review'));
    document.getElementById('optimizeCode').addEventListener('click', () => runAction('optimize'));
    document.getElementById('explainCode').addEventListener('click', () => runAction('explain'));
    document.getElementById('generateTests').addEventListener('click', () => runAction('tests'));

    elements.copyResult.addEventListener('click', () => {
      const text = elements.codeResult.innerText;
      if (text) {
        navigator.clipboard.writeText(text);
        App.showToast('Copied to clipboard', 'success');
      }
    });
  }

  const prompts = {
    review: (code, lang) => `You are an expert code reviewer. Review the following ${lang} code for:
1. **Bugs & Errors**: Identify any bugs, logic errors, or potential runtime issues
2. **Security**: Check for security vulnerabilities
3. **Performance**: Identify performance bottlenecks
4. **Best Practices**: Check adherence to coding standards and best practices
5. **Suggestions**: Provide specific improvement recommendations

Code to review:
\`\`\`${lang}
${code}
\`\`\`

Provide a detailed review with specific line references and actionable suggestions.`,

    optimize: (code, lang) => `You are an expert software engineer. Optimize the following ${lang} code for better performance, readability, and maintainability.

Original code:
\`\`\`${lang}
${code}
\`\`\`

Provide:
1. The optimized version of the code
2. Explanation of each optimization made
3. Performance impact analysis`,

    explain: (code, lang) => `You are a patient programming teacher. Explain the following ${lang} code in detail:

\`\`\`${lang}
${code}
\`\`\`

Provide:
1. **Overview**: What the code does at a high level
2. **Line-by-line explanation**: Walk through the logic step by step
3. **Key concepts**: Explain any important programming concepts used
4. **Complexity**: Time and space complexity analysis`,

    tests: (code, lang) => `You are a test engineer expert. Generate comprehensive unit tests for the following ${lang} code:

\`\`\`${lang}
${code}
\`\`\`

Generate:
1. Unit tests covering all functions/methods
2. Edge cases and boundary conditions
3. Error handling tests
4. Use the standard testing framework for ${lang}
5. Include test descriptions/comments`,
  };

  async function runAction(action) {
    const code = elements.codeInput.value.trim();
    if (!code) {
      App.showToast('Please paste some code first', 'error');
      return;
    }

    if (!mimoAPI.isConfigured()) {
      App.showToast('Please configure your API key in Settings', 'error');
      return;
    }

    const lang = elements.codeLanguage.value === 'auto' ? '' : elements.codeLanguage.value;
    const prompt = prompts[action](code, lang || 'the detected language');

    elements.codeResult.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;gap:8px"><div class="loading-spinner"></div> Analyzing code...</div>';

    try {
      const result = await mimoAPI.chatCompletion(
        [
          { role: 'system', content: 'You are an expert software engineer and code analyst. Provide detailed, actionable responses with code examples when appropriate. Use markdown formatting.' },
          { role: 'user', content: prompt },
        ],
        { model: elements.codeModel.value }
      );

      const content = result.choices?.[0]?.message?.content || 'No response received';
      elements.codeResult.innerHTML = renderMarkdown(content);
      highlightCode(elements.codeResult);
      UsageDashboard.trackUsage('code', code.length);
    } catch (err) {
      elements.codeResult.innerHTML = `<div style="color:var(--error);padding:20px">Error: ${escapeHtml(err.message)}</div>`;
    }
  }

  return { init };
})();
