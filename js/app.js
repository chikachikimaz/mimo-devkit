/**
 * Main Application Controller
 */

// --- Utility Functions (global) ---

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderMarkdown(text) {
  if (!text) return '';
  try {
    return marked.parse(text, { breaks: true, gfm: true });
  } catch {
    return escapeHtml(text);
  }
}

function highlightCode(container) {
  container.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
}

// --- App Module ---

const App = (() => {
  function init() {
    loadSettings();
    setupNavigation();
    setupSettings();
    setupSidebar();

    ChatModule.init();
    CodeAssistant.init();
    Translator.init();
    DocAnalyzer.init();
    ImageAnalyzer.init();
    WritingAssistant.init();
    TTSModule.init();
    PromptLibrary.init();
    JsonFormatter.init();
    RegexHelper.init();
    UsageDashboard.init();

    setupKeyboardShortcuts();
    updateApiStatus();
  }

  // --- Keyboard Shortcuts ---

  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.key === '1' && e.altKey) { e.preventDefault(); navigateTo('chat'); }
      if (e.key === '2' && e.altKey) { e.preventDefault(); navigateTo('code'); }
      if (e.key === '3' && e.altKey) { e.preventDefault(); navigateTo('translator'); }
      if (e.key === '4' && e.altKey) { e.preventDefault(); navigateTo('doc-analyzer'); }
      if (e.key === '5' && e.altKey) { e.preventDefault(); navigateTo('image-analyzer'); }
      if (e.key === '6' && e.altKey) { e.preventDefault(); navigateTo('writing'); }
      if (e.key === '7' && e.altKey) { e.preventDefault(); navigateTo('tts'); }
      if (e.key === '8' && e.altKey) { e.preventDefault(); navigateTo('prompts'); }
      if (e.key === '9' && e.altKey) { e.preventDefault(); navigateTo('json'); }
      if (e.key === '0' && e.altKey) { e.preventDefault(); navigateTo('dashboard'); }
      if (e.key === 's' && e.altKey) { e.preventDefault(); document.getElementById('settingsBtn').click(); }
    });
  }

  // --- Navigation ---

  function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        navigateTo(page);
      });
    });
  }

  function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach((el) => el.classList.remove('active'));
    document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'));

    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    const pageEl = document.getElementById(`page-${page}`);

    if (navItem) navItem.classList.add('active');
    if (pageEl) pageEl.classList.add('active');
  }

  // --- Sidebar ---

  function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // --- Settings ---

  function setupSettings() {
    const modal = document.getElementById('settingsModal');
    const openBtn = document.getElementById('settingsBtn');
    const closeBtn = document.getElementById('closeSettings');
    const saveBtn = document.getElementById('saveSettings');
    const toggleKey = document.getElementById('toggleApiKey');
    const apiKeyInput = document.getElementById('apiKey');
    const tempSlider = document.getElementById('temperature');
    const tempValue = document.getElementById('tempValue');

    openBtn.addEventListener('click', () => {
      modal.classList.add('open');
      const settings = loadSettingsFromStorage();
      apiKeyInput.value = settings.apiKey || '';
      document.getElementById('defaultModel').value = settings.model || 'mimo-v2.5-pro';
      document.getElementById('thinkingMode').checked = settings.thinkingMode || false;
      tempSlider.value = settings.temperature ?? 0.7;
      tempValue.textContent = tempSlider.value;
    });

    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    toggleKey.addEventListener('click', () => {
      apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    });

    tempSlider.addEventListener('input', () => {
      tempValue.textContent = tempSlider.value;
    });

    saveBtn.addEventListener('click', () => {
      const settings = {
        apiKey: apiKeyInput.value.trim(),
        model: document.getElementById('defaultModel').value,
        thinkingMode: document.getElementById('thinkingMode').checked,
        temperature: parseFloat(tempSlider.value),
      };

      saveSettingsToStorage(settings);
      applySettings(settings);
      modal.classList.remove('open');
      showToast('Settings saved successfully', 'success');
    });
  }

  function loadSettings() {
    const settings = loadSettingsFromStorage();
    applySettings(settings);
  }

  function applySettings(settings) {
    mimoAPI.configure({
      apiKey: settings.apiKey,
      model: settings.model,
      temperature: settings.temperature,
      thinkingMode: settings.thinkingMode,
    });
    updateApiStatus();
  }

  function loadSettingsFromStorage() {
    try {
      const raw = localStorage.getItem('mimo-devkit-settings');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveSettingsToStorage(settings) {
    localStorage.setItem('mimo-devkit-settings', JSON.stringify(settings));
  }

  function updateApiStatus() {
    const statusEl = document.getElementById('apiStatus');
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('.status-text');

    if (mimoAPI.isConfigured()) {
      dot.className = 'status-dot online';
      text.textContent = 'API connected';
    } else {
      dot.className = 'status-dot offline';
      text.textContent = 'API not configured';
    }
  }

  // --- Toast ---

  function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  return { init, showToast, navigateTo };
})();

// --- Boot ---
document.addEventListener('DOMContentLoaded', App.init);
