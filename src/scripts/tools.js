import { supabase } from './supabase.js';

// ── Tool Definitions ──
export const tools = {
  'feature-title': {
    title: 'Viral Title Generator',
    subtitle: 'Craft click-worthy titles with open loops and emotional triggers.',
    toolKey: 'title',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    tier: 'starter',
    render: () => `
      <div class="tool-input-group">
        <label class="tool-input-label">Video Topic</label>
        <input type="text" id="toolInputTopic" placeholder="e.g. How to Grow on YouTube in 2024" class="tool-input">
      </div>
      <div class="tool-input-group">
        <label class="tool-input-label">Tone</label>
        <select id="toolInputTone" class="tool-input">
          <option value="dramatic">Dramatic & Intriguing</option>
          <option value="educational">Educational & Clear</option>
          <option value="humorous">Humorous & Witty</option>
          <option value="urgent">Urgent & Bold</option>
        </select>
      </div>
      <div id="toolResultsArea" class="tool-results" style="display:none;">
        <h4 class="tool-results-heading">Generated Suggestions:</h4>
        <div id="toolResultsList"></div>
      </div>
    `,
    getParams: () => ({
      topic: document.getElementById('toolInputTopic')?.value || 'YouTube Growth',
      tone: document.getElementById('toolInputTone')?.value || 'dramatic'
    })
  },
  'feature-script': {
    title: 'Short Script Writer',
    subtitle: 'High-retention scripts for Shorts, TikTok & Reels.',
    toolKey: 'script',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    tier: 'starter',
    render: () => `
      <div class="tool-input-group">
        <label class="tool-input-label">Script Topic</label>
        <input type="text" id="toolInputTopic" placeholder="e.g. 5 Morning Habits for Success" class="tool-input">
      </div>
      <div class="tool-input-group">
        <label class="tool-input-label">Length</label>
        <select id="toolInputLength" class="tool-input">
          <option value="15s">15 Seconds (Ultra-Fast)</option>
          <option value="30s">30 Seconds (Fast-Paced)</option>
          <option value="60s">60 Seconds (Detailed)</option>
        </select>
      </div>
      <div id="toolResultsArea" class="tool-results" style="display:none;">
        <h4 class="tool-results-heading">Generated Script:</h4>
        <div id="toolResultsList"></div>
      </div>
    `,
    getParams: () => ({
      topic: document.getElementById('toolInputTopic')?.value || 'Amazing Content',
      length: document.getElementById('toolInputLength')?.value || '30s'
    })
  },
  'feature-thumbnail': {
    title: 'Thumbnail Concept Gen',
    subtitle: 'Visual hook ideas and compositions that grab attention.',
    toolKey: 'thumbnail',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    tier: 'starter',
    render: () => `
      <div class="tool-input-group">
        <label class="tool-input-label">Video Topic</label>
        <input type="text" id="toolInputTopic" placeholder="e.g. I Quit My Job to Travel" class="tool-input">
      </div>
      <div class="tool-input-group">
        <label class="tool-input-label">Style</label>
        <select id="toolInputStyle" class="tool-input">
          <option value="bold and vibrant">Bold & Vibrant</option>
          <option value="clean and minimal">Clean & Minimal</option>
          <option value="dark and dramatic">Dark & Dramatic</option>
          <option value="playful and colorful">Playful & Fun</option>
        </select>
      </div>
      <div id="toolResultsArea" class="tool-results" style="display:none;">
        <h4 class="tool-results-heading">Thumbnail Concepts:</h4>
        <div id="toolResultsList"></div>
      </div>
    `,
    getParams: () => ({
      topic: document.getElementById('toolInputTopic')?.value || 'Awesome Video',
      style: document.getElementById('toolInputStyle')?.value || 'bold and vibrant'
    })
  },
  'feature-seo': {
    title: 'SEO & Niche Researcher',
    subtitle: 'Find low-competition keywords and high-demand niches.',
    toolKey: 'seo',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    tier: 'starter',
    render: () => `
      <div class="tool-input-group">
        <label class="tool-input-label">Niche / Topic</label>
        <input type="text" id="toolInputTopic" placeholder="e.g. AI News, Budget Cooking, Fitness" class="tool-input">
      </div>
      <div id="toolResultsArea" class="tool-results" style="display:none;">
        <h4 class="tool-results-heading">SEO Analysis:</h4>
        <div id="toolResultsList"></div>
      </div>
    `,
    getParams: () => ({
      topic: document.getElementById('toolInputTopic')?.value || 'Technology'
    })
  }
};

let currentToolId = null;

