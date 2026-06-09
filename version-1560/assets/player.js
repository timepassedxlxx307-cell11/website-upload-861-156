(function () {
  function setup(root) {
    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');
    var streamUrl = video ? video.getAttribute('data-stream') : '';
    var loaded = false;
    var hls = null;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function attachStream() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      loaded = true;
    }

    function start() {
      attachStream();
      overlay.classList.add('is-hidden');
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(setup);
}());
