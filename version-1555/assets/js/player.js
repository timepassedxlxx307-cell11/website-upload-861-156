(function () {
    function setupPlayer(wrapper) {
        var video = wrapper.querySelector('video');
        var layer = wrapper.querySelector('.play-layer');
        var source = video ? video.querySelector('source') : null;
        var stream = source ? source.getAttribute('src') : '';
        var hlsInstance = null;
        var ready = false;

        if (!video || !stream) {
            return;
        }

        function prepare() {
            if (ready) {
                return;
            }
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function start() {
            prepare();
            if (layer) {
                layer.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.player-wrap')).forEach(setupPlayer);
    });
})();
