(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('.menu-toggle');
    var mobilePanel = qs('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var opened = mobilePanel.hasAttribute('hidden');
            if (opened) {
                mobilePanel.removeAttribute('hidden');
            } else {
                mobilePanel.setAttribute('hidden', '');
            }
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var backTop = qs('.back-top');

    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('is-visible', window.scrollY > 420);
        }, { passive: true });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var searchInput = qs('#search-input');
    var searchResults = qs('#search-results');
    var searchLabel = qs('#search-label');

    if (searchInput && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(searchInput.value);
            var cards = qsa('.movie-card', searchResults);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-text'));
                var matched = !query || text.indexOf(query) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            var oldEmpty = qs('.no-result', searchResults);
            if (oldEmpty) {
                oldEmpty.remove();
            }

            if (!visible) {
                var empty = document.createElement('div');
                empty.className = 'no-result';
                empty.textContent = '没有找到相关影片，请尝试其他关键词。';
                searchResults.appendChild(empty);
            }

            if (searchLabel) {
                searchLabel.textContent = query ? '搜索：' + searchInput.value : '全部内容';
            }
        }

        searchInput.addEventListener('input', applyFilter);
        applyFilter();
    }
})();