// ── AI API Call ──
export async function callAI(toolKey, params) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Please sign in to use AI tools');

  const { data, error } = await supabase.functions.invoke('ai-generate', {
    body: { tool: toolKey, params }
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

// ── Init (for index.html) ──
export function initTools() {
  const toolOverlay = document.getElementById('toolOverlay');
  const closeBtn = document.getElementById('toolModalClose');
  const runBtn = document.getElementById('runToolBtn');

  // Bind feature cards (bento grid on home page)
  document.querySelectorAll('.bento-card[id]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.pro-lock-overlay')) return;
      const toolId = card.id.replace('feature-kb', 'feature-title')
                            .replace('feature-nocode', 'feature-script')
                            .replace('feature-text2flow', 'feature-thumbnail')
                            .replace('feature-mcp', 'feature-seo');
      openTool(toolId);
    });
  });

  // Also bind old feature-card IDs
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.pro-lock-overlay')) return;
      openTool(card.id);
    });
  });

  // Hero "Explore Tools"
  document.querySelector('[data-action="explore"]')?.addEventListener('click', () => {
    document.querySelector('#features').scrollIntoView({ behavior: 'smooth' });
  });

  closeBtn?.addEventListener('click', closeTool);
  toolOverlay?.addEventListener('click', closeTool);
  runBtn?.addEventListener('click', runCurrentTool);
}

// ── Init for Dashboard ──
export function initDashboardTools() {
  const toolOverlay = document.getElementById('toolOverlay');
  const closeBtn = document.getElementById('toolModalClose');
  const runBtn = document.getElementById('runToolBtn');

  // Bind dashboard tool cards
  document.querySelectorAll('.dashboard-tool-card[data-tool]').forEach(card => {
    card.addEventListener('click', () => {
      openTool(card.dataset.tool);
    });
  });

  closeBtn?.addEventListener('click', closeTool);
  toolOverlay?.addEventListener('click', closeTool);
  runBtn?.addEventListener('click', runCurrentTool);
}

export function openTool(id) {
  const tool = tools[id] || {
    title: 'Coming Soon',
    subtitle: 'This tool is currently in development.',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>',
    render: () => `<div style="text-align:center; padding: 2rem; color: var(--text-muted);">This feature is currently in development.</div>`,
    noRun: true
  };

  currentToolId = id;

  const titleEl = document.getElementById('toolTitle');
  const subtitleEl = document.getElementById('toolSubtitle');
  const iconEl = document.getElementById('toolIcon');
  const contentEl = document.getElementById('toolContent');
  const overlayEl = document.getElementById('toolOverlay');
  const modalEl = document.getElementById('toolModal');

  if (titleEl) titleEl.textContent = tool.title;
  if (subtitleEl) subtitleEl.textContent = tool.subtitle;
  if (iconEl) iconEl.innerHTML = tool.icon;
  if (contentEl) contentEl.innerHTML = tool.render();

  const runBtn = document.getElementById('runToolBtn');
  if (runBtn) {
    if (tool.noRun) {
      runBtn.style.display = 'none';
    } else {
      runBtn.style.display = 'flex';
      const btnText = runBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Generate with AI ✨';
    }
  }

  if (overlayEl) overlayEl.classList.add('active');
  if (modalEl) modalEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeTool() {
  document.getElementById('toolOverlay')?.classList.remove('active');
  document.getElementById('toolModal')?.classList.remove('active');
  document.body.style.overflow = '';
}

async function runCurrentTool() {
  const tool = tools[currentToolId];
  if (!tool || tool.noRun) return;

  const runBtn = document.getElementById('runToolBtn');
  const loader = runBtn?.querySelector('.btn-loader');
  const text = runBtn?.querySelector('.btn-text');

  // Update UI
  if (runBtn) runBtn.disabled = true;
  if (loader) loader.style.display = 'block';
  if (text) {
    text.textContent = 'Generating...';
    text.style.opacity = '0.5';
  }

  try {
    const params = tool.getParams();
    const data = await callAI(tool.toolKey, params);
    displayResults(data.results || [data.output || 'No results']);

    // Update credit display if on dashboard
    const creditEl = document.getElementById('creditCount');
    if (creditEl && data.creditsRemaining !== undefined) {
      creditEl.textContent = data.creditsRemaining.toLocaleString();
    }
  } catch (err) {
    console.error('Tool error:', err);
    // Fallback to alert if auth toast isn't available
    alert(err.message || 'Generation failed. Please try again.');
  } finally {
    if (runBtn) runBtn.disabled = false;
    if (loader) loader.style.display = 'none';
    if (text) {
      text.textContent = 'Generate with AI ✨';
      text.style.opacity = '1';
    }
  }
}

function displayResults(results) {
  const area = document.getElementById('toolResultsArea');
  const list = document.getElementById('toolResultsList');
  if (!area || !list) return;

  list.innerHTML = '';
  results.forEach(res => {
    const item = document.createElement('div');
    item.className = 'tool-result-item anim-fade-in';
    const formatted = res.replace(/\n/g, '<br>');
    item.innerHTML = `
      <span class="tool-result-text">${formatted}</span>
      <button class="tool-copy-btn" title="Copy to clipboard">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    `;

    item.querySelector('.tool-copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(res);
      alert('Copied to clipboard!');
    });

    list.appendChild(item);
  });

  area.style.display = 'block';
  area.scrollIntoView({ behavior: 'smooth', block: 'end' });
}
