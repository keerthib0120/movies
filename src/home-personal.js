(function () {
  const store = () => window.MovieIGuessStorage;
  const DISPLAY_NAME = 'keerthi';

  function updateGreeting() {
    const timeEl = document.getElementById('mgGreetingTime');
    const nameEl = document.getElementById('mgGreetingName');
    const s = store();
    if (!timeEl || !nameEl) return;
    const greeting = s ? s.getGreetingTime() : 'Good evening';
    timeEl.textContent = 'cinema';
    nameEl.innerHTML = `${greeting}, <em>${DISPLAY_NAME}</em>`;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function viewUrl(entry) {
    return `viewMovie?movieId=${entry.id}&type=${entry.type}`;
  }

  function buildCwCard(entry) {
    const s = store();
    const card = document.createElement('div');
    card.className = 'mg-cw-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    const poster = s.posterUrl(entry.poster_path, 'w342');
    const thumbStyle = poster
      ? `background-image:url('${poster}')`
      : 'background:linear-gradient(135deg,#0d1a30,#060c18)';
    const emoji = entry.type === 'tv' ? '📺' : '🎬';

    card.innerHTML = `
      <div class="mg-cw-thumb" style="${thumbStyle}">
        <div class="mg-thumb-overlay"></div>
        ${poster ? '' : `<span style="position:relative;font-size:20px;opacity:0.3">${emoji}</span>`}
        <div class="mg-play-btn"><div class="mg-play-tri"></div></div>
      </div>
      <div class="mg-prog-bar"><div class="mg-prog-fill" style="width:${Math.round(entry.progress)}%"></div></div>
      <div class="mg-cw-info">
        <div class="mg-cw-title">${escapeHtml(entry.title)}</div>
        <div class="mg-cw-sub">${escapeHtml(s.formatSubline(entry))}</div>
      </div>
    `;

    const go = () => { window.location.href = viewUrl(entry); };
    card.addEventListener('click', go);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
    return card;
  }

  function buildGhostCard() {
    const card = document.createElement('div');
    card.className = 'mg-cw-card mg-cw-ghost';
    card.innerHTML = `
      <div class="mg-ghost-plus">＋</div>
      <div class="mg-ghost-text">Start something new</div>
    `;
    card.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return card;
  }

  function renderContinueWatching() {
    const grid = document.getElementById('mgCwGrid');
    const allPanel = document.getElementById('mgCwAllPanel');
    const s = store();
    if (!grid || !s) return;

    const all = s.getContinueWatching();
    grid.innerHTML = '';

    const preview = all.slice(0, 2);
    preview.forEach((entry) => grid.appendChild(buildCwCard(entry)));
    grid.appendChild(buildGhostCard());

    if (allPanel) {
      allPanel.innerHTML = '';
      all.slice(2).forEach((entry) => allPanel.appendChild(buildCwCard(entry)));
      allPanel.classList.toggle('open', allPanel.classList.contains('open') && all.length > 2);
    }
  }

  function renderMyList() {
    const container = document.getElementById('mgMyListContent');
    const s = store();
    if (!container || !s) return;

    const list = s.getMyList();
    container.innerHTML = '';

    if (!list.length) {
      container.innerHTML = `
        <div class="mg-list-empty">
          <div class="mg-empty-icon">📂</div>
          <div class="mg-empty-text">Your list is empty.<br>Save titles here to watch later.</div>
          <button type="button" class="mg-empty-tag" id="mgBrowseBtn">Browse titles →</button>
        </div>
      `;
      document.getElementById('mgBrowseBtn')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'mg-list-grid';
    list.forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'mg-list-card';
      const poster = s.posterUrl(entry.poster_path, 'w342');
      const thumbStyle = poster
        ? `background-image:url('${poster}')`
        : 'background:linear-gradient(135deg,#0d1a30,#060c18)';
      card.innerHTML = `
        <div class="mg-cw-thumb" style="${thumbStyle}"><div class="mg-thumb-overlay"></div></div>
        <div class="mg-cw-info">
          <div class="mg-cw-title">${escapeHtml(entry.title)}</div>
          <div class="mg-cw-sub">${entry.type === 'tv' ? 'TV Show' : 'Movie'}</div>
        </div>
        <button type="button" class="mg-list-remove" aria-label="Remove from list">Remove</button>
      `;
      card.querySelector('.mg-cw-thumb')?.addEventListener('click', () => {
        window.location.href = viewUrl(entry);
      });
      card.querySelector('.mg-cw-info')?.addEventListener('click', () => {
        window.location.href = viewUrl(entry);
      });
      card.querySelector('.mg-list-remove')?.addEventListener('click', (e) => {
        e.stopPropagation();
        s.removeFromMyList(entry.id, entry.type);
        renderMyList();
      });
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  function setupSeeAll() {
    const btn = document.getElementById('mgCwSeeAll');
    const panel = document.getElementById('mgCwAllPanel');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      btn.textContent = open ? 'Show less ↑' : 'See all →';
    });
  }

  function setupFootNav() {
    const items = document.querySelectorAll('.mg-fn-item');
    items.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        items.forEach((b) => {
          b.querySelector('.mg-fn-icon')?.classList.toggle('on', b === btn);
          b.querySelector('.mg-fn-label')?.classList.toggle('on', b === btn);
        });

        if (tab === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (tab === 'browse') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (tab === 'list') {
          document.getElementById('mg-my-list')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function refresh() {
    updateGreeting();
    renderContinueWatching();
    renderMyList();
  }

  function init() {
    refresh();
    setupSeeAll();
    setupFootNav();
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('movieiguess_')) refresh();
    });
    window.refreshMovieIGuessHome = refresh;
  }

  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
