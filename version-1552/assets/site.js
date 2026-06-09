(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                if (timer) {
                    clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            });
        });
        timer = window.setInterval(function () {
            show(active + 1);
        }, 5200);
    }

    function setupGlobalSearch() {
        var input = document.querySelector('[data-global-search]');
        var results = document.querySelector('[data-search-results]');
        if (!input || !results || !window.MovieSearch) {
            return;
        }
        function render(items) {
            if (!items.length) {
                results.classList.remove('is-open');
                results.innerHTML = '';
                return;
            }
            results.innerHTML = items.slice(0, 10).map(function (item) {
                return '<a class="search-result-item" href="' + item.url + '">' +
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
                    '<span><strong>' + escapeHtml(item.title) + '</strong>' +
                    '<span>' + escapeHtml(item.meta) + ' · ' + escapeHtml(item.text) + '</span></span>' +
                    '</a>';
            }).join('');
            results.classList.add('is-open');
        }
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                render([]);
                return;
            }
            var items = window.MovieSearch.filter(function (item) {
                return item.keywords.indexOf(query) !== -1;
            });
            render(items);
        });
        document.addEventListener('click', function (event) {
            if (!results.contains(event.target) && event.target !== input) {
                results.classList.remove('is-open');
            }
        });
    }

    function setupLocalFilter() {
        var input = document.querySelector('[data-filter-input]');
        var cards = selectAll('[data-movie-card]');
        var empty = document.querySelector('[data-empty-state]');
        if (!input || !cards.length) {
            return;
        }
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var keywords = card.getAttribute('data-keywords') || '';
                var matched = !query || keywords.toLowerCase().indexOf(query) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initPlayer(options) {
        var video = document.getElementById(options.videoId || 'movie-player');
        var button = document.getElementById(options.buttonId || 'play-button');
        var overlay = document.getElementById(options.overlayId || 'player-overlay');
        var source = options.source;
        var hls = null;
        var ready = false;
        if (!video || !source) {
            return;
        }
        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }
        function attach() {
            if (ready) {
                return Promise.resolve();
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1200);
                });
            }
            video.src = source;
            return Promise.resolve();
        }
        function play() {
            hideOverlay();
            attach().then(function () {
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {});
                }
            });
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                play();
            });
        }
        if (overlay) {
            overlay.addEventListener('click', function () {
                play();
            });
        }
        video.addEventListener('play', hideOverlay);
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupGlobalSearch();
        setupLocalFilter();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
})();
