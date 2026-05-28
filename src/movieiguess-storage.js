(function () {
  const CW_KEY = 'movieiguess_continue_watching';
  const LIST_KEY = 'movieiguess_my_list';
  const NAME_KEY = 'movieiguess_display_name';
  const MAX_CW = 12;

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function buildEntryFromTmdb(data, mediaType) {
    const title = data.title || data.name || 'Unknown';
    const runtime = data.runtime || (data.episode_run_time && data.episode_run_time[0]) || null;
    return {
      id: data.id,
      type: mediaType === 'tv' ? 'tv' : 'movie',
      title,
      poster_path: data.poster_path || null,
      progress: 5,
      runtimeMinutes: runtime || null,
      season: null,
      episode: null,
      updatedAt: Date.now(),
    };
  }

  function formatTimeLeft(progress, runtimeMinutes) {
    if (!runtimeMinutes || progress >= 100) return '';
    const remaining = Math.round((runtimeMinutes * (100 - progress)) / 100);
    if (remaining < 60) return `${remaining}m left`;
    const h = Math.floor(remaining / 60);
    const m = remaining % 60;
    return `${h}h ${m}m left`;
  }

  function formatSubline(entry) {
    const parts = [];
    if (entry.season != null && entry.episode != null) {
      parts.push(`S${entry.season} E${entry.episode}`);
    }
    parts.push(`${Math.round(entry.progress)}%`);
    const timeLeft = formatTimeLeft(entry.progress, entry.runtimeMinutes);
    if (timeLeft) parts.push(timeLeft);
    return parts.join(' · ');
  }

  function posterUrl(posterPath, size) {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size || 'w342'}${posterPath}`;
  }

  function upsertContinueWatching(entry, options) {
    const opts = options || {};
    let list = readJson(CW_KEY, []);
    const idx = list.findIndex((x) => x.id === entry.id && x.type === entry.type);
    const existing = idx >= 0 ? list[idx] : null;
    let progress = entry.progress ?? existing?.progress ?? 5;

    if (opts.bumpProgress) {
      progress = Math.min(95, (existing?.progress ?? 0) + 8);
    }

    const merged = {
      ...(existing || {}),
      ...entry,
      progress,
      updatedAt: Date.now(),
    };

    if (idx >= 0) {
      list[idx] = merged;
    } else {
      list.unshift(merged);
    }

    list.sort((a, b) => b.updatedAt - a.updatedAt);
    list = list.slice(0, MAX_CW);
    writeJson(CW_KEY, list);
    return merged;
  }

  function getContinueWatching() {
    return readJson(CW_KEY, []);
  }

  function isInMyList(id, type) {
    return readJson(LIST_KEY, []).some((x) => x.id === id && x.type === type);
  }

  function toggleMyList(entry) {
    let list = readJson(LIST_KEY, []);
    const idx = list.findIndex((x) => x.id === entry.id && x.type === entry.type);
    if (idx >= 0) {
      list.splice(idx, 1);
      writeJson(LIST_KEY, list);
      return false;
    }
    list.unshift({ ...entry, savedAt: Date.now() });
    list = list.slice(0, 50);
    writeJson(LIST_KEY, list);
    return true;
  }

  function getMyList() {
    return readJson(LIST_KEY, []);
  }

  function removeFromMyList(id, type) {
    let list = readJson(LIST_KEY, []);
    list = list.filter((x) => !(x.id === id && x.type === type));
    writeJson(LIST_KEY, list);
  }

  function getDisplayName() {
    return localStorage.getItem(NAME_KEY) || 'keerthi';
  }

  function setDisplayName(name) {
    const trimmed = (name || '').trim();
    if (trimmed) localStorage.setItem(NAME_KEY, trimmed);
  }

  function getGreetingTime() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  }

  window.MovieIGuessStorage = {
    CW_KEY,
    LIST_KEY,
    NAME_KEY,
    buildEntryFromTmdb,
    formatSubline,
    posterUrl,
    upsertContinueWatching,
    getContinueWatching,
    isInMyList,
    toggleMyList,
    getMyList,
    removeFromMyList,
    getDisplayName,
    setDisplayName,
    getGreetingTime,
  };
})();
