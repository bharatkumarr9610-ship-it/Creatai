// script.js
// Single-file JS for "AI Answer (Short) + Key insights, News, Facts, Trending, Snippets"
// Works with the HTML/CSS you provided. Drop into your project and test.

(() => {
  // Helpers
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from((el || document).querySelectorAll(sel));

  /* Basic UI references */
  const menuItems = qsa('.menu-item');
  const views = qsa('.view');
  const searchSection = qs('.search');
  const searchInput = qs('.search-input');
  const suggestions = qs('.suggestions');
  const convChip = qs('#conversationsChip');

  /* Small utility for safe text -> HTML */
  const escapeHtml = (s = '') =>
    String(s).replace(/[&<>"'`=\/]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' }[c]));

  /* --- View switching (sidebar) --- */
  function showView(id) {
    views.forEach(v => v.classList.remove('active'));
    const target = qs(`#${id}`);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }
    // Search only visible on Discover
    if (id === 'discover') searchSection?.classList.remove('hidden');
    else searchSection?.classList.add('hidden');

    menuItems.forEach(b => b.classList.remove('is-active'));
    const btn = qsa('.menu-item').find(b => b.getAttribute('data-view') === id);
    btn?.classList.add('is-active');
  }

  // default
  showView('trending');

  // sidebar interactions
  menuItems.forEach(btn => {
    btn.addEventListener('click', () => showView(btn.getAttribute('data-view')));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });

  /* --- Conversations reveal (used by search interactions) --- */
  const convView = qs('#conversations');
  const convList = qs('.conv-list');
  const convInput = qs('.conv-input');
  const sendMsgBtn = qs('#sendMsgBtn');

  function revealConversations(initialMsg) {
    convChip?.classList.remove('hidden');
    convView?.classList.remove('hidden');
    showView('conversations');

    if (convList && initialMsg) {
      const msg = document.createElement('div');
      msg.className = 'conv-msg';
      msg.textContent = initialMsg;
      convList.appendChild(msg);
    }
  }

  if (sendMsgBtn && convList && convInput) {
    sendMsgBtn.addEventListener('click', () => {
      const v = convInput.value.trim();
      if (!v) return;
      const me = document.createElement('div');
      me.className = 'conv-msg me';
      me.textContent = v;
      convList.appendChild(me);
      convInput.value = '';
      convList.scrollTop = convList.scrollHeight;
    });
  }
  convChip?.addEventListener('click', () => showView('conversations'));

  /* --- AI response rendering area (in #discover) --- */
  const discoverSection = qs('#discover');

  function ensureAIResultsContainer() {
    let container = qs('.ai-results', discoverSection);
    if (!container) {
      container = document.createElement('div');
      container.className = 'ai-results';
      // place it after the H2 heading in Discover
      const h2 = qs('#discover > h2');
      if (h2 && h2.parentNode) h2.insertAdjacentElement('afterend', container);
      else discoverSection.insertBefore(container, discoverSection.firstChild);
    }
    return container;
  }

  function renderAIResultsContainer({ query, answerShort, keyInsights, news, facts, trending, snippets, sources }) {
    const container = ensureAIResultsContainer();

    // Build HTML
    const html = `
      <div class="card glass">
        <h3>AI Answer</h3>
        <p style="font-weight:700; margin-bottom:8px;">${escapeHtml(answerShort)}</p>
        <div style="font-size:12px; color:var(--text-dim); margin-bottom:8px;">
          Sources: ${sources.map(s => `<span style="font-weight:600;color:var(--blue-heavy);margin-right:8px">${escapeHtml(s)}</span>`).join('')}
        </div>
        <div style="display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
          <section>
            <h4 style="margin:0 0 6px;">Key insights</h4>
            <ul>${keyInsights.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
          </section>
          <section>
            <h4 style="margin:0 0 6px;">News</h4>
            <ul>${news.map(n => `<li><strong>${escapeHtml(n.title)}</strong> — <span style="color:var(--text-dim)">${escapeHtml(n.time)}</span></li>`).join('')}</ul>
          </section>
          <section>
            <h4 style="margin:0 0 6px;">Facts</h4>
            <ul>${facts.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
          </section>
          <section>
            <h4 style="margin:0 0 6px;">Trending</h4>
            <ul>${trending.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
          </section>
          <section style="grid-column: 1 / -1;">
            <h4 style="margin:0 0 6px;">Snippets</h4>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${snippets.map(s => `<button class="btn-secondary snippet-btn" data-snippet="${escapeHtml(s)}">${escapeHtml(s.length > 40 ? s.slice(0,40)+'…' : s)}</button>`).join('')}
            </div>
          </section>
        </div>
      </div>
    `.trim();

    container.innerHTML = html;

    // hook snippet buttons to put into conversations (or into search)
    qsa('.snippet-btn', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-snippet') || '';
        // reveal in conversations and seed a message
        revealConversations('Snippet selected: ' + text);
      });
    });

    // smooth scroll to container (if discover visible)
    if (qs('#discover')?.classList.contains('active')) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* --- Mock AI generation (replace with real API call later) --- */
  function generateAIResponse(query) {
    // Very small deterministic mock generator to keep UI predictable.
    // Replace this function with a real fetch to your AI backend.
    const q = (query || '').trim() || 'latest trends';
    const now = new Date();
    const times = ['5m ago', '12m ago', '36m ago', '1h ago', '3h ago', 'Today'];
    const pick = (arr, i) => arr[i % arr.length];

    const answerShort = `Short answer for "${q}": focused summary and suggested next steps.`;

    const keyInsights = [
      `User intent detected as: ${q.length > 40 ? q.slice(0,40) + '…' : q}`,
      'Top 3 focal points: relevance, freshness, monetization placement',
      'Suggested next action: surface related news + snippets'
    ];

    const news = [
      { title: `Market moves related to "${q}"`, time: pick(times, now.getMinutes()) },
      { title: `Policy brief impacting ${q}`, time: pick(times, now.getMinutes()+1) },
      { title: `Product launch mention: ${q}`, time: pick(times, now.getMinutes()+2) }
    ];

    const facts = [
      `Fact: ${q} has been trending in conversations recently.`,
      'Fact: Short-form snippets increase engagement by approx 15% (mock).',
      'Fact: Relevant news increases click-through on AI cards.'
    ];

    const trending = [
      `${q} — sentiment spike`,
      'Creator short videos — rising',
      'Campus adoption — notable'
    ];

    const snippets = [
      `${q} overview: quick summary`,
      `How ${q} affects creators`,
      `${q} — top 5 highlights`
    ];

    const sources = ['internal-crawl', 'news-agg', 'wiki-lite'];

    return { answerShort, keyInsights, news, facts, trending, snippets, sources };
  }

  /* --- Unified search handler --- */
  function handleQuery(q) {
    if (!q || !q.trim()) return;
    // small loading state (replace with spinner if you want)
    const container = ensureAIResultsContainer();
    container.innerHTML = `<div class="card glass"><h3>Searching…</h3><p style="color:var(--text-dim)">Generating concise AI answer + curated cards for "${escapeHtml(q)}"</p></div>`;

    // simulate async latency, then render
    setTimeout(() => {
      const ai = generateAIResponse(q);
      renderAIResultsContainer({ query: q, ...ai });

      // also reveal conversations seed so user sees chat capability
      revealConversations('Search: ' + q);
    }, 220); // tiny delay for perceived responsiveness
  }

  /* Hook search events (Enter) */
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (q) {
          // ensure discover visible and render
          showView('discover');
          handleQuery(q);
        }
      }
    });
  }

  /* Hook suggestion clicks if suggestions exist (they will call reveal and show ai results) */
  if (suggestions) {
    suggestions.addEventListener('click', (e) => {
      const item = e.target.closest('.suggestion-item');
      if (!item) return;
      const text = item.textContent || item.innerText || '';
      searchInput.value = text;
      suggestions.classList.remove('visible');
      showView('discover');
      handleQuery(text);
    });
  }

  /* Top-right settings button should show settings (compat) */
  qs('.top-settings-btn')?.addEventListener('click', () => {
    showView('settings');
  });

  /* Library / imagine interactions are still kept minimal - they exist in your main script */
  // (No changes needed here — we only add AI UX)

  // expose small API for testing from console
  window._AI_DISCOVERY_UI = {
    handleQuery,
    generateAIResponse,
    renderAIResultsContainer
  };

})(); 
