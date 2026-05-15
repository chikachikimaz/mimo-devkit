/**
 * Usage Analytics Dashboard Module
 */
const UsageDashboard = (() => {
  const elements = {};
  const STORAGE_KEY = 'mimo-usage-stats';

  function init() {
    elements.container = document.getElementById('dashboardContainer');
    elements.clearBtn = document.getElementById('clearDashboard');
    elements.exportBtn = document.getElementById('exportDashboard');

    elements.clearBtn.addEventListener('click', clearStats);
    elements.exportBtn.addEventListener('click', exportStats);

    render();
  }

  function getStats() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveStats(stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  function trackUsage(feature, tokens) {
    const stats = getStats();
    const today = new Date().toISOString().split('T')[0];

    if (!stats.daily) stats.daily = {};
    if (!stats.daily[today]) stats.daily[today] = {};
    if (!stats.daily[today][feature]) stats.daily[today][feature] = { calls: 0, tokens: 0 };

    stats.daily[today][feature].calls++;
    stats.daily[today][feature].tokens += tokens || 0;

    if (!stats.total) stats.total = {};
    if (!stats.total[feature]) stats.total[feature] = { calls: 0, tokens: 0 };
    stats.total[feature].calls++;
    stats.total[feature].tokens += tokens || 0;

    if (!stats.totalCalls) stats.totalCalls = 0;
    stats.totalCalls++;

    if (!stats.totalTokens) stats.totalTokens = 0;
    stats.totalTokens += tokens || 0;

    if (!stats.history) stats.history = [];
    stats.history.unshift({
      feature,
      tokens: tokens || 0,
      timestamp: new Date().toISOString(),
    });
    if (stats.history.length > 100) stats.history = stats.history.slice(0, 100);

    saveStats(stats);

    if (elements.container) render();
  }

  function render() {
    const stats = getStats();
    const total = stats.total || {};
    const daily = stats.daily || {};
    const history = stats.history || [];

    const featureNames = {
      chat: 'AI Chat',
      code: 'Code Assistant',
      translator: 'Translator',
      'doc-analyzer': 'Doc Analyzer',
      image: 'Image Analyzer',
      tts: 'Text-to-Speech',
      writing: 'Writing Assistant',
      json: 'JSON Formatter',
      regex: 'Regex Helper',
    };

    const featureColors = {
      chat: '#6366f1',
      code: '#22c55e',
      translator: '#f59e0b',
      'doc-analyzer': '#ec4899',
      image: '#8b5cf6',
      tts: '#06b6d4',
      writing: '#f97316',
      json: '#14b8a6',
      regex: '#e11d48',
    };

    let totalCalls = 0;
    let totalTokens = 0;
    const featureData = [];

    for (const [key, val] of Object.entries(total)) {
      totalCalls += val.calls;
      totalTokens += val.tokens;
      featureData.push({ key, name: featureNames[key] || key, ...val, color: featureColors[key] || '#6366f1' });
    }

    featureData.sort((a, b) => b.calls - a.calls);

    const maxCalls = Math.max(...featureData.map(f => f.calls), 1);

    // Daily chart data (last 7 days)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const dayLabels = days.map(d => {
      const date = new Date(d + 'T00:00:00');
      return date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
    });

    const dayCounts = days.map(d => {
      const dayData = daily[d] || {};
      return Object.values(dayData).reduce((sum, v) => sum + v.calls, 0);
    });

    const maxDayCalls = Math.max(...dayCounts, 1);

    let html = `
      <div class="dashboard-stats-grid">
        <div class="stat-card">
          <div class="stat-number">${totalCalls.toLocaleString()}</div>
          <div class="stat-label">Total API Calls</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${formatTokens(totalTokens)}</div>
          <div class="stat-label">Total Tokens Used</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${featureData.length}</div>
          <div class="stat-label">Features Used</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${Object.keys(daily).length}</div>
          <div class="stat-label">Active Days</div>
        </div>
      </div>

      <div class="dashboard-charts">
        <div class="chart-card">
          <h3>Usage by Feature</h3>
          <div class="bar-chart">
            ${featureData.length > 0 ? featureData.map(f => `
              <div class="bar-row">
                <span class="bar-label">${f.name}</span>
                <div class="bar-track">
                  <div class="bar-fill" style="width:${(f.calls / maxCalls * 100)}%;background:${f.color}"></div>
                </div>
                <span class="bar-value">${f.calls}</span>
              </div>
            `).join('') : '<p class="text-muted" style="padding:12px">No usage data yet</p>'}
          </div>
        </div>

        <div class="chart-card">
          <h3>Last 7 Days</h3>
          <div class="daily-chart">
            ${days.map((d, i) => `
              <div class="daily-bar-col">
                <div class="daily-bar-wrapper">
                  <div class="daily-bar" style="height:${dayCounts[i] > 0 ? Math.max((dayCounts[i] / maxDayCalls * 100), 5) : 0}%"></div>
                </div>
                <span class="daily-label">${dayLabels[i].split(',')[0]}</span>
                <span class="daily-count">${dayCounts[i]}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="chart-card">
        <h3>Recent Activity</h3>
        <div class="activity-list">
          ${history.length > 0 ? history.slice(0, 20).map(h => {
            const time = new Date(h.timestamp).toLocaleString();
            return `<div class="activity-item">
              <span class="activity-dot" style="background:${featureColors[h.feature] || '#6366f1'}"></span>
              <span class="activity-name">${featureNames[h.feature] || h.feature}</span>
              <span class="activity-tokens">${h.tokens > 0 ? h.tokens.toLocaleString() + ' chars' : ''}</span>
              <span class="activity-time">${time}</span>
            </div>`;
          }).join('') : '<p class="text-muted" style="padding:12px">No activity yet. Start using the tools!</p>'}
        </div>
      </div>
    `;

    elements.container.innerHTML = html;
  }

  function formatTokens(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  }

  function clearStats() {
    if (confirm('Clear all usage statistics? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      render();
      App.showToast('Statistics cleared', 'success');
    }
  }

  function exportStats() {
    const stats = getStats();
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimo-devkit-usage-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    App.showToast('Usage data exported', 'success');
  }

  return { init, trackUsage };
})();
