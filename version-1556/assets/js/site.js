(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var showcase = document.querySelector('[data-hero-showcase]');

  if (showcase) {
    var cards = Array.prototype.slice.call(showcase.querySelectorAll('[data-hero-card]'));
    var activeIndex = 0;

    cards.forEach(function (card, index) {
      card.style.order = String(index);
    });

    if (cards.length > 1) {
      window.setInterval(function () {
        activeIndex = (activeIndex + 1) % cards.length;
        cards.forEach(function (card, index) {
          var order = (index - activeIndex + cards.length) % cards.length;
          card.style.order = String(order);
        });
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var categorySelect = document.querySelector('[data-category-select]');
  var filterList = document.querySelector('[data-filter-list]');
  var emptyState = document.querySelector('[data-empty-state]');

  function getQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function applyFilter() {
    if (!filterList) {
      return;
    }

    var term = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var category = categorySelect ? categorySelect.value : '';
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var itemCategory = card.getAttribute('data-category') || '';
      var matchedTerm = !term || text.indexOf(term) !== -1;
      var matchedCategory = !category || itemCategory === category;
      var show = matchedTerm && matchedCategory;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput) {
    var query = getQueryValue();

    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilter);
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var source = video ? video.querySelector('source') : null;
    var trigger = player.querySelector('[data-player-trigger]');
    var hlsInstance = null;
    var initialized = false;

    function initVideo() {
      if (!video || !source || initialized) {
        return;
      }

      initialized = true;
      var streamUrl = source.getAttribute('src');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startVideo() {
      initVideo();
      player.classList.add('is-playing');
      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (trigger && video) {
      trigger.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          player.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
