(function () {
    function initPlayer(options) {
        var video = document.getElementById(options.videoId);
        var cover = document.getElementById(options.coverId);
        var loaded = false;
        var hls = null;

        if (!video || !cover) {
            return;
        }

        function attach() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.url;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(options.url);
                hls.attachMedia(video);
                return Promise.resolve();
            }
            video.src = options.url;
            return Promise.resolve();
        }

        function start() {
            cover.classList.add("is-hidden");
            attach().then(function () {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        cover.classList.remove("is-hidden");
                    });
                }
            });
        }

        cover.addEventListener("click", start);
        video.addEventListener("play", function () {
            if (!loaded) {
                start();
            }
        }, { once: true });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.BikanPlayer = {
        init: initPlayer
    };
})();
