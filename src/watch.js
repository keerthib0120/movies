/* ============================================================
   WATCH PAGE JS HELPERS
   Add these functions to src/watch.js (before WatchMovie and WatchTV)
   Then update WatchMovie and WatchTV to use them (see below)
   ============================================================ */

// Helper: render gold star rating from a 0-10 score
function renderStars(score10, count = 5) {
    const filled = Math.round((score10 / 10) * count);
    return Array.from({ length: count }, (_, i) =>
        `<span class="star${i < filled ? '' : ' empty'}">★</span>`
    ).join('');
}

// Helper: render the player frame
function playerBarHTML(titleLine1 = '', titleLine2 = '', posterUrl = '') {
    return `
    <div class="cinematic-player-wrap">
        <div class="video-container" id="video-container" style="display:block;">
            <iframe id="video-player" allowfullscreen></iframe>
        </div>
    </div>`;
}

// Helper: "About this film" card
function aboutFilmHTML(movie, genres) {
    const score = movie.vote_average || 0;
    const stars = renderStars(score);
    const scoreDisplay = (score / 2).toFixed(1);
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    const runtime = movie.runtime
        ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
        : '';
    const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : '';
    const genreList = genres
        ? genres.split(', ').map(g => `<span class="film-genre-pill">${g}</span>`).join('')
        : '';
    const progress = 35; // placeholder - wire to real progress later

    return `
    <div class="about-film-section">
        <div class="section-divider-header">
            <span class="section-divider-star">✦</span>
            <span class="section-divider-title">About this film</span>
            <span class="section-divider-star">✦</span>
        </div>

        <div class="film-info-card">
            <div class="film-poster-col">
                ${poster
                    ? `<img src="${poster}" alt="${movie.title || movie.name}">`
                    : `<div class="poster-placeholder"></div>`}
            </div>
            <div class="film-body-col">
                <div class="film-title-caveat">${movie.title || movie.name || ''}</div>

                <div class="film-meta-row">
                    <div class="film-star-rating">${stars}</div>
                    <span class="film-rating-score">${scoreDisplay} / 5</span>
                    ${year ? `<span class="film-meta-sep">·</span><span class="film-meta-text">${year}</span>` : ''}
                    ${runtime ? `<span class="film-meta-sep">·</span><span class="film-meta-text">${runtime}</span>` : ''}
                </div>

                ${genreList ? `<div class="film-genres">${genreList}</div>` : ''}

                <p class="film-synopsis">${movie.overview || 'No overview available.'}</p>

                <div class="film-progress-section">
                    <div class="film-progress-label-row">
                        <span class="film-progress-label">Your Progress</span>
                        <span class="film-progress-pct">${progress}%</span>
                    </div>
                    <div class="film-progress-track">
                        <div class="film-progress-fill" style="width:${progress}%"></div>
                    </div>
                </div>
            </div>
        </div>

    </div>`;
}

function tvEpisodeAboutHTML(series, genres) {
    const score = series.vote_average || 0;
    const stars = renderStars(score);
    const scoreDisplay = score ? (score / 2).toFixed(1) : 'N/A';
    const poster = series.poster_path
        ? `https://image.tmdb.org/t/p/w300${series.poster_path}`
        : '';
    const genreList = genres
        ? genres.split(', ').map(g => `<span class="film-genre-pill">${g}</span>`).join('')
        : '';

    return `
    <div class="about-film-section tv-episode-about">
        <div class="section-divider-header">
            <span class="section-divider-star">✦</span>
            <span class="section-divider-title">About this episode</span>
            <span class="section-divider-star">✦</span>
        </div>

        <div class="film-info-card">
            <div class="film-poster-col">
                ${poster
                    ? `<img src="${poster}" alt="${series.name || 'Series poster'}">`
                    : `<div class="poster-placeholder"></div>`}
            </div>
            <div class="film-body-col">
                <div class="film-title-caveat" id="tvAboutTitle">${series.name || ''}</div>

                <div class="film-meta-row">
                    <div class="film-star-rating">${stars}</div>
                    <span class="film-rating-score">${scoreDisplay}${score ? ' / 5' : ''}</span>
                    <span class="film-meta-sep">·</span>
                    <span class="film-meta-text" id="tvAboutEpisodeMeta">Select an episode</span>
                </div>

                ${genreList ? `<div class="film-genres">${genreList}</div>` : ''}

                <p class="film-synopsis" id="tvAboutDescription">
                    Choose an episode to see its description here.
                </p>
            </div>
        </div>
    </div>`;
}

