(function () {
    const BULB_CLASSES = ['by', 'bw', 'by2', 'bw2', 'by3'];

    function headerHtml() {
        return `
            <div class="mg-fairy-banner" aria-hidden="true">
                <div class="wire"></div>
                <div class="mg-lights-row" id="mgLightsRow"></div>
                <div style="height: 18px;"></div>
            </div>

            <header class="navbar-glass fixed top-0 w-full z-50 transition-all duration-500" id="navbar">
                <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-16 py-4 space-y-4 lg:space-y-0">
                    <div class="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8 w-full lg:w-auto">
                        <h1 class="mg-nav-logo text-center lg:text-left flex items-center" id="movieiguessLogo">
                            <img src="src/assets/logo.png" alt="cinema Logo">cinema
                        </h1>
                    </div>

                    <div class="flex items-center space-x-4 w-full lg:w-auto justify-center lg:justify-end">
                        <div class="relative w-full max-w-md lg:w-64">
                            <input
                                type="text"
                                placeholder="Search a movie/series"
                                class="search-input text-white placeholder-gray-400 rounded-md px-4 py-2 w-full focus:outline-none transition-all"
                            >
                            <i class="fa-solid fa-magnifying-glass absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white transition-colors"></i>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    function searchHeaderHtml() {
        return `
            <div class="search-shared-header movieiguess-shared-header">
                <div class="mg-fairy-banner" aria-hidden="true">
                    <div class="wire"></div>
                    <div class="mg-lights-row" id="mgSearchLightsRow"></div>
                    <div style="height: 18px;"></div>
                </div>
            </div>
        `;
    }

    function initFairyLights(rowId = 'mgLightsRow') {
        const row = document.getElementById(rowId);
        if (!row) return;

        row.innerHTML = '';
        const count = window.innerWidth < 640 ? 14 : 22;
        for (let i = 0; i < count; i++) {
            const cls = BULB_CLASSES[i % BULB_CLASSES.length];
            const group = document.createElement('div');
            group.className = 'mg-bulb-group';
            group.innerHTML = `<div class="mg-bulb-string"></div><div class="mg-bulb ${cls}"></div>`;
            row.appendChild(group);
        }
    }

    function debounce(fn, ms) {
        let timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(fn, ms);
        };
    }

    function wireHeaderActions(scope = document) {
        scope.querySelectorAll('#movieiguessLogo, [data-shared-home]').forEach((logo) => {
            logo.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        });

        scope.querySelectorAll('[data-dev-feature]').forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const feature = link.getAttribute('data-dev-feature');
                if (typeof window.showDevToast === 'function') {
                    window.showDevToast(feature);
                }
            });
        });
    }

    function renderSearchHeader(mount) {
        if (!mount || mount.querySelector('.search-shared-header')) return;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = searchHeaderHtml().trim();
        const header = wrapper.firstElementChild;
        mount.insertBefore(header, mount.firstChild);
        wireHeaderActions(header);
        initFairyLights('mgSearchLightsRow');
    }

    function renderHeader() {
        let mount = document.getElementById('movieiguessSharedHeader');
        if (!mount) {
            mount = document.createElement('div');
            mount.id = 'movieiguessSharedHeader';
            document.body.insertBefore(mount, document.body.firstChild);
        }
        mount.classList.add('movieiguess-shared-header');

        if (!mount.dataset.rendered) {
            mount.innerHTML = headerHtml();
            mount.dataset.rendered = 'true';
        }

        wireHeaderActions(mount);
        initFairyLights();
    }

    function initScrollState() {
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (!navbar) return;
            navbar.classList.toggle('scrolled', window.scrollY > 100);
        });
    }

    function init() {
        window.MovieIGuessSharedHeader = { renderSearchHeader };
        renderHeader();
        initScrollState();
        window.addEventListener('resize', debounce(initFairyLights, 200));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
