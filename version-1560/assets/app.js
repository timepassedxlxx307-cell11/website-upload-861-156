(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function nextSlide() {
      showSlide(current + 1);
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(nextSlide, 5000);
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        nextSlide();
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  scopes.forEach(function (scope) {
    var list = scope.parentElement.querySelector('[data-filter-list]') || document.querySelector('[data-filter-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var type = scope.querySelector('[data-filter-type]');
    var category = scope.querySelector('[data-filter-category]');
    var empty = scope.parentElement.querySelector('[data-empty]');

    function valueOf(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }

    function update() {
      var keyword = valueOf(input);
      var selectedYear = valueOf(year);
      var selectedType = valueOf(type);
      var selectedCategory = valueOf(category);
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }
        if (selectedType && cardType !== selectedType) {
          matched = false;
        }
        if (selectedCategory && cardCategory !== selectedCategory) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type, category].forEach(function (node) {
      if (node) {
        node.addEventListener('input', update);
        node.addEventListener('change', update);
      }
    });
  });
}());
