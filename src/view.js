// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movieId');
const type = urlParams.get('type') || 'movie';
const apiKey = "97df57ffd9278a37bc12191e00332053";

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (movieId) {
        fetchMovieDetails();
    } else {
        showError();
    }
});

async function fetchMovieDetails() {
    try {
        const loading = document.getElementById('loading');
        const movieContent = document.getElementById('movieContent');
        
        const endpoint = type === 'tv' ? 'tv' : 'movie';
        const response = await fetch(`https://api.themoviedb.org/3/${endpoint}/${movieId}?api_key=${apiKey}&language=en-US`);
        
        if (!response.ok) {
            throw new Error('Movie not found');
        }
        
        const movieData = await response.json();
        
        // Hide loading and show content
        loading.classList.add('hidden');
        movieContent.classList.remove('hidden');
        
        displayMovieDetails(movieData);
        trackMovieVisit(movieData);
        
    } catch (error) {
        console.error('Error fetching movie details:', error);
        showError();
    }
}

function trackMovieVisit(movieData) {
    if (!window.MovieIGuessStorage) return;
    const entry = window.MovieIGuessStorage.buildEntryFromTmdb(movieData, type);
    window.MovieIGuessStorage.upsertContinueWatching(entry, { bumpProgress: true });
}

function setupMyListButton(movieData) {
    const btn = document.getElementById('myListBtn');
    const store = window.MovieIGuessStorage;
    if (!btn || !store) return;

    const entry = store.buildEntryFromTmdb(movieData, type);

    function refreshLabel() {
        const saved = store.isInMyList(movieData.id, type);
        const label = document.getElementById('myListBtnLabel');
        const labelShort = document.getElementById('myListBtnLabelShort');
        const icon = document.getElementById('myListBtnIcon');
        const text = saved ? 'In My List' : 'My List';
        if (label) label.textContent = text;
        if (labelShort) labelShort.textContent = saved ? 'Saved' : 'List';
        if (icon) {
            icon.classList.toggle('fa-plus', !saved);
            icon.classList.toggle('fa-check', saved);
        }
    }

    refreshLabel();
    btn.addEventListener('click', () => {
        const added = store.toggleMyList(entry);
        refreshLabel();
        if (typeof showSuccess === 'function') {
            showSuccess(added ? 'Added to My List' : 'Removed from My List');
        }
    });
}

function displayMovieDetails(movieData) {
    const backdropImg = document.getElementById('backdropImage');
    
    if (backdropImg) {
        const posterPath = movieData.poster_path || movieData.backdrop_path;
        if (posterPath) {
            backdropImg.src = `https://image.tmdb.org/t/p/w780${posterPath}`;
            backdropImg.alt = movieData.title || movieData.name || '';
        } else {
            backdropImg.removeAttribute('src');
        }
    }
    
    // Title
    const title = movieData.title || movieData.name;
    document.getElementById('movieTitle').textContent = title;
    document.title = `${title} - MovieIGuess`;
    
    // Rating
    if (movieData.vote_average) {
        const ratingEl = document.getElementById('movieRating');
        if (ratingEl) {
            ratingEl.innerHTML = `<i class="fa-solid fa-star mr-2"></i><span class="text-white text-lg font-semibold">${movieData.vote_average.toFixed(1)}</span>`;
        }
    }
    
    // Year
    const releaseDate = movieData.release_date || movieData.first_air_date;
    if (releaseDate) {
        const yearEl = document.getElementById('movieYear');
        if (yearEl) {
            yearEl.textContent = new Date(releaseDate).getFullYear();
        }
    }
    
    // Runtime
    if (movieData.runtime) {
        const hours = Math.floor(movieData.runtime / 60);
        const minutes = movieData.runtime % 60;
        const runtimeEl = document.getElementById('movieRuntime');
        const runtimeDetailEl = document.getElementById('runtimeDetail');
        
        if (runtimeEl) runtimeEl.textContent = `${hours}h ${minutes}m`;
        if (runtimeDetailEl) runtimeDetailEl.textContent = `${hours}h ${minutes}m`;
    }
    
    // Genres
    if (movieData.genres && movieData.genres.length > 0) {
        const genresText = movieData.genres.map(g => g.name).join(', ');
        const genresEl = document.getElementById('movieGenres');
        if (genresEl) {
            genresEl.textContent = genresText;
        }
        
        // Genre tags
        const genresList = document.getElementById('genresList');
        if (genresList) {
            genresList.innerHTML = '';
            movieData.genres.forEach(genre => {
                const tag = document.createElement('span');
                tag.className = 'genre-tag';
                tag.textContent = genre.name;
                genresList.appendChild(tag);
            });
        }
    }
    
    // Overview
    if (movieData.overview) {
        const overviewEl = document.getElementById('movieOverview');
        const detailedOverviewEl = document.getElementById('detailedOverview');
        
        if (overviewEl) overviewEl.textContent = movieData.overview;
        if (detailedOverviewEl) detailedOverviewEl.textContent = movieData.overview;
    }
    
    // Detailed information
    const releaseDateEl = document.getElementById('releaseDate');
    const ratingDetailEl = document.getElementById('ratingDetail');
    const voteCountEl = document.getElementById('voteCount');
    const languageEl = document.getElementById('language');
    const budgetEl = document.getElementById('budget');
    const revenueEl = document.getElementById('revenue');
    
    if (releaseDateEl) {
        releaseDateEl.textContent = releaseDate ? new Date(releaseDate).toLocaleDateString() : 'N/A';
    }
    if (ratingDetailEl) {
        ratingDetailEl.textContent = movieData.vote_average ? `${movieData.vote_average.toFixed(1)}/10` : 'N/A';
    }
    if (voteCountEl) {
        voteCountEl.textContent = movieData.vote_count ? movieData.vote_count.toLocaleString() : 'N/A';
    }
    if (languageEl) {
        languageEl.textContent = movieData.original_language ? movieData.original_language.toUpperCase() : 'N/A';
    }
    if (budgetEl) {
        budgetEl.textContent = movieData.budget ? `$${movieData.budget.toLocaleString()}` : 'N/A';
    }
    if (revenueEl) {
        revenueEl.textContent = movieData.revenue ? `$${movieData.revenue.toLocaleString()}` : 'N/A';
    }
    
    // Production companies
    if (movieData.production_companies && movieData.production_companies.length > 0) {
        const companiesContainer = document.getElementById('productionCompanies');
        if (companiesContainer) {
            companiesContainer.innerHTML = '';
            
            movieData.production_companies.forEach(company => {
                const card = document.createElement('div');
                card.className = 'production-card';
                
                let logoHtml = '';
                if (company.logo_path) {
                    logoHtml = `<img src="https://image.tmdb.org/t/p/w200${company.logo_path}" alt="${company.name}">`;
                }
                
                card.innerHTML = `
                    ${logoHtml}
                    <p class="text-white text-sm font-medium">${company.name}</p>
                    <p class="text-gray-400 text-xs">${company.origin_country || ''}</p>
                `;
                
                companiesContainer.appendChild(card);
            });
        }
    }
    
    // Setup play button
    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (window.MovieIGuessStorage) {
                const entry = window.MovieIGuessStorage.buildEntryFromTmdb(movieData, type);
                window.MovieIGuessStorage.upsertContinueWatching(entry, { bumpProgress: true });
            }
            if (type === 'tv') {
                window.location.href = `WatchMovie?seriesId=${movieId}&type=${type}`;
            } else {
                window.location.href = `WatchMovie?movieId=${movieId}&type=${type}`;
            }
        });
    }

    setupMyListButton(movieData);
    
    // Setup trailer button and fetch trailer data
    fetchTrailerData(movieData);
    
    if (type === 'movie') {
        fetchCast();
    }
}

