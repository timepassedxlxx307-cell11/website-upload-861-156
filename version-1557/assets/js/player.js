(function () {
    var video = document.querySelector("video[data-stream]");
    var button = document.querySelector("[data-play-button]");

    if (!video) {
        return;
    }

    var src = video.getAttribute("data-stream");
    var loaded = false;
    var hlsInstance = null;
    var shouldPlay = false;

    function revealPlayer() {
        if (button) {
            button.classList.add("is-hidden");
        }
    }

    function requestPlay() {
        var playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
        }
    }

    function loadStream() {
        if (loaded || !src) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            video.load();
            return;
        }

        if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hlsInstance = new Hls({
                maxBufferLength: 36,
                enableWorker: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                if (shouldPlay) {
                    requestPlay();
                }
            });
            return;
        }

        video.src = src;
        video.load();
    }

    function startPlayback() {
        shouldPlay = true;
        revealPlayer();
        loadStream();
        requestPlay();
    }

    if (button) {
        button.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", revealPlayer);

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();
