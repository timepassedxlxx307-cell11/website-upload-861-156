(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var button = qs("[data-menu-button]");
    var panel = qs("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("is-open");
      button.classList.toggle("is-open", isOpen);
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initBackToTop() {
    var button = qs("[data-back-to-top]");

    if (!button) {
      return;
    }

    window.addEventListener("scroll", function () {
      button.classList.toggle("is-visible", window.scrollY > 500);
    });

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initPosterFallbacks() {
    qsa("[data-poster-shell] img").forEach(function (image) {
      image.addEventListener("error", function () {
        var shell = image.closest("[data-poster-shell]");

        if (shell) {
          shell.classList.add("is-missing");
        }

        image.remove();
      });
    });
  }

  function initHeroCarousel() {
    var carousel = qs("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = qsa("[data-hero-slide]", carousel);
    var dots = qsa("[data-hero-dot]", carousel);
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function movieResultCard(movie) {
    var tags = [movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(" · ");
    var image = escapeHtml(movie.cover || "./1.jpg");

    return [
      '<article class="movie-card">',
      '  <a class="movie-card-poster" href="' + escapeHtml(movie.url) + '">',
      '    <div class="poster-shell" data-poster-shell>',
      '      <img class="poster-img" src="' + image + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
      '      <span class="poster-fallback">影视猫</span>',
      '    </div>',
      '    <span class="movie-badge">' + escapeHtml(movie.rating) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + escapeHtml(tags) + '</span></div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine || "") + '</p>',
      '    <div class="movie-card-actions">',
      '      <a href="' + escapeHtml(movie.playUrl) + '">立即播放</a>',
      '      <a href="' + escapeHtml(movie.url) + '">详情</a>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join("\n");
  }

  function initSearchPage() {
    var page = qs("[data-search-page]");

    if (!page || !window.MovieSearchData) {
      return;
    }

    var input = qs("[data-search-input]", page);
    var status = qs("[data-search-status]", page);
    var results = qs("[data-search-results]", page);
    var query = readQuery();

    if (input) {
      input.value = query;
    }

    function render(value) {
      var keyword = String(value || "").trim().toLowerCase();

      if (!keyword) {
        status.textContent = "请输入关键词开始搜索。";
        results.innerHTML = "";
        return;
      }

      var matched = window.MovieSearchData.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" ").toLowerCase();

        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      status.textContent = "找到 " + matched.length + " 条相关影片";
      results.innerHTML = matched.map(movieResultCard).join("\n");
      initPosterFallbacks();
    }

    render(query);

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initBackToTop();
    initPosterFallbacks();
    initHeroCarousel();
    initSearchPage();
  });
})();
