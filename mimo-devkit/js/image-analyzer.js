/**
 * Image Analyzer Module
 */
const ImageAnalyzer = (() => {
  const elements = {};
  let currentImageBase64 = null;

  function init() {
    elements.dropZone = document.getElementById('imageDropZone');
    elements.fileInput = document.getElementById('imageInput');
    elements.preview = document.getElementById('imagePreview');
    elements.previewImg = document.getElementById('previewImg');
    elements.removeBtn = document.getElementById('removeImage');
    elements.prompt = document.getElementById('imagePrompt');
    elements.result = document.getElementById('imageResult');
    elements.modelSelect = document.getElementById('imageModel');
    elements.copyBtn = document.getElementById('copyImageResult');

    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.removeBtn.addEventListener('click', removeImage);

    elements.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.dropZone.classList.add('drag-over');
    });

    elements.dropZone.addEventListener('dragleave', () => {
      elements.dropZone.classList.remove('drag-over');
    });

    elements.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        loadImage(file);
      }
    });

    document.getElementById('analyzeImage').addEventListener('click', () => analyze('analyze'));
    document.getElementById('describeImage').addEventListener('click', () => analyze('describe'));
    document.getElementById('extractTextImage').addEventListener('click', () => analyze('ocr'));

    elements.copyBtn.addEventListener('click', () => {
      const text = elements.result.innerText;
      if (text) {
        navigator.clipboard.writeText(text);
        App.showToast('Copied to clipboard', 'success');
      }
    });
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) loadImage(file);
  }

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      currentImageBase64 = dataUrl.split(',')[1];
      elements.previewImg.src = dataUrl;
      elements.preview.hidden = false;
      elements.dropZone.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    currentImageBase64 = null;
    elements.preview.hidden = true;
    elements.dropZone.style.display = '';
    elements.fileInput.value = '';
  }

  const promptTemplates = {
    analyze: (custom) => custom || 'Analyze this image in detail. Describe what you see, identify key elements, and provide any relevant observations or insights.',
    describe: () => 'Provide a detailed description of this image. Include: subjects, setting, colors, composition, mood, and any notable details.',
    ocr: () => 'Extract all text visible in this image. Preserve the original formatting and structure as much as possible. If the text is in a specific language, provide both the original text and an English translation.',
  };

  async function analyze(action) {
    if (!currentImageBase64) {
      App.showToast('Please upload an image first', 'error');
      return;
    }

    if (!mimoAPI.isConfigured()) {
      App.showToast('Please configure your API key in Settings', 'error');
      return;
    }

    const customPrompt = elements.prompt.value.trim();
    const prompt = promptTemplates[action](customPrompt);

    elements.result.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;gap:8px"><div class="loading-spinner"></div> Analyzing image...</div>';

    try {
      const result = await mimoAPI.imageAnalysis(
        currentImageBase64,
        prompt,
        { model: elements.modelSelect.value }
      );

      const content = result.choices?.[0]?.message?.content || 'No response received';
      elements.result.innerHTML = renderMarkdown(content);
      highlightCode(elements.result);
      UsageDashboard.trackUsage('image', prompt.length);
    } catch (err) {
      elements.result.innerHTML = `<div style="color:var(--error);padding:20px">Error: ${escapeHtml(err.message)}</div>`;
    }
  }

  return { init };
})();
