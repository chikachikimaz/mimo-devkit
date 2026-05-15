/**
 * Prompt Templates Library Module
 */
const PromptLibrary = (() => {
  const elements = {};

  const categories = {
    coding: {
      name: 'Coding & Development',
      icon: '&lt;/&gt;',
      templates: [
        { title: 'Debug This Code', prompt: 'I have a bug in my code. Here\'s the error message and relevant code:\n\nError:\n[paste error]\n\nCode:\n```\n[paste code]\n```\n\nPlease help me identify and fix the bug. Explain what caused it and how to prevent it in the future.' },
        { title: 'Write API Endpoint', prompt: 'Create a REST API endpoint with the following specifications:\n\n- Method: [GET/POST/PUT/DELETE]\n- Path: /api/[resource]\n- Description: [what it does]\n- Request body: [if applicable]\n- Response format: JSON\n- Language/Framework: [e.g., Python/FastAPI, Node.js/Express]\n\nInclude input validation, error handling, and documentation comments.' },
        { title: 'Database Schema Design', prompt: 'Design a database schema for [application type]. Requirements:\n\n1. [requirement 1]\n2. [requirement 2]\n3. [requirement 3]\n\nInclude:\n- Table definitions with columns, types, and constraints\n- Primary and foreign keys\n- Indexes for common queries\n- Migration script in SQL' },
        { title: 'Code Refactoring', prompt: 'Refactor the following code to improve:\n- Readability and maintainability\n- Performance\n- Error handling\n- Following SOLID principles\n\n```\n[paste code]\n```\n\nExplain each change you made and why.' },
        { title: 'Architecture Design', prompt: 'Design the architecture for a [type] application with these requirements:\n\n1. [requirement 1]\n2. [requirement 2]\n3. [requirement 3]\n\nInclude:\n- System components and their responsibilities\n- Data flow diagram\n- Technology stack recommendations\n- Scalability considerations\n- Security measures' },
        { title: 'Git Commit Message', prompt: 'Write a clear and descriptive git commit message following conventional commits format for these changes:\n\n[describe your changes]\n\nInclude:\n- Type (feat/fix/docs/style/refactor/test/chore)\n- Scope\n- Short description\n- Detailed body explaining what and why' },
        { title: 'CI/CD Pipeline', prompt: 'Create a CI/CD pipeline configuration for a [language/framework] project.\n\nRequirements:\n- Run tests on pull requests\n- Lint and format checking\n- Build and deploy to [environment]\n- Environment: [GitHub Actions/GitLab CI/Jenkins]\n\nInclude the full YAML configuration file with comments.' },
        { title: 'Docker Setup', prompt: 'Create a Dockerfile and docker-compose.yml for a [type] application with:\n\n- Application: [describe app]\n- Dependencies: [list dependencies]\n- Database: [if needed]\n- Environment variables needed\n\nInclude multi-stage build, health checks, and security best practices.' },
      ]
    },
    writing: {
      name: 'Writing & Content',
      icon: '&#9998;',
      templates: [
        { title: 'Blog Post', prompt: 'Write a comprehensive blog post about [topic].\n\nTarget audience: [who]\nTone: [professional/casual/technical]\nLength: approximately [X] words\n\nInclude:\n- Engaging title and hook\n- Clear structure with headings\n- Practical examples or case studies\n- Actionable takeaways\n- SEO-friendly meta description' },
        { title: 'Professional Email', prompt: 'Write a professional email for the following situation:\n\nPurpose: [what you need]\nRecipient: [who/role]\nTone: [formal/semi-formal/friendly]\nKey points to cover:\n1. [point 1]\n2. [point 2]\n3. [point 3]\n\nKeep it concise and actionable.' },
        { title: 'Product Description', prompt: 'Write a compelling product description for:\n\nProduct: [name]\nCategory: [type]\nTarget audience: [who]\nKey features:\n1. [feature 1]\n2. [feature 2]\n3. [feature 3]\n\nInclude:\n- Attention-grabbing headline\n- Benefits-focused description\n- Technical specifications\n- Call to action' },
        { title: 'Social Media Post', prompt: 'Create social media content for [platform]:\n\nTopic: [what about]\nGoal: [awareness/engagement/conversion]\nTone: [professional/casual/humorous]\nInclude relevant hashtags.\n\nCreate 3 variations to A/B test.' },
        { title: 'Technical Documentation', prompt: 'Write technical documentation for [feature/API/library].\n\nInclude:\n- Overview and purpose\n- Prerequisites\n- Installation/setup steps\n- Usage examples with code snippets\n- API reference (if applicable)\n- Troubleshooting common issues\n- FAQ section' },
        { title: 'Press Release', prompt: 'Write a press release for:\n\nCompany: [name]\nAnnouncement: [what]\nDate: [when]\nKey details: [important info]\n\nFollow standard press release format with headline, dateline, lead paragraph, body, and boilerplate.' },
      ]
    },
    analysis: {
      name: 'Analysis & Research',
      icon: '&#128270;',
      templates: [
        { title: 'SWOT Analysis', prompt: 'Perform a SWOT analysis for [company/product/idea]:\n\nContext: [brief description]\nIndustry: [sector]\nTarget market: [who]\n\nProvide detailed analysis of:\n- Strengths (internal positives)\n- Weaknesses (internal negatives)\n- Opportunities (external positives)\n- Threats (external negatives)\n\nInclude actionable recommendations based on the analysis.' },
        { title: 'Market Research', prompt: 'Conduct a market research analysis for [product/service] in [market/region]:\n\n1. Market size and growth trends\n2. Target customer segments and personas\n3. Competitive landscape (key players, market share)\n4. Pricing strategies\n5. Distribution channels\n6. Entry barriers\n7. Recommendations' },
        { title: 'Data Interpretation', prompt: 'Analyze the following data and provide insights:\n\n[paste data or describe dataset]\n\nPlease:\n1. Identify key trends and patterns\n2. Highlight anomalies or outliers\n3. Provide statistical summary\n4. Draw actionable conclusions\n5. Suggest next steps or deeper analysis areas' },
        { title: 'Competitor Analysis', prompt: 'Analyze the competitive landscape for [product/service]:\n\nOur product: [description]\nCompetitors: [list known competitors]\n\nCompare on:\n- Features and capabilities\n- Pricing models\n- Target audience\n- Market positioning\n- Strengths and weaknesses\n- Unique value propositions\n\nProvide strategic recommendations.' },
      ]
    },
    productivity: {
      name: 'Productivity & Planning',
      icon: '&#128203;',
      templates: [
        { title: 'Project Plan', prompt: 'Create a detailed project plan for [project name]:\n\nObjective: [what to achieve]\nTimeline: [duration]\nTeam size: [number]\nBudget: [if applicable]\n\nInclude:\n- Project phases and milestones\n- Task breakdown with estimated durations\n- Resource allocation\n- Risk assessment and mitigation\n- Success metrics and KPIs' },
        { title: 'Meeting Agenda', prompt: 'Create a meeting agenda for:\n\nMeeting type: [standup/planning/review/brainstorm]\nDuration: [time]\nParticipants: [who]\nObjective: [what to accomplish]\n\nInclude:\n- Time-boxed agenda items\n- Discussion topics with owners\n- Action items template\n- Follow-up section' },
        { title: 'OKR Framework', prompt: 'Create OKRs (Objectives and Key Results) for [team/individual/company]:\n\nPeriod: [Q1/Q2/etc.]\nFocus areas: [list areas]\nContext: [current situation]\n\nFor each objective, provide:\n- Clear, inspiring objective statement\n- 3-5 measurable key results\n- Initiatives/tasks to achieve each KR\n- How to measure progress' },
        { title: 'Decision Matrix', prompt: 'Help me make a decision between these options:\n\nOptions:\n1. [option 1]\n2. [option 2]\n3. [option 3]\n\nCriteria to consider:\n- [criterion 1]\n- [criterion 2]\n- [criterion 3]\n\nCreate a weighted decision matrix with scoring and provide a recommendation with reasoning.' },
        { title: 'Sprint Planning', prompt: 'Help plan a sprint with the following backlog items:\n\n[list items]\n\nTeam capacity: [story points or hours]\nSprint duration: [weeks]\n\nPrioritize items, estimate effort, identify dependencies, and suggest a sprint goal.' },
      ]
    },
    learning: {
      name: 'Learning & Education',
      icon: '&#127891;',
      templates: [
        { title: 'Explain Like I\'m 5', prompt: 'Explain [complex topic] in the simplest terms possible, as if explaining to a 5-year-old. Use analogies, examples from everyday life, and avoid jargon. Then gradually increase complexity with:\n\n1. Beginner explanation\n2. Intermediate explanation\n3. Advanced explanation' },
        { title: 'Create Study Guide', prompt: 'Create a comprehensive study guide for [subject/topic]:\n\n1. Key concepts and definitions\n2. Important formulas/rules\n3. Common examples and practice problems\n4. Memory aids and mnemonics\n5. Common mistakes to avoid\n6. Review questions with answers\n7. Recommended resources for deeper learning' },
        { title: 'Learning Roadmap', prompt: 'Create a learning roadmap for [skill/technology/subject]:\n\nCurrent level: [beginner/intermediate]\nGoal: [what to achieve]\nTime available: [hours per week]\n\nInclude:\n- Prerequisites\n- Phase-by-phase learning path\n- Recommended resources (courses, books, tutorials)\n- Practice projects for each phase\n- Milestones and assessment criteria' },
        { title: 'Interview Prep', prompt: 'Prepare me for a [role] interview at [company type]:\n\nExperience level: [junior/mid/senior]\nFocus areas: [list areas]\n\nProvide:\n1. Common technical questions with model answers\n2. Behavioral questions using STAR format\n3. System design scenarios (if applicable)\n4. Questions to ask the interviewer\n5. Tips for success' },
      ]
    },
    creative: {
      name: 'Creative & Fun',
      icon: '&#127912;',
      templates: [
        { title: 'Story Generator', prompt: 'Write a [genre] short story with the following elements:\n\nSetting: [where/when]\nMain character: [description]\nConflict: [what challenge]\nTheme: [underlying message]\nLength: approximately [X] words\nTone: [serious/humorous/mysterious]\n\nInclude vivid descriptions, dialogue, and a satisfying conclusion.' },
        { title: 'Brainstorm Ideas', prompt: 'Brainstorm 20 creative ideas for [topic/challenge]:\n\nContext: [situation]\nConstraints: [any limitations]\nTarget: [who it\'s for]\n\nFor each idea, provide:\n- Brief description\n- Feasibility rating (1-5)\n- Potential impact\n- Quick implementation steps' },
        { title: 'Name Generator', prompt: 'Generate creative names for [what needs naming]:\n\nType: [app/company/product/feature/project]\nIndustry: [sector]\nValues to convey: [list values]\nTarget audience: [who]\n\nProvide 15 options with:\n- Name\n- Meaning/reasoning\n- Domain availability suggestion\n- Tagline suggestion' },
        { title: 'Presentation Outline', prompt: 'Create a presentation outline for [topic]:\n\nAudience: [who]\nDuration: [minutes]\nPurpose: [inform/persuade/inspire]\n\nInclude:\n- Title slide concept\n- Opening hook\n- Key sections with talking points\n- Data/visual suggestions for each slide\n- Compelling conclusion and call-to-action\n- Speaker notes' },
      ]
    }
  };

  function init() {
    elements.container = document.getElementById('promptLibraryContainer');
    elements.searchInput = document.getElementById('promptSearch');
    elements.categoryFilter = document.getElementById('promptCategory');

    renderTemplates();

    elements.searchInput.addEventListener('input', filterTemplates);
    elements.categoryFilter.addEventListener('change', filterTemplates);
  }

  function renderTemplates(filter = '', category = 'all') {
    let html = '';
    const lowerFilter = filter.toLowerCase();

    for (const [catKey, cat] of Object.entries(categories)) {
      if (category !== 'all' && category !== catKey) continue;

      const filtered = cat.templates.filter(t =>
        !lowerFilter || t.title.toLowerCase().includes(lowerFilter) || t.prompt.toLowerCase().includes(lowerFilter)
      );

      if (filtered.length === 0) continue;

      html += `<div class="prompt-category">
        <h3 class="category-title"><span class="category-icon">${cat.icon}</span> ${cat.name}</h3>
        <div class="prompt-grid">`;

      for (const tmpl of filtered) {
        const preview = tmpl.prompt.substring(0, 120).replace(/\n/g, ' ') + '...';
        html += `<div class="prompt-card" data-prompt="${escapeHtml(tmpl.prompt)}">
          <h4>${escapeHtml(tmpl.title)}</h4>
          <p>${escapeHtml(preview)}</p>
          <div class="prompt-card-actions">
            <button class="btn btn-sm btn-primary use-prompt-btn">Use in Chat</button>
            <button class="btn btn-sm btn-secondary copy-prompt-btn">Copy</button>
          </div>
        </div>`;
      }

      html += '</div></div>';
    }

    if (!html) {
      html = '<div class="result-placeholder"><p>No templates found matching your search.</p></div>';
    }

    elements.container.innerHTML = html;

    elements.container.querySelectorAll('.use-prompt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.prompt-card');
        const prompt = card.dataset.prompt;
        App.navigateTo('chat');
        const chatInput = document.getElementById('chatInput');
        chatInput.value = prompt;
        chatInput.focus();
        chatInput.dispatchEvent(new Event('input'));
        App.showToast('Prompt loaded into chat', 'success');
      });
    });

    elements.container.querySelectorAll('.copy-prompt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.prompt-card');
        navigator.clipboard.writeText(card.dataset.prompt);
        App.showToast('Prompt copied to clipboard', 'success');
      });
    });
  }

  function filterTemplates() {
    const filter = elements.searchInput.value.trim();
    const category = elements.categoryFilter.value;
    renderTemplates(filter, category);
  }

  return { init };
})();
