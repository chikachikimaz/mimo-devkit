/**
 * MiMo API Client
 * Handles communication with Xiaomi MiMo API (OpenAI-compatible format)
 */
class MiMoAPI {
  constructor() {
    this.baseUrl = 'https://api.mimo-v2.com/v1';
    this.apiKey = '';
    this.defaultModel = 'mimo-v2.5-pro';
    this.temperature = 0.7;
    this.thinkingMode = false;
  }

  configure({ apiKey, model, temperature, thinkingMode }) {
    if (apiKey !== undefined) this.apiKey = apiKey;
    if (model !== undefined) this.defaultModel = model;
    if (temperature !== undefined) this.temperature = temperature;
    if (thinkingMode !== undefined) this.thinkingMode = thinkingMode;
  }

  isConfigured() {
    return this.apiKey && this.apiKey.trim().length > 0;
  }

  /**
   * Send a chat completion request (non-streaming)
   */
  async chatCompletion(messages, options = {}) {
    if (!this.isConfigured()) throw new Error('API key not configured');

    const model = options.model || this.defaultModel;
    const body = {
      model,
      messages,
      max_completion_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? this.temperature,
      top_p: 0.95,
      stream: false,
    };

    if (this.thinkingMode || options.thinking) {
      body.thinking = { type: 'enabled', budget_tokens: 8192 };
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Send a streaming chat completion request
   */
  async *chatCompletionStream(messages, options = {}) {
    if (!this.isConfigured()) throw new Error('API key not configured');

    const model = options.model || this.defaultModel;
    const body = {
      model,
      messages,
      max_completion_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? this.temperature,
      top_p: 0.95,
      stream: true,
    };

    if (this.thinkingMode || options.thinking) {
      body.thinking = { type: 'enabled', budget_tokens: 8192 };
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;
          if (delta) yield delta;
        } catch {
          // skip malformed chunks
        }
      }
    }
  }

  /**
   * Send a multimodal request with image
   */
  async imageAnalysis(imageBase64, prompt, options = {}) {
    const model = options.model || 'mimo-v2.5';
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
          {
            type: 'text',
            text: prompt || 'Analyze this image in detail.',
          },
        ],
      },
    ];

    return this.chatCompletion(messages, { ...options, model });
  }
}

// Global instance
const mimoAPI = new MiMoAPI();
