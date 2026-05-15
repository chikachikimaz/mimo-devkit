/**
 * Text-to-Speech Module (MiMo V2 TTS)
 */
const TTSModule = (() => {
  const elements = {};

  const voices = [
    { id: 'Chelsie', name: 'Chelsie', lang: 'English', gender: 'Female' },
    { id: 'Aiden', name: 'Aiden', lang: 'English', gender: 'Male' },
    { id: 'Aurora', name: 'Aurora', lang: 'English', gender: 'Female' },
    { id: 'Caleb', name: 'Caleb', lang: 'English', gender: 'Male' },
    { id: 'Aria', name: 'Aria', lang: 'English', gender: 'Female' },
    { id: 'Daniel', name: 'Daniel', lang: 'English', gender: 'Male' },
  ];

  function init() {
    elements.textInput = document.getElementById('ttsInput');
    elements.voiceSelect = document.getElementById('ttsVoice');
    elements.speedSelect = document.getElementById('ttsSpeed');
    elements.generateBtn = document.getElementById('ttsGenerate');
    elements.audioPlayer = document.getElementById('ttsAudioPlayer');
    elements.audioContainer = document.getElementById('ttsAudioContainer');
    elements.downloadBtn = document.getElementById('ttsDownload');
    elements.charCount = document.getElementById('ttsCharCount');
    elements.historyList = document.getElementById('ttsHistoryList');

    populateVoices();

    elements.generateBtn.addEventListener('click', generateSpeech);
    elements.downloadBtn.addEventListener('click', downloadAudio);

    elements.textInput.addEventListener('input', () => {
      elements.charCount.textContent = elements.textInput.value.length;
    });

    loadHistory();
  }

  function populateVoices() {
    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.name} (${v.lang}, ${v.gender})`;
      elements.voiceSelect.appendChild(opt);
    });
  }

  async function generateSpeech() {
    const text = elements.textInput.value.trim();
    if (!text) {
      App.showToast('Please enter text to convert', 'error');
      return;
    }

    if (!mimoAPI.isConfigured()) {
      App.showToast('Please configure your API key in Settings', 'error');
      return;
    }

    elements.generateBtn.disabled = true;
    elements.generateBtn.innerHTML = '<div class="loading-spinner"></div> Generating...';

    try {
      const response = await fetch('https://api.mimo-v2.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': mimoAPI.apiKey,
        },
        body: JSON.stringify({
          model: 'mimo-v2-tts',
          input: text,
          voice: elements.voiceSelect.value || 'Chelsie',
          speed: parseFloat(elements.speedSelect.value) || 1.0,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      elements.audioPlayer.src = url;
      elements.audioContainer.hidden = false;
      elements.audioPlayer.play();

      addToHistory(text, elements.voiceSelect.value, url);
      App.showToast('Audio generated successfully', 'success');
      UsageDashboard.trackUsage('tts', text.length);
    } catch (err) {
      App.showToast(`Error: ${err.message}`, 'error');
    } finally {
      elements.generateBtn.disabled = false;
      elements.generateBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Generate Speech';
    }
  }

  function downloadAudio() {
    const src = elements.audioPlayer.src;
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = `mimo-tts-${Date.now()}.mp3`;
    a.click();
  }

  function addToHistory(text, voice, audioUrl) {
    const history = getHistory();
    history.unshift({
      text: text.substring(0, 100),
      voice,
      timestamp: new Date().toLocaleString(),
      audioUrl,
    });
    if (history.length > 20) history.pop();
    localStorage.setItem('mimo-tts-history', JSON.stringify(history));
    renderHistory();
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem('mimo-tts-history') || '[]');
    } catch {
      return [];
    }
  }

  function loadHistory() {
    renderHistory();
  }

  function renderHistory() {
    const history = getHistory();
    if (history.length === 0) {
      elements.historyList.innerHTML = '<p class="text-muted" style="padding:12px;font-size:13px">No TTS history yet</p>';
      return;
    }

    elements.historyList.innerHTML = history.map((item, i) => `
      <div class="tts-history-item">
        <div class="tts-history-text">${escapeHtml(item.text)}...</div>
        <div class="tts-history-meta">${item.voice} &middot; ${item.timestamp}</div>
      </div>
    `).join('');
  }

  return { init };
})();
