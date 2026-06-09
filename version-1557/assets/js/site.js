(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var target = "./search.html";

            if (query) {
                target += "?q=" + encodeURIComponent(query);
            }

            window.location.href = target;
        });
    });

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;

        function activateSlide(index) {
            activeIndex = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activateSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activateSlide((activeIndex + 1) % slides.length);
            }, 5200);
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function runFilter(form) {
        var list = document.querySelector("[data-filter-list]");

        if (!list) {
            return;
        }

        var textInput = form.querySelector("[data-filter-input]");
        var yearSelect = form.querySelector("[data-filter-year]");
        var query = normalize(textInput ? textInput.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");

        list.querySelectorAll(".filter-card").forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region")
            ].join(" "));
            var cardYear = normalize(card.getAttribute("data-year"));
            var matchedText = !query || haystack.indexOf(query) !== -1;
            var matchedYear = !year || cardYear === year;
            card.classList.toggle("is-filter-hidden", !(matchedText && matchedYear));
        });
    }

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
        var textInput = form.querySelector("[data-filter-input]");
        var yearSelect = form.querySelector("[data-filter-year]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (query && textInput) {
            textInput.value = query;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            runFilter(form);
        });

        if (textInput) {
            textInput.addEventListener("input", function () {
                runFilter(form);
            });
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", function () {
                runFilter(form);
            });
        }

        runFilter(form);
    });
})();
