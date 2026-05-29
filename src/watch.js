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
        const homepage = movie.homepage ? `<a href="${movie.homepage}" target="_blank" rel="noopener">${movie.homepage}</a>` : "No official website";
        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

        hideLoading();
        document.querySelector('.container').innerHTML = `
            <!-- Video and Sidebar Layout for Movies -->
            <div class="video-sidebar-layout movie-content-wrapper">
                <div class="video-section">
                    <div class="video-container">
                        <iframe id="video-player" src="${embedUrl}" allowfullscreen></iframe>
                    </div>
                    
                    <div class="server-selection">
                        <h3>Choose Server</h3>
                        <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 1rem; text-align: center;">
                            💡 If the current server is slow or not working, try switching to another server below :p
                        </p>
                        <div class="server-grid">
                            ${servers.map((server, index) => `
                                <button class="server-btn ${server.url === currentServerUrl ? 'active' : ''}" 
                                        onclick="changeServer('${server.url}', 'movie/${movieId}', ${index}, 'movie')">
                                    ${server.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
            </div>
            
            <div class="movie-details">
                <div class="details-grid">
                    <div>
                        <div class="detail-item">
                            <div class="detail-label">Overview</div>
                            <div class="detail-value">${movie.overview || "No overview available."}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Genres</div>
                            <div class="detail-value">${genres}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Release Date</div>
                            <div class="detail-value">${movie.release_date || "N/A"}</div>
                        </div>
                    </div>
                    <div>
                        <div class="detail-item">
                            <div class="detail-label">Rating</div>
                            <div class="detail-value">${rating} / 10 (${movie.vote_count?.toLocaleString() || 0} votes)</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Runtime</div>
                            <div class="detail-value">${movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Homepage</div>
                            <div class="detail-value">${homepage}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
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
        const homepage = series.homepage ? `<a href="${series.homepage}" target="_blank" rel="noopener">${series.homepage}</a>` : "No official website";
        const firstAirYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'N/A';
        const rating = series.vote_average ? series.vote_average.toFixed(1) : 'N/A';

        hideLoading();
        document.querySelector('.container').innerHTML = `
            <!-- Video and Sidebar Layout -->
            <div class="video-sidebar-layout">
                <div class="video-section">
                    <div class="video-container" id="video-container" style="display: none;">
                        <iframe id="video-player" allowfullscreen></iframe>
                    </div>

                    <div class="server-selection" id="server-selection" style="display: none;">
                        <h3>Choose Server</h3>
                        <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 1rem; text-align: center;">
                            💡 If the current server is slow or not working, try switching to another server below :p
                        </p>
                        <div class="server-grid">
                            ${servers.map((server, index) => `
                                <button class="server-btn ${server.url === currentServerUrl ? 'active' : ''}" 
                                        onclick="changeServer('${server.url}', 'tv/${seriesId}', ${index}, 'tv')">
                                    ${server.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Desktop Sidebar - Right of Video -->
                <div class="tv-sidebar desktop-only">
                    <div class="sidebar-header">
                        <h3>📺 Seasons & Episodes</h3>
                    </div>
                    
                    <div class="season-dropdown">
                        <label for="season-selector">Select Season:</label>
                        <div class="dropdown-wrapper">
                            <select id="season-selector" onchange="loadSeasonSidebar(${seriesId}, this.value)">
                                <option value="">Choose a season...</option>
                                ${series.seasons.filter(season => season.season_number !== 0).map(season => 
                                    `<option value="${season.season_number}">Season ${season.season_number} (${season.episode_count} episodes)</option>`
                                ).join('')}
                            </select>
                            <div class="dropdown-arrow">▼</div>
                        </div>
                    </div>

                    <div id="episodes-sidebar" class="episodes-sidebar">
                        <p class="select-season-text">👆 Select a season above to view episodes</p>
                    </div>
                </div>
            </div>

            <div class="movie-details">
                <div class="details-grid">
                    <div>
                        <div class="detail-item">
                            <div class="detail-label">Overview</div>
                            <div class="detail-value">${series.overview || "No overview available."}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Genres</div>
                            <div class="detail-value">${genres}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">First Air Date</div>
                            <div class="detail-value">${series.first_air_date || "N/A"}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Status</div>
                            <div class="detail-value">${series.status || "N/A"}</div>
                        </div>
                    </div>
                    <div>
                        <div class="detail-item">
                            <div class="detail-label">Rating</div>
                            <div class="detail-value">${rating} / 10 (${series.vote_count?.toLocaleString() || 0} votes)</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Seasons</div>
                            <div class="detail-value">${series.number_of_seasons} Season${series.number_of_seasons !== 1 ? 's' : ''}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Episodes</div>
                            <div class="detail-value">${series.number_of_episodes} Total Episodes</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Homepage</div>
                            <div class="detail-value">${homepage}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Auto-select Season 1, Episode 1
        setTimeout(() => {
            // Load Season 1 in sidebar and auto-select Episode 1
            const seasonSelector = document.getElementById('season-selector');
            if (seasonSelector) {
                seasonSelector.value = '1';
            }
            loadSeasonSidebar(seriesId, 1);
            
            watchEpisode(seriesId, 1, 1);
        }, 100);
    } catch (error) {
        console.error("Error fetching TV series:", error);
        hideLoading();
        showError();
    }
}

async function loadSeasonSidebar(seriesId, seasonNumber) {
    if (!seasonNumber) return;
    
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error(`Failed to fetch season data`);

        const season = await response.json();
        const episodesList = season.episodes.map(episode => {
            const title = episode.name.length > 25 ? episode.name.substring(0, 22) + '...' : episode.name;
            const overview = episode.overview ? 
                (episode.overview.length > 45 ? episode.overview.substring(0, 42) + '...' : episode.overview) : 
                'No description available';
            const airDate = episode.air_date ? new Date(episode.air_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            }) : '';
            const runtime = episode.runtime ? `${episode.runtime}m` : '';
            
            return `
                <div class="episode-card-sidebar" onclick="watchEpisode(${seriesId}, ${seasonNumber}, ${episode.episode_number})" data-episode="${episode.episode_number}">
                    <div class="episode-card-header">
                        <div class="episode-badge">E${episode.episode_number}</div>
                        <div class="episode-meta-top">
                            ${airDate ? `<span class="air-date">${airDate}</span>` : ''}
                            ${runtime ? `<span class="runtime">${runtime}</span>` : ''}
                        </div>
                    </div>
                    <div class="episode-card-content">
                        <h4 class="episode-card-title">${title}</h4>
                        <p class="episode-card-desc">${overview}</p>
                        <div class="episode-card-footer">
                            <div class="episode-rating">
                                <i class="fa-solid fa-star"></i>
                                <span>${episode.vote_average ? episode.vote_average.toFixed(1) : 'N/A'}</span>
                            </div>
                            <div class="now-playing-indicator">
                                <div class="sound-bars">
                                    <div class="bar"></div>
                                    <div class="bar"></div>
                                    <div class="bar"></div>
                                    <div class="bar"></div>
                                </div>
                                <span>Now Playing</span>
                            </div>
                            <div class="play-indicator">
                                <i class="fa-solid fa-play"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('episodes-sidebar').innerHTML = episodesList;

        // If this is Season 1 and we're auto-loading, highlight Episode 1 as playing
        if (seasonNumber == 1) {
            setTimeout(() => {
                const firstEpisode = document.querySelector('.episode-card-sidebar[data-episode="1"]');
                if (firstEpisode) {
                    firstEpisode.classList.add('now-playing');
                }
            }, 50);
        }

    } catch (err) {
        console.error("Error loading season for sidebar:", err);
        document.getElementById('episodes-sidebar').innerHTML = `<p class="error-text">Failed to load episodes</p>`;
    }
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
            const nowPlaying = document.querySelector('.episode-card-sidebar.now-playing');
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
    
    videoContainer.style.display = 'block';
    serverSelection.style.display = 'block';

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

    // Update episode highlighting in sidebar
    const sidebarCards = document.querySelectorAll('.episode-card-sidebar');
    sidebarCards.forEach(card => {
        card.classList.remove('now-playing');
        if (card.dataset.episode == episodeNumber) {
            card.classList.add('now-playing');
        }
    });

    // Update desktop episode grid active class and season selector (so UI reflects currently playing episode)
    const seasonSelector = document.getElementById('season-selector');
    if (seasonSelector) seasonSelector.value = seasonNumber;

    const episodeGrid = document.getElementById('episode-grid');
    if (episodeGrid) {
        const cards = episodeGrid.querySelectorAll('.episode-card');
        cards.forEach(c => c.classList.remove('active'));
        const currentCard = episodeGrid.querySelector(`.episode-card[data-episode="${episodeNumber}"]`);
        if (currentCard) currentCard.classList.add('active');
    }

    // Update global playing episode state
    window.currentPlayingEpisode = {
        seriesId: seriesId,
        seasonNumber: seasonNumber,
        episodeNumber: episodeNumber
    };

    // Scroll to video
    videoContainer.scrollIntoView({ behavior: 'smooth' });
}