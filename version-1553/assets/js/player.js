(function () {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    var hlsInstance = null;
    var hasStarted = false;

    if (!video || !overlay) {
        return;
    }

    function bindStream() {
        var streamUrl = video.getAttribute("data-stream");
        if (!streamUrl || hasStarted) {
            return;
        }
        hasStarted = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function playMovie() {
        bindStream();
        overlay.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }

    overlay.addEventListener("click", playMovie);
    video.addEventListener("click", function () {
        if (!hasStarted) {
            playMovie();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();
