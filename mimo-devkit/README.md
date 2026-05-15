# MiMo DevKit - AI Developer Toolkit

<div align="center">

**A comprehensive AI-powered developer toolkit built on Xiaomi MiMo API**

[Live Demo](https://mimo-devkit-wxgqebjg.devinapps.com) · [MiMo Platform](https://platform.xiaomimimo.com) · [Get API Key](https://mimo-v2.com/settings/api-keys)

</div>

---

## Overview

MiMo DevKit is an open-source, web-based developer productivity toolkit that leverages Xiaomi's MiMo large language models through their API platform. It provides **11 AI-powered tools** in a single, clean interface designed for developers, writers, and creators.

**Built for the [Xiaomi MiMo Orbit 100T Creator Incentive Program](https://100t.xiaomimimo.com/)** — demonstrating real-world utility of MiMo AI models across coding, writing, analysis, and productivity.

## Features (11 Tools)

### AI Chat
- Real-time streaming conversations with MiMo models
- Support for all MiMo V2.5 models (Pro, Standard, Omni)
- Deep thinking mode with visible reasoning process
- Markdown rendering with syntax highlighting
- Quick prompt templates
- Usage tracking

### Code Assistant
- **Code Review** — Detect bugs, security issues, and anti-patterns
- **Code Optimization** — Get performance and readability improvements
- **Code Explanation** — Line-by-line breakdown with complexity analysis
- **Test Generation** — Auto-generate comprehensive unit tests
- Multi-language support (Python, JavaScript, TypeScript, Java, Go, Rust, C++, PHP, Ruby, Swift)

### Smart Translator
- AI-powered translation between 12+ languages
- Natural, fluent translations preserving tone and context
- Auto language detection
- One-click language swap
- Character counter

### Document Analyzer
- **Summarize** — Generate executive summaries
- **Key Points** — Extract and prioritize important information
- **Q&A Generation** — Create study/review questions from documents
- **Rewrite** — Improve clarity and professionalism

### Image Analyzer
- Multimodal image analysis using MiMo V2.5 / V2 Omni
- Detailed image description
- OCR text extraction
- Custom question-based image analysis
- Drag & drop upload

### Writing Assistant
- **Professional Email** — With purpose, recipient, tone controls
- **Blog Post** — SEO-optimized with keyword support
- **Social Media** — Platform-specific content (Twitter, LinkedIn, Instagram, etc.)
- **Resume/CV Section** — ATS-optimized professional writing
- **Business Proposal** — Structured proposals with ROI analysis
- Export to Markdown

### Text-to-Speech (TTS)
- MiMo V2 TTS model integration
- 6 voice options (3 male, 3 female)
- Adjustable speed (0.5x - 2.0x)
- Audio playback and MP3 download
- TTS history tracking

### Prompt Library
- **35+ curated prompt templates** across 6 categories:
  - Coding & Development (8 templates)
  - Writing & Content (6 templates)
  - Analysis & Research (4 templates)
  - Productivity & Planning (5 templates)
  - Learning & Education (4 templates)
  - Creative & Fun (4 templates)
- Search and filter by category
- One-click "Use in Chat" integration
- Copy to clipboard

### JSON Tools
- **Format** — Pretty-print with syntax highlighting
- **Minify** — Compact JSON output
- **Validate** — Deep analysis with stats (depth, types, key count)
- **Fix with AI** — AI-powered JSON repair
- **Convert** — JSON to CSV, JSON to YAML
- Real-time validation status bar

### Regex Helper
- Live pattern matching with highlighting
- Match details (position, capture groups)
- **12 common patterns** (email, URL, phone, IP, date, UUID, etc.)
- **AI Explain** — Get human-readable regex explanations
- **AI Generate** — Describe what to match, get the regex
- Real-time match count

### Usage Dashboard
- Total API calls and token usage tracking
- Feature-by-feature usage breakdown
- Last 7 days activity chart
- Recent activity log
- Export usage data as JSON
- Clear statistics option

## Additional Features

- **Keyboard Shortcuts** — Alt+1 through Alt+0 for quick page switching
- **Dark Theme** — Professional dark UI with custom scrollbars
- **Responsive Design** — Works on desktop and tablet
- **LocalStorage** — Settings and usage data persist between sessions
- **Zero Build Step** — No npm, no webpack, no framework needed

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (zero dependencies, zero build step)
- **API**: Xiaomi MiMo API (OpenAI-compatible format)
- **Styling**: Custom CSS with CSS variables, responsive grid layouts
- **Libraries**: marked.js (Markdown), highlight.js (syntax highlighting)

## Quick Start

### 1. Get a MiMo API Key
1. Register at [MiMo Platform](https://mimo-v2.com)
2. Navigate to [API Keys](https://mimo-v2.com/settings/api-keys)
3. Create a new API key

### 2. Run Locally
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mimo-devkit.git
cd mimo-devkit

# Serve with any static file server
python3 -m http.server 8080
# or
npx serve .
```

### 3. Configure
1. Open http://localhost:8080
2. Click **Settings** (gear icon) in the sidebar
3. Enter your MiMo API key
4. Select your preferred model and options
5. Start using all 11 tools!

## Models Supported

| Model | ID | Best For |
|-------|-----|----------|
| MiMo V2.5 Pro | `mimo-v2.5-pro` | Complex reasoning, coding, analysis |
| MiMo V2.5 | `mimo-v2.5` | Multimodal (text + image), general use |
| MiMo V2 Pro | `mimo-v2-pro` | Agent tasks, tool calling |
| MiMo V2 Omni | `mimo-v2-omni` | Multimodal understanding |
| MiMo V2 TTS | `mimo-v2-tts` | Text-to-speech generation |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Alt + 1 | AI Chat |
| Alt + 2 | Code Assistant |
| Alt + 3 | Translator |
| Alt + 4 | Doc Analyzer |
| Alt + 5 | Image Analyzer |
| Alt + 6 | Writing Assistant |
| Alt + 7 | Text-to-Speech |
| Alt + 8 | Prompt Library |
| Alt + 9 | JSON Tools |
| Alt + 0 | Dashboard |
| Alt + S | Settings |

## Deployment

This is a static site — deploy to any static hosting:

```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod

# GitHub Pages
# Push to gh-pages branch

# Any static file server
cp -r . /var/www/html/mimo-devkit
```

## Project Structure

```
mimo-devkit/
├── index.html              # Main HTML layout (all pages)
├── styles.css              # Full CSS styles (dark theme, 1600+ lines)
├── js/
│   ├── api.js              # MiMo API client (streaming, multimodal)
│   ├── app.js              # App controller, settings, navigation, shortcuts
│   ├── chat.js             # AI chat module
│   ├── code-assistant.js   # Code review/optimize/explain/test
│   ├── translator.js       # Multi-language translator
│   ├── doc-analyzer.js     # Document analysis module
│   ├── image-analyzer.js   # Image analysis (multimodal)
│   ├── writing-assistant.js # Email, blog, social, resume, proposal
│   ├── tts.js              # Text-to-speech module
│   ├── prompt-library.js   # 35+ curated prompt templates
│   ├── json-formatter.js   # JSON format/validate/convert
│   ├── regex-helper.js     # Regex build/test/explain
│   └── dashboard.js        # Usage analytics dashboard
└── README.md
```

## API Integration

MiMo DevKit uses the OpenAI-compatible API format:

```javascript
// Base URL
https://api.mimo-v2.com/v1

// Authentication
Header: api-key: YOUR_API_KEY

// Streaming support
stream: true  // Server-Sent Events

// Thinking mode
thinking: { type: "enabled", budget_tokens: 8192 }

// TTS
POST /v1/audio/speech
{ model: "mimo-v2-tts", input: "text", voice: "Chelsie" }
```

## License

MIT License - feel free to use, modify, and distribute.

## Acknowledgments

- [Xiaomi MiMo](https://mimo.xiaomi.com/) — for the powerful AI models
- [MiMo Orbit 100T Program](https://100t.xiaomimimo.com/) — for the creator incentive
- [marked.js](https://marked.js.org/) — Markdown parsing
- [highlight.js](https://highlightjs.org/) — Syntax highlighting
