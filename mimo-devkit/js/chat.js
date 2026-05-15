/**
 * Chat Module
 */
const ChatModule = (() => {
  let messages = [];
  let isStreaming = false;
  let abortController = null;

  const elements = {};

  function init() {
    elements.container = document.getElementById('chatContainer');
    elements.messagesEl = document.getElementById('chatMessages');
    elements.input = document.getElementById('chatInput');
    elements.sendBtn = document.getElementById('sendBtn');
    elements.clearBtn = document.getElementById('clearChat');
    elements.modelSelect = document.getElementById('chatModel');
    elements.welcome = elements.container.querySelector('.chat-welcome');
    elements.quickPrompts = elements.container.querySelectorAll('.quick-prompt');

    elements.sendBtn.addEventListener('click', sendMessage);
    elements.clearBtn.addEventListener('click', clearChat);

    elements.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    elements.input.addEventListener('input', autoResize);

    elements.quickPrompts.forEach((btn) => {
      btn.addEventListener('click', () => {
        elements.input.value = btn.dataset.prompt;
        sendMessage();
      });
    });
  }

  function autoResize() {
    elements.input.style.height = 'auto';
    elements.input.style.height = Math.min(elements.input.scrollHeight, 150) + 'px';
  }

  async function sendMessage() {
    const text = elements.input.value.trim();
    if (!text || isStreaming) return;

    if (!mimoAPI.isConfigured()) {
      App.showToast('Please configure your API key in Settings', 'error');
      return;
    }

    elements.welcome.classList.add('hidden');
    addMessage('user', text);
    elements.input.value = '';
    elements.input.style.height = 'auto';

    messages.push({ role: 'user', content: text });

    isStreaming = true;
    elements.sendBtn.disabled = true;
    abortController = new AbortController();

    const assistantEl = addMessage('assistant', '');
    const contentEl = assistantEl.querySelector('.message-text');
    contentEl.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

    let fullContent = '';
    let thinkingContent = '';

    try {
      const stream = mimoAPI.chatCompletionStream(
        [{ role: 'system', content: 'You are MiMo, a helpful AI assistant by Xiaomi. You provide clear, accurate, and well-structured responses. Use markdown formatting when helpful.' }, ...messages],
        { model: elements.modelSelect.value, signal: abortController.signal }
      );

      let firstChunk = true;
      for await (const delta of stream) {
        if (firstChunk) {
          contentEl.innerHTML = '';
          firstChunk = false;
        }

        if (delta.reasoning_content) {
          thinkingContent += delta.reasoning_content;
          renderThinking(contentEl, thinkingContent, fullContent);
        }

        if (delta.content) {
          fullContent += delta.content;
          renderContent(contentEl, thinkingContent, fullContent);
        }
      }

      if (firstChunk) {
        contentEl.innerHTML = '<em>No response received</em>';
      }

      messages.push({ role: 'assistant', content: fullContent });
      UsageDashboard.trackUsage('chat', text.length + fullContent.length);
    } catch (err) {
      if (err.name !== 'AbortError') {
        contentEl.innerHTML = `<span style="color: var(--error)">Error: ${escapeHtml(err.message)}</span>`;
      }
    } finally {
      isStreaming = false;
      elements.sendBtn.disabled = false;
      abortController = null;
      scrollToBottom();
    }
  }

  function renderThinking(el, thinking, content) {
    let html = '';
    if (thinking) {
      html += `<details class="thinking-block" open><summary>Thinking...</summary><div>${renderMarkdown(thinking)}</div></details>`;
    }
    if (content) {
      html += renderMarkdown(content);
    }
    el.innerHTML = html;
    highlightCode(el);
    scrollToBottom();
  }

  function renderContent(el, thinking, content) {
    let html = '';
    if (thinking) {
      html += `<details class="thinking-block"><summary>Thinking process</summary><div>${renderMarkdown(thinking)}</div></details>`;
    }
    html += renderMarkdown(content);
    el.innerHTML = html;
    highlightCode(el);
    scrollToBottom();
  }

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}`;

    const avatar = role === 'user' ? 'U' : 'M';
    div.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <div class="message-text">${role === 'user' ? escapeHtml(text) : (text ? renderMarkdown(text) : '')}</div>
      </div>
    `;

    elements.messagesEl.appendChild(div);
    if (role !== 'user' || text) highlightCode(div);
    scrollToBottom();
    return div;
  }

  function clearChat() {
    messages = [];
    elements.messagesEl.innerHTML = '';
    elements.welcome.classList.remove('hidden');
    if (abortController) abortController.abort();
  }

  function scrollToBottom() {
    elements.container.scrollTop = elements.container.scrollHeight;
  }

  return { init, clearChat };
})();