async function updateTvEpisodeAbout(seriesId, seasonNumber, episodeNumber) {
    const titleEl = document.getElementById('tvAboutTitle');
    const metaEl = document.getElementById('tvAboutEpisodeMeta');
    const descEl = document.getElementById('tvAboutDescription');
    if (!titleEl && !metaEl && !descEl) return;

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${API_KEY}`
        );
        if (!response.ok) throw new Error('Episode fetch failed');
        const episode = await response.json();

        if (titleEl) titleEl.textContent = episode.name || `Episode ${episodeNumber}`;
        if (metaEl) metaEl.textContent = `Season ${seasonNumber} · Episode ${episodeNumber}`;
        if (descEl) descEl.textContent = episode.overview || 'No description available.';
    } catch (error) {
        console.warn('Episode details fetch failed', error);
        if (metaEl) metaEl.textContent = `Season ${seasonNumber} · Episode ${episodeNumber}`;
        if (descEl) descEl.textContent = 'No description available.';
    }
}

// Helper: fetch cast and inject avatars
async function fetchCastAvatars(movieId, mediaType = 'movie') {
    const container = document.getElementById('castAvatars');
    if (!container) return;
    try {
        const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
        const res = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${movieId}/credits?api_key=${API_KEY}`
        );
        const data = await res.json();
        const cast = (data.cast || []).slice(0, 8);
        container.innerHTML = cast.map(actor => {
            const initials = actor.name.split(' ').map(n => n[0]).join('').slice(0, 2);
            const img = actor.profile_path
                ? `<img src="https://image.tmdb.org/t/p/w92${actor.profile_path}" alt="${actor.name}" style="width:100%;height:100%;object-fit:cover;">`
                : initials;
            return `
            <div class="cast-avatar-wrap">
                <div class="cast-avatar">${img}</div>
                <div class="cast-name">${actor.name.split(' ')[0]}</div>
            </div>`;
        }).join('');
    } catch (e) {
        console.warn('Cast fetch failed', e);
    }
}

// Helper: TV details grid
function tvDetailsGridHTML(series, genres) {
    const rating = series.vote_average ? series.vote_average.toFixed(1) : 'N/A';
    const firstAir = series.first_air_date || 'N/A';
    const status = series.status || 'N/A';
    const homepage = series.homepage
        ? `<a href="${series.homepage}" target="_blank" rel="noopener" style="color:#6a7a94;text-decoration:underline;word-break:break-all;">${series.homepage}</a>`
        : 'No official website';

    return `
    <div class="tv-details-grid-card">
        <div>
            <div class="tv-detail-item" style="margin-bottom:1.2rem;">
                <div class="tv-detail-label">Genres</div>
                <div class="tv-detail-value">${genres || 'N/A'}</div>
            </div>
            <div class="tv-detail-item" style="margin-bottom:1.2rem;">
                <div class="tv-detail-label">First Air Date</div>
                <div class="tv-detail-value">${firstAir}</div>
            </div>
            <div class="tv-detail-item">
                <div class="tv-detail-label">Status</div>
                <div class="tv-detail-value">${status}</div>
            </div>
        </div>
        <div>
            <div class="tv-detail-item" style="margin-bottom:1.2rem;">
                <div class="tv-detail-label">Rating</div>
                <div class="tv-detail-value">${rating} / 10 (${(series.vote_count || 0).toLocaleString()} votes)</div>
            </div>
            <div class="tv-detail-item" style="margin-bottom:1.2rem;">
                <div class="tv-detail-label">Seasons</div>
                <div class="tv-detail-value">${series.number_of_seasons} Season${series.number_of_seasons !== 1 ? 's' : ''}</div>
            </div>
            <div class="tv-detail-item" style="margin-bottom:1.2rem;">
                <div class="tv-detail-label">Episodes</div>
                <div class="tv-detail-value">${series.number_of_episodes} Total Episodes</div>
            </div>
            <div class="tv-detail-item">
                <div class="tv-detail-label">Homepage</div>
                <div class="tv-detail-value">${homepage}</div>
            </div>
        </div>
    </div>`;
}

