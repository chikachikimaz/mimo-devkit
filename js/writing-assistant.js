/**
 * Writing Assistant Module
 */
const WritingAssistant = (() => {
  const elements = {};

  const writingModes = {
    email: {
      name: 'Professional Email',
      fields: [
        { id: 'emailPurpose', label: 'Purpose', type: 'text', placeholder: 'e.g., Follow up on meeting, Request for proposal...' },
        { id: 'emailRecipient', label: 'Recipient', type: 'text', placeholder: 'e.g., Manager, Client, Team...' },
        { id: 'emailTone', label: 'Tone', type: 'select', options: ['Formal', 'Semi-formal', 'Friendly', 'Apologetic', 'Persuasive'] },
        { id: 'emailPoints', label: 'Key Points', type: 'textarea', placeholder: 'List the main points to cover (one per line)' },
      ],
      buildPrompt: (vals) => `Write a professional email.
Purpose: ${vals.emailPurpose}
Recipient: ${vals.emailRecipient}
Tone: ${vals.emailTone}
Key points to cover:
${vals.emailPoints}

Include a clear subject line. Keep it concise and actionable. Format with proper greeting and sign-off.`
    },
    blog: {
      name: 'Blog Post',
      fields: [
        { id: 'blogTopic', label: 'Topic', type: 'text', placeholder: 'e.g., Best practices for React performance...' },
        { id: 'blogAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Junior developers, Tech leads...' },
        { id: 'blogTone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Technical', 'Inspirational', 'Humorous'] },
        { id: 'blogLength', label: 'Length', type: 'select', options: ['Short (500 words)', 'Medium (1000 words)', 'Long (2000+ words)'] },
        { id: 'blogKeywords', label: 'SEO Keywords', type: 'text', placeholder: 'Comma-separated keywords' },
      ],
      buildPrompt: (vals) => `Write a comprehensive blog post.
Topic: ${vals.blogTopic}
Target audience: ${vals.blogAudience}
Tone: ${vals.blogTone}
Length: ${vals.blogLength}
SEO Keywords: ${vals.blogKeywords}

Include:
- Engaging title with SEO keyword
- Hook in the introduction
- Clear structure with H2/H3 headings
- Practical examples and code snippets (if technical)
- Actionable takeaways
- Compelling conclusion with CTA
- Meta description (under 160 chars)`
    },
    social: {
      name: 'Social Media',
      fields: [
        { id: 'socialPlatform', label: 'Platform', type: 'select', options: ['Twitter/X', 'LinkedIn', 'Instagram', 'Facebook', 'TikTok Script'] },
        { id: 'socialTopic', label: 'Topic/Product', type: 'text', placeholder: 'What are you posting about?' },
        { id: 'socialGoal', label: 'Goal', type: 'select', options: ['Brand Awareness', 'Engagement', 'Lead Generation', 'Education', 'Entertainment'] },
        { id: 'socialTone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Humorous', 'Inspirational', 'Urgent'] },
      ],
      buildPrompt: (vals) => `Create social media content for ${vals.socialPlatform}.
Topic: ${vals.socialTopic}
Goal: ${vals.socialGoal}
Tone: ${vals.socialTone}

Create 3 variations for A/B testing. Include:
- Engaging hook/opening
- Relevant hashtags
- Call-to-action
- Emoji suggestions
- Best posting time recommendation
Platform-specific formatting and character limits.`
    },
    resume: {
      name: 'Resume/CV Section',
      fields: [
        { id: 'resumeSection', label: 'Section', type: 'select', options: ['Professional Summary', 'Work Experience', 'Skills Section', 'Cover Letter', 'LinkedIn Summary'] },
        { id: 'resumeRole', label: 'Target Role', type: 'text', placeholder: 'e.g., Senior Frontend Developer' },
        { id: 'resumeExperience', label: 'Your Experience', type: 'textarea', placeholder: 'Describe your relevant experience, achievements, skills...' },
        { id: 'resumeIndustry', label: 'Industry', type: 'text', placeholder: 'e.g., Fintech, SaaS, E-commerce...' },
      ],
      buildPrompt: (vals) => `Write a ${vals.resumeSection} for a resume/CV.
Target Role: ${vals.resumeRole}
Industry: ${vals.resumeIndustry}
Experience/Background:
${vals.resumeExperience}

Guidelines:
- Use strong action verbs
- Quantify achievements where possible
- Include relevant keywords for ATS systems
- Keep it concise and impactful
- Professional tone`
    },
    proposal: {
      name: 'Business Proposal',
      fields: [
        { id: 'proposalType', label: 'Type', type: 'select', options: ['Project Proposal', 'Business Plan Summary', 'Partnership Proposal', 'Funding Pitch'] },
        { id: 'proposalFor', label: 'For Whom', type: 'text', placeholder: 'e.g., Investor, Client, Management...' },
        { id: 'proposalDetails', label: 'Details', type: 'textarea', placeholder: 'Describe the project/business/partnership idea...' },
        { id: 'proposalBudget', label: 'Budget/Investment', type: 'text', placeholder: 'e.g., $50,000, TBD...' },
      ],
      buildPrompt: (vals) => `Write a ${vals.proposalType}.
Target audience: ${vals.proposalFor}
Budget/Investment: ${vals.proposalBudget}
Details:
${vals.proposalDetails}

Include:
- Executive summary
- Problem statement
- Proposed solution
- Timeline and milestones
- Budget breakdown
- Expected outcomes/ROI
- Next steps`
    },
  };

  function init() {
    elements.modeSelect = document.getElementById('writingMode');
    elements.formContainer = document.getElementById('writingForm');
    elements.generateBtn = document.getElementById('generateWriting');
    elements.result = document.getElementById('writingResult');
    elements.copyBtn = document.getElementById('copyWritingResult');
    elements.exportBtn = document.getElementById('exportWritingResult');

    populateModes();
    elements.modeSelect.addEventListener('change', renderForm);
    elements.generateBtn.addEventListener('click', generate);
    elements.copyBtn.addEventListener('click', copyResult);
    elements.exportBtn.addEventListener('click', exportResult);

    renderForm();
  }

  function populateModes() {
    for (const [key, mode] of Object.entries(writingModes)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = mode.name;
      elements.modeSelect.appendChild(opt);
    }
  }

  function renderForm() {
    const mode = writingModes[elements.modeSelect.value];
    if (!mode) return;

    elements.formContainer.innerHTML = mode.fields.map(field => {
      let input;
      if (field.type === 'textarea') {
        input = `<textarea id="${field.id}" class="writing-field" placeholder="${field.placeholder || ''}" rows="3"></textarea>`;
      } else if (field.type === 'select') {
        input = `<select id="${field.id}" class="writing-field">${field.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
      } else {
        input = `<input type="text" id="${field.id}" class="writing-field" placeholder="${field.placeholder || ''}" />`;
      }
      return `<div class="form-group"><label for="${field.id}">${field.label}</label>${input}</div>`;
    }).join('');
  }

  async function generate() {
    const mode = writingModes[elements.modeSelect.value];
    if (!mode) return;

    if (!mimoAPI.isConfigured()) {
      App.showToast('Please configure your API key in Settings', 'error');
      return;
    }

    const vals = {};
    mode.fields.forEach(f => {
      const el = document.getElementById(f.id);
      vals[f.id] = el ? el.value : '';
    });

    const hasEmpty = mode.fields.some(f => f.type !== 'select' && !vals[f.id]?.trim());
    if (hasEmpty) {
      App.showToast('Please fill in all fields', 'error');
      return;
    }

    const prompt = mode.buildPrompt(vals);

    elements.result.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;gap:8px"><div class="loading-spinner"></div> Generating content...</div>';

    try {
      const result = await mimoAPI.chatCompletion([
        { role: 'system', content: 'You are an expert content writer and communications specialist. Generate high-quality, professional content. Use markdown formatting.' },
        { role: 'user', content: prompt },
      ]);

      const content = result.choices?.[0]?.message?.content || 'No response received';
      elements.result.innerHTML = renderMarkdown(content);
      highlightCode(elements.result);
      UsageDashboard.trackUsage('writing', prompt.length);
    } catch (err) {
      elements.result.innerHTML = `<div style="color:var(--error);padding:20px">Error: ${escapeHtml(err.message)}</div>`;
    }
  }

  function copyResult() {
    const text = elements.result.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      App.showToast('Copied to clipboard', 'success');
    }
  }

  function exportResult() {
    const text = elements.result.innerText;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimo-writing-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    App.showToast('Exported as Markdown', 'success');
  }

  return { init };
})();