async function fetchTrailerData(movieData) {
    const trailerButton = document.getElementById('trailerButton');
    const inlineTrailer = document.getElementById('inlineTrailer');
    const trailerPlaceholder = document.getElementById('trailerPlaceholder');
    const title = movieData.title || movieData.name;

    function showTrailerUnavailable() {
        if (trailerButton) {
            trailerButton.onclick = () => showDevToast('Trailer');
            trailerButton.style.display = 'flex';
        }
        if (inlineTrailer) {
            inlineTrailer.classList.add('hidden');
            inlineTrailer.removeAttribute('src');
        }
        if (trailerPlaceholder) {
            trailerPlaceholder.classList.remove('hidden');
            trailerPlaceholder.innerHTML = `
                <i class="fa-solid fa-video-slash text-4xl text-gray-500 mb-3"></i>
                <p class="text-gray-300 font-semibold">No trailer available</p>
            `;
        }
    }

    try {
        const endpoint = type === 'tv' ? 'tv' : 'movie';
        const videoUrls = [
            `https://api.themoviedb.org/3/${endpoint}/${movieId}/videos?api_key=${apiKey}&language=en-US`,
            `https://api.themoviedb.org/3/${endpoint}/${movieId}/videos?api_key=${apiKey}`
        ];

        let videos = [];
        for (const url of videoUrls) {
            const response = await fetch(url);
            if (!response.ok) continue;

            const data = await response.json();
            videos = data.results || [];
            if (videos.length) break;
        }
        
        const trailer = videos.find(video =>
            video.site === 'YouTube' &&
            video.type === 'Trailer' &&
            /official|trailer/i.test(video.name || '')
        ) || videos.find(video =>
            video.site === 'YouTube' &&
            video.type === 'Trailer'
        ) || videos.find(video =>
            video.site === 'YouTube' &&
            ['Teaser', 'Clip'].includes(video.type)
        );

        if (!trailer?.key) {
            showTrailerUnavailable();
            return;
        }

        if (trailerButton) {
            trailerButton.onclick = () => playTrailer(trailer.key, title);
            trailerButton.style.display = 'flex';
        }

        if (inlineTrailer) {
            inlineTrailer.src = `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1&playsinline=1`;
            inlineTrailer.title = `${title} trailer`;
            inlineTrailer.classList.remove('hidden');
        }
        if (trailerPlaceholder) {
            trailerPlaceholder.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error fetching trailer data:', error);
        showTrailerUnavailable();
    }
}

async function fetchCast() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`);
        
        if (response.ok) {
            const data = await response.json();
            displayCast(data.cast.slice(0, 10));
        }
    } catch (error) {
        console.error('Error fetching cast:', error);
    }
}

function displayCast(cast) {
    const container = document.getElementById('castContainer');
    if (!container) return;
    
    if (cast.length === 0) {
        container.innerHTML = '<p class="text-gray-400">Cast information not available.</p>';
        return;
    }
    
    const castList = cast.map(actor => {
        return `<span class="text-white font-medium">${actor.name}</span> as <span class="text-gray-400">${actor.character}</span>`;
    }).join(', ');
    
    container.innerHTML = `<p class="text-gray-300 leading-relaxed">${castList}</p>`;
}

function showError() {
    const loading = document.getElementById('loading');
    const errorState = document.getElementById('errorState');
    
    if (loading) loading.classList.add('hidden');
    if (errorState) errorState.classList.remove('hidden');
}