// Helper: episode journal card HTML
function episodeJournalCardHTML(episode, seriesId, seasonNumber, isFirst) {
    const num = String(episode.episode_number).padStart(2, '0');
    const title = episode.name || `Episode ${episode.episode_number}`;
    const desc = episode.overview || 'No description available.';
    const runtime = episode.runtime ? `${episode.runtime} min` : '';
    const airDate = episode.air_date
        ? new Date(episode.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '';

    const isNowPlaying = isFirst; // first episode auto-plays
    const nowPlayingBadge = isNowPlaying
        ? `<span class="ep-now-playing-badge">NOW PLAYING</span>`
        : '';

    const metaParts = [];
    if (runtime) metaParts.push(`<span class="ep-meta-text">${runtime}</span>`);
    if (airDate) {
        if (metaParts.length) metaParts.push(`<span class="ep-meta-dot">·</span>`);
        metaParts.push(`<span class="ep-meta-text">${airDate}</span>`);
    }

    return `
    <div class="ep-journal-card${isNowPlaying ? ' now-playing' : ''}"
         onclick="watchEpisode(${seriesId}, ${seasonNumber}, ${episode.episode_number})"
         data-episode="${episode.episode_number}">
        <div class="ep-journal-head">
            <span class="ep-num-badge">EP ${num}</span>
            <div class="ep-journal-name">${title}</div>
            <div class="ep-journal-meta ep-status-slot">
                ${nowPlayingBadge}
            </div>
        </div>
        <div class="ep-journal-info">
            <div class="ep-journal-desc">${desc}</div>
            <div class="ep-journal-meta" style="margin-top:5px;">
                ${metaParts.join('')}
            </div>
        </div>
    </div>`;
}

// Helper: full episode panel HTML (journal style)
function episodePanelHTML(season, seriesId, seasonNumber) {
    const cards = season.episodes.map((ep, i) => {
        const card = episodeJournalCardHTML(ep, seriesId, seasonNumber, i === 0);
        const divider = i < season.episodes.length - 1
            ? `<div class="ep-journal-divider">✦</div>`
            : '';
        return card + divider;
    }).join('');

    return `
    <div class="episode-journal-panel episode-strip-panel">
        ${cards}
    </div>`;
}

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movieId');
const seriesId = urlParams.get('seriesId');
const type = urlParams.get('type');

console.log("Movie ID:", movieId);
console.log("Series ID:", seriesId);
console.log("Type:", type);

const API_KEY = '97df57ffd9278a37bc12191e00332053';
let currentServerUrl = 'https://player.videasy.net/embed/';

const servers = [
    { name: 'Netflix', url: 'https://player.videasy.net/embed/' },
    { name: 'Vidsrc-1', url: 'https://www.vidsrc.wtf/api/1/' },
    { name: 'Vidsrc-2', url: 'https://vidsrc.wtf/api/2/' },
    { name: 'Premium', url: 'https://111movies.com/' },
    { name: 'Multi-embed', url: 'https://www.vidsrc.wtf/api/3/' },
    { name: 'Smashy', url: 'https://smashyplayer.top/' },
    { name: 'VidLinkPro', url: 'https://vidlink.pro/' },
    { name: 'Prime', url: 'https://test.autoembed.cc/embed/' },
    { name: 'Purple', url: 'https://multiembed.mov/' },
    { name: 'Prime 2', url: 'https://www.primewire.tf/embed/' },
    { name: 'VidRock', url: 'https://vidrock.net/' },
    { name: 'Mega', url: 'https://vidrock.net/mega/' },
    { name: 'VidNest', url: 'https://vidnest.fun/' },
    { name: 'Vidzee', url: 'https://player.vidzee.wtf/embed/' }
];

if (type === "movie" && movieId) {
    console.log("Loading movie with ID:", movieId);
    WatchMovie(movieId);
} else if (type === "tv" && seriesId) {
    console.log("Loading TV series with ID:", seriesId);
    WatchTV(seriesId);
} else if (type === "tv" && movieId && !seriesId) {
    console.warn("TV show detected but using movieId parameter. Attempting to load as TV series.");
    WatchTV(movieId);
} else {
    console.error("Invalid parameters - Type:", type, "MovieID:", movieId, "SeriesID:", seriesId);
    showError();
}

// Helper functions for loading states
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.querySelector('.container').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    document.querySelector('.container').classList.remove('hidden');
}

