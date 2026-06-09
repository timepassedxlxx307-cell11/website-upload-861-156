import { H as Hls } from "./hls-player.js";

function select(selector, scope) {
  return (scope || document).querySelector(selector);
}

function setupPlayer(container) {
  const video = select("video", container);
  const overlay = select("[data-player-overlay]", container);
  const source = container.getAttribute("data-video-src");
  let attached = false;
  let hls = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      attached = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = source;
    attached = true;
  }

  async function playVideo() {
    attachSource();

    if (overlay) {
      overlay.hidden = true;
    }

    video.setAttribute("controls", "controls");

    try {
      await video.play();
    } catch (error) {
      video.setAttribute("controls", "controls");

      if (overlay) {
        overlay.hidden = false;
        overlay.classList.add("needs-user-action");
      }
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (!attached || video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.hidden = true;
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-player]").forEach(setupPlayer);
});
