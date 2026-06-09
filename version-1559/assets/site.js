(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-toggle');
        if (menuButton) {
            menuButton.addEventListener('click', function () {
                var opened = document.body.classList.toggle('is-menu-open');
                menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
            });
        }

        var carousel = document.querySelector('[data-hero-carousel]');
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            function next() {
                show(current + 1);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(next, 5200);
            }

            var prevButton = carousel.querySelector('.hero-prev');
            var nextButton = carousel.querySelector('.hero-next');
            if (prevButton) {
                prevButton.addEventListener('click', function () {
                    show(current - 1);
                    restart();
                });
            }
            if (nextButton) {
                nextButton.addEventListener('click', function () {
                    show(current + 1);
                    restart();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    restart();
                });
            });
            show(0);
            restart();
        }

        var filterForm = document.querySelector('[data-filter-form]');
        var filterGrid = document.querySelector('[data-filter-grid]');
        if (filterForm && filterGrid) {
            var input = filterForm.querySelector('input[type="search"]');
            var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';

            function applyFilter(value) {
                var keyword = String(value || '').trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-year') || '',
                        card.textContent || ''
                    ].join(' ').toLowerCase();
                    card.classList.toggle('is-filter-hidden', keyword && text.indexOf(keyword) === -1);
                });
            }

            if (input && query) {
                input.value = query;
                applyFilter(query);
            }

            if (input) {
                input.addEventListener('input', function () {
                    applyFilter(input.value);
                });
            }

            filterForm.addEventListener('submit', function (event) {
                event.preventDefault();
                if (input) {
                    applyFilter(input.value);
                }
            });
        }

        var player = document.getElementById('movie-player');
        var startButton = document.getElementById('player-start');
        var source = window.moviePlayerSource || '';
        var hlsInstance = null;
        var attached = false;

        function attachPlayer() {
            if (!player || !source || attached) {
                return;
            }
            attached = true;
            if (player.canPlayType('application/vnd.apple.mpegurl')) {
                player.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(player);
            } else {
                player.src = source;
            }
        }

        function startPlayback() {
            if (!player) {
                return;
            }
            attachPlayer();
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
            var playResult = player.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (player) {
            player.addEventListener('click', function () {
                if (player.paused) {
                    startPlayback();
                }
            });
            player.addEventListener('play', function () {
                if (startButton) {
                    startButton.classList.add('is-hidden');
                }
            });
            player.addEventListener('ended', function () {
                if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
                    hlsInstance.stopLoad();
                }
            });
        }

        if (startButton) {
            startButton.addEventListener('click', startPlayback);
        }
    });
})();
