(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                play();
            });
        });

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", play);
        play();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-search-input]");
        var year = panel.querySelector("[data-year-filter]");
        var type = panel.querySelector("[data-type-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (input && query) {
            input.value = query;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var q = normalize(input ? input.value : "");
            var selectedYear = normalize(year ? year.value : "");
            var selectedType = normalize(type ? type.value : "");

            cards.forEach(function (card) {
                var searchable = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var matchQuery = !q || searchable.indexOf(q) !== -1;
                var matchYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
                var matchType = !selectedType || normalize(card.getAttribute("data-type")).indexOf(selectedType) !== -1;
                card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchType));
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        if (type) {
            type.addEventListener("change", apply);
        }
        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