function showError() {
    document.getElementById('loading').classList.add('hidden');
    document.querySelector('.container').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
}

async function WatchMovie(movieId) {
    console.log("Fetching Movie:", movieId);
    
    // Show loading and hide container initially
    showLoading();

    let embedUrl;

    if (currentServerUrl === 'https://player.videasy.net/embed/') {
        embedUrl = `https://player.videasy.net/movie/${movieId}`;
    } else if (currentServerUrl === 'https://111movies.com/') {
        embedUrl = `https://111movies.com/movie/${movieId}`;
    } else if (currentServerUrl === 'https://www.vidsrc.wtf/api/3/') {
        embedUrl = `https://www.vidsrc.wtf/api/3/movie/?id=${movieId}`;
    } else if (currentServerUrl === 'https://www.vidsrc.wtf/api/1/') {
        embedUrl = `https://www.vidsrc.wtf/api/1/movie?id=${movieId}`;
    } else if (currentServerUrl === 'https://vidsrc.wtf/api/2/') {
        embedUrl = `https://vidsrc.wtf/api/2/movie?id=${movieId}`;
    } else if (currentServerUrl === 'https://smashyplayer.top/') {
        embedUrl = `https://smashyplayer.top/#mv${movieId}`;
    } else if (currentServerUrl === 'https://vidlink.pro/') {
        embedUrl = `https://vidlink.pro/movie/${movieId}?autoplay=true&title=true`;
    } else if (currentServerUrl === 'https://test.autoembed.cc/embed/') {
        embedUrl = `https://test.autoembed.cc/embed/movie/${movieId}?autoplay=true&server=5`;
    } else if (currentServerUrl === 'https://multiembed.mov/') {
        embedUrl = `https://multiembed.mov/?video_id=${movieId}&tmdb=1`;
    } else if (currentServerUrl === 'https://www.primewire.tf/embed/') {
        embedUrl = `https://www.primewire.tf/embed/movie?tmdb=${movieId}`;
    } else if (currentServerUrl === 'https://vidrock.net/') {
        embedUrl = `https://vidrock.net/movie/${movieId}`;
    } else if (currentServerUrl === 'https://vidrock.net/mega/') {
        embedUrl = `https://vidrock.net/mega/movie/${movieId}`;
    } else if (currentServerUrl === 'https://vidnest.fun/') {
        embedUrl = `https://vidnest.fun/movie/${movieId}`;
    } else if (currentServerUrl === 'https://player.vidzee.wtf/embed/') {
        embedUrl = `https://player.vidzee.wtf/embed/movie/${movieId}`;
    } else {
        embedUrl = `${currentServerUrl}movie/${movieId}`;
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error(`Failed to fetch movie data (Status: ${response.status})`);

        const movie = await response.json();
        const genres = movie.genres?.map(genre => genre.name).join(', ') || 'N/A';
        const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
            : '';

        hideLoading();
        document.querySelector('.container').innerHTML = `
            <div class="video-sidebar-layout movie-content-wrapper">
                <div class="video-section">

                    ${playerBarHTML('', movie.title || '', posterUrl)}

                    <div class="server-selection" style="margin-top:1rem;">
                        <div class="server-grid">
                            ${servers.map((server, index) => `
                                <button class="server-btn ${server.url === currentServerUrl ? 'active' : ''}"
                                        onclick="changeServer('${server.url}', 'movie/${movieId}', ${index}, 'movie')">
                                    ${server.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    ${aboutFilmHTML(movie, genres)}

                </div>
            </div>
        `;

        // Set iframe src
        document.getElementById('video-player').src = embedUrl;

    } catch (error) {
        console.error("Error fetching movie:", error);
        hideLoading();
        showError();
    }
}

async function WatchTV(seriesId) {
    console.log("Fetching TV Series:", seriesId);
    
    // Show loading and hide container initially
    showLoading();

    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error(`Failed to fetch TV show data`);

        const series = await response.json();
        const genres = series.genres?.map(genre => genre.name).join(', ') || 'N/A';

        hideLoading();
        document.querySelector('.container').innerHTML = `
            <div class="video-sidebar-layout tv-centered-layout">
                <div class="video-section">

                    ${playerBarHTML('', series.name || '', '')}

                    <div class="server-selection" style="margin-top:1rem;">
                        <div class="server-grid">
                            ${servers.map((server, index) => `
                                <button class="server-btn ${server.url === currentServerUrl ? 'active' : ''}"
                                        onclick="changeServer('${server.url}', 'tv/${seriesId}', ${index}, 'tv')">
                                    ${server.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    ${tvEpisodeAboutHTML(series, genres)}

                    <div class="tv-episode-top">
                        <div class="tv-episode-controls">
                            <div class="episode-journal-heading">
                                <span class="gold-star">✦</span>
                                <span>Episodes</span>
                            </div>
                            <div class="season-select-wrap">
                                <select id="season-selector" class="season-select-journal"
                                        onchange="loadSeasonSidebar(${seriesId}, this.value, true)">
                                    ${series.seasons.filter(s => s.season_number !== 0).map(s =>
                                        `<option value="${s.season_number}">Season ${s.season_number} (${s.episode_count} eps)</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        <div id="episodes-top" class="episodes-top"></div>
                    </div>

                    ${tvDetailsGridHTML(series, genres)}

                </div>
            </div>
        `;

        // Auto-play S1E1
        setTimeout(() => {
            const sel = document.getElementById('season-selector');
            if (sel) sel.value = '1';
            loadSeasonSidebar(seriesId, 1);
            watchEpisode(seriesId, 1, 1);
        }, 100);
    } catch (error) {
        console.error("Error fetching TV series:", error);
        hideLoading();
        showError();
    }
}

async function loadSeasonSidebar(seriesId, seasonNumber, autoPlayFirst = false) {
    if (!seasonNumber) return;
    const sidebarEl = document.getElementById('episodes-sidebar');
    const topEl = document.getElementById('episodes-top');
    if (sidebarEl) sidebarEl.innerHTML = '<p style="color:#4a5a74;font-size:13px;padding:1rem 0;">Loading…</p>';
    if (topEl) topEl.innerHTML = '<p style="color:#4a5a74;font-size:13px;padding:1rem 0;text-align:center;">Loading…</p>';

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`
        );
        if (!response.ok) throw new Error('Season fetch failed');
        const season = await response.json();

        const html = episodePanelHTML(season, seriesId, seasonNumber);

        if (sidebarEl) sidebarEl.innerHTML = html;
        if (topEl) topEl.innerHTML = html;

        if (autoPlayFirst) {
            const firstEpisodeNumber = season.episodes[0]?.episode_number || 1;
            watchEpisode(seriesId, seasonNumber, firstEpisodeNumber);
        } else {
            // highlight first episode
            setTimeout(() => {
                const first = document.querySelector('.ep-journal-card[data-episode="1"]');
                if (first) first.classList.add('now-playing');
            }, 50);
        }

    } catch (err) {
        console.error('loadSeasonSidebar error:', err);
        if (sidebarEl) sidebarEl.innerHTML = `<p style="color:#4a5a74;font-size:13px;padding:1rem;">Failed to load episodes.</p>`;
        if (topEl) topEl.innerHTML = `<p style="color:#4a5a74;font-size:13px;padding:1rem;text-align:center;">Failed to load episodes.</p>`;
    }
}

async function loadSeasonMobile(seriesId, seasonNumber) {
    return loadSeasonSidebar(seriesId, seasonNumber, true);
}

async function changeServer(serverUrl, contentPath, serverIndex, contentType) {
    currentServerUrl = serverUrl;

    const serverButtons = document.querySelectorAll('.server-selection button');
    serverButtons.forEach(button => button.classList.remove('active'));
    serverButtons[serverIndex].classList.add('active');

    if (contentType === 'movie' && movieId) {
        WatchMovie(movieId);
    } else if (contentType === 'tv' && seriesId) {
        // Prefer authoritative state stored on window. Fallback to DOM or iframe parsing if not present.
        let seasonNumber = 1;
        let episodeNumber = 1;

        if (window.currentPlayingEpisode && window.currentPlayingEpisode.seriesId == seriesId) {
            seasonNumber = window.currentPlayingEpisode.seasonNumber;
            episodeNumber = window.currentPlayingEpisode.episodeNumber;
        } else {
            // Try sidebar now-playing marker
            const nowPlaying = document.querySelector('.ep-journal-card.now-playing');
            if (nowPlaying) {
                episodeNumber = parseInt(nowPlaying.dataset.episode) || 1;
                const seasonSelector = document.getElementById('season-selector');
                seasonNumber = parseInt(seasonSelector?.value) || 1;
            } else {
                // Last resort: parse current iframe src for season & episode
                const player = document.getElementById('video-player');
                if (player && player.src) {
                    const src = player.src;
                    const match1 = src.match(/\/tv\/(?:\d+)\/(\d+)\/(\d+)/);
                    const match2 = src.match(/[?&]s=(\d+).*?[?&]e=(\d+)/);
                    const match3 = src.match(/season=(\d+).*?episode=(\d+)/);
                    if (match1) { seasonNumber = parseInt(match1[1]); episodeNumber = parseInt(match1[2]); }
                    else if (match2) { seasonNumber = parseInt(match2[1]); episodeNumber = parseInt(match2[2]); }
                    else if (match3) { seasonNumber = parseInt(match3[1]); episodeNumber = parseInt(match3[2]); }
                }
            }
        }

        watchEpisode(seriesId, seasonNumber, episodeNumber); // Reload the episode with the new server (preserve selection)
    }
}

async function watchEpisode(seriesId, seasonNumber, episodeNumber) {
    console.log(`Watching TV Series ${seriesId}, Season ${seasonNumber}, Episode ${episodeNumber}`);

    // Show video container and server selection
    const videoContainer = document.getElementById('video-container');
    const serverSelection = document.getElementById('server-selection');
    
    if (videoContainer) videoContainer.style.display = 'block';
    if (serverSelection) serverSelection.style.display = 'block';

    let embedUrl;

    if (currentServerUrl === 'https://player.videasy.net/embed/') {
        embedUrl = `https://player.videasy.net/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    } else if (currentServerUrl === `https://111movies.com/`) {
        embedUrl = `https://111movies.com/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    } else if (currentServerUrl === 'https://www.vidsrc.wtf/api/3/') {
        embedUrl = `https://www.vidsrc.wtf/api/3/tv/?id=${seriesId}&s=${seasonNumber}&e=${episodeNumber}`;
    } else if (currentServerUrl === 'https://www.vidsrc.wtf/api/1/') {
        embedUrl = `https://www.vidsrc.wtf/api/1/tv?id=${seriesId}&s=${seasonNumber}&e=${episodeNumber}`;
    } else if (currentServerUrl === 'https://vidsrc.wtf/api/2/') {
        embedUrl = `https://vidsrc.wtf/api/2/tv?id=${seriesId}&s=${seasonNumber}&e=${episodeNumber}`;
    } else if (currentServerUrl === 'https://smashyplayer.top/') {
        embedUrl = `https://smashyplayer.top/#tv${seriesId}s${seasonNumber}e${episodeNumber}`;
    } else if (currentServerUrl === 'https://vidlink.pro/') {
        embedUrl = `https://vidlink.pro/tv/${seriesId}/${seasonNumber}/${episodeNumber}?autoplay=true&title=true`;
    } else if (currentServerUrl === 'https://test.autoembed.cc/embed/') {
        embedUrl = `https://test.autoembed.cc/embed/tv/${seriesId}/${seasonNumber}/${episodeNumber}?autoplay=true&server=5`;
    } else if (currentServerUrl === 'https://multiembed.mov/') {
        embedUrl = `https://multiembed.mov/?video_id=${seriesId}&tmdb=1&s=${seasonNumber}&e=${episodeNumber}`;
    } else if (currentServerUrl === 'https://www.primewire.tf/embed/') {
        embedUrl = `https://www.primewire.tf/embed/tv?tmdb=${seriesId}&season=${seasonNumber}&episode=${episodeNumber}`;
    } else if (currentServerUrl === 'https://vidrock.net/') {
        embedUrl = `https://vidrock.net/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    } else if (currentServerUrl === 'https://vidrock.net/mega/') {
        embedUrl = `https://vidrock.net/mega/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    } else if (currentServerUrl === 'https://vidnest.fun/') {
        embedUrl = `https://vidnest.fun/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    } else if (currentServerUrl === 'https://player.vidzee.wtf/embed/') {
        embedUrl = `https://player.vidzee.wtf/embed/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    } else {
        embedUrl = `${currentServerUrl}tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    }

    const player = document.getElementById('video-player');
    if (player) player.src = embedUrl;

    // Remove now-playing from all episode journal cards
    document.querySelectorAll('.ep-journal-card').forEach(card => {
        card.classList.remove('now-playing');
        const badge = card.querySelector('.ep-now-playing-badge');
        if (badge) badge.remove();
    });

    // Add now-playing to the active card
    document.querySelectorAll(`.ep-journal-card[data-episode="${episodeNumber}"]`).forEach(card => {
        card.classList.add('now-playing');
        const statusSlot = card.querySelector('.ep-status-slot');
        if (statusSlot && !statusSlot.querySelector('.ep-now-playing-badge')) {
            statusSlot.innerHTML = '<span class="ep-now-playing-badge">NOW PLAYING</span>';
        }
    });

    // Update player title overlay if episode name is available
    const titleEp = document.querySelector('.player-title-ep');
    if (titleEp) titleEp.textContent = `S${seasonNumber} · E${episodeNumber}`;

    // Sync season selector
    const seasonSelector = document.getElementById('season-selector');
    if (seasonSelector) seasonSelector.value = seasonNumber;

    updateTvEpisodeAbout(seriesId, seasonNumber, episodeNumber);

    const episodeGrid = document.getElementById('episode-grid');
    if (episodeGrid) {
        const cards = episodeGrid.querySelectorAll('.episode-card');
        cards.forEach(c => c.classList.remove('active'));
        const currentCard = episodeGrid.querySelector(`.episode-card[data-episode="${episodeNumber}"]`);
        if (currentCard) currentCard.classList.add('active');
    }

    // Update global playing episode state
    window.currentPlayingEpisode = { seriesId, seasonNumber, episodeNumber };

    const serverSelectionBox = document.querySelector('.server-selection');
    if (serverSelectionBox) {
        const navbar = document.getElementById('navbar');
        const navbarOffset = navbar ? navbar.offsetHeight : 0;
        const serverBottom = serverSelectionBox.getBoundingClientRect().bottom + window.scrollY - navbarOffset;
        window.scrollTo({ top: serverBottom, behavior: 'smooth' });
    }
}