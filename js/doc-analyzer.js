/**
 * Document Analyzer Module
 */
const DocAnalyzer = (() => {
  const elements = {};

  function init() {
    elements.docInput = document.getElementById('docInput');
    elements.docResult = document.getElementById('docResult');
    elements.copyBtn = document.getElementById('copyDocResult');

    document.getElementById('summarizeDoc').addEventListener('click', () => runAnalysis('summarize'));
    document.getElementById('extractKeyPoints').addEventListener('click', () => runAnalysis('keypoints'));
    document.getElementById('generateQA').addEventListener('click', () => runAnalysis('qa'));
    document.getElementById('rewriteDoc').addEventListener('click', () => runAnalysis('rewrite'));

    elements.copyBtn.addEventListener('click', () => {
      const text = elements.docResult.innerText;
      if (text) {
        navigator.clipboard.writeText(text);
        App.showToast('Copied to clipboard', 'success');
      }
    });
  }

  const prompts = {
    summarize: (text) => `Provide a comprehensive summary of the following document. Include:
1. **Executive Summary** (2-3 sentences)
2. **Main Topics** covered
3. **Key Findings/Arguments**
4. **Conclusions**

Document:
---
${text}
---`,

    keypoints: (text) => `Extract the key points from the following document. For each key point:
- State the point clearly and concisely
- Rate its importance (High/Medium/Low)
- Provide a brief context

Document:
---
${text}
---

Format the output as a numbered list with importance tags.`,

    qa: (text) => `Based on the following document, generate a comprehensive Q&A set:

Document:
---
${text}
---

Generate:
1. 5-10 questions and answers that cover the main topics
2. Include both factual and analytical questions
3. Provide detailed, accurate answers based solely on the document content
4. Format each Q&A clearly with **Q:** and **A:** labels`,

    rewrite: (text) => `Rewrite the following document to improve clarity, readability, and professionalism while preserving the original meaning and all key information.

Original document:
---
${text}
---

Provide:
1. The rewritten version
2. A brief note explaining the key improvements made`,
  };

  async function runAnalysis(action) {
    const text = elements.docInput.value.trim();
    if (!text) {
      App.showToast('Please paste a document first', 'error');
      return;
    }

    if (!mimoAPI.isConfigured()) {
      App.showToast('Please configure your API key in Settings', 'error');
      return;
    }

    const prompt = prompts[action](text);

    elements.docResult.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;gap:8px"><div class="loading-spinner"></div> Analyzing document...</div>';

    try {
      const result = await mimoAPI.chatCompletion([
        {
          role: 'system',
          content: 'You are an expert document analyst. Provide thorough, well-structured analysis using markdown formatting. Be precise and factual.',
        },
        { role: 'user', content: prompt },
      ]);

      const content = result.choices?.[0]?.message?.content || 'No response received';
      elements.docResult.innerHTML = renderMarkdown(content);
      highlightCode(elements.docResult);
      UsageDashboard.trackUsage('doc-analyzer', text.length);
    } catch (err) {
      elements.docResult.innerHTML = `<div style="color:var(--error);padding:20px">Error: ${escapeHtml(err.message)}</div>`;
    }
  }

  return { init };
})();
