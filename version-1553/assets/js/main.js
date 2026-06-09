(function () {
    var header = document.getElementById("siteHeader");
    var toggle = document.getElementById("mobileToggle");
    var mobileNav = document.getElementById("mobileNav");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("active", current === activeIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("active", current === activeIndex);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    function restartHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startHero();
    }

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(activeIndex - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(activeIndex + 1);
            restartHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var index = Number(dot.getAttribute("data-hero-dot"));
            showSlide(index);
            restartHero();
        });
    });

    showSlide(0);
    startHero();

    var filterInput = document.querySelector("[data-filter-input]");
    var filterList = document.querySelector("[data-filter-list]");

    function filterItems() {
        if (!filterInput || !filterList) {
            return;
        }
        var value = filterInput.value.trim().toLowerCase();
        var items = Array.prototype.slice.call(filterList.querySelectorAll("[data-filter-item]"));
        items.forEach(function (item) {
            var text = (item.getAttribute("data-search") || "").toLowerCase();
            var title = (item.getAttribute("data-title") || "").toLowerCase();
            item.classList.toggle("is-filtered", value && text.indexOf(value) === -1 && title.indexOf(value) === -1);
        });
    }

    if (filterInput) {
        filterInput.addEventListener("input", filterItems);
    }
})();
