const state = {
    hlsLoader: null
};

function getHls() {
    if (!state.hlsLoader) {
        state.hlsLoader = import("./hls-vendor.js").then((module) => module.H);
    }
    return state.hlsLoader;
}

function setupMobileMenu() {
    const button = document.querySelector("[data-mobile-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
        return;
    }
    button.addEventListener("click", () => {
        menu.classList.toggle("open");
    });
}

function setupImageFallbacks() {
    document.querySelectorAll("img[data-cover]").forEach((image) => {
        image.addEventListener("error", () => {
            image.classList.add("is-missing");
        }, { once: true });
    });
}

function setupHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
        return;
    }
    let activeIndex = 0;
    let timer = null;
    const show = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === activeIndex);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === activeIndex);
        });
    };
    const start = () => {
        clearInterval(timer);
        timer = setInterval(() => show(activeIndex + 1), 5200);
    };
    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            show(Number(dot.dataset.heroDot || 0));
            start();
        });
    });
    hero.addEventListener("mouseenter", () => clearInterval(timer));
    hero.addEventListener("mouseleave", start);
    start();
}

function setupFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach((panel) => {
        const section = panel.closest("section");
        if (!section) {
            return;
        }
        const list = section.querySelector("[data-card-list]");
        const empty = section.querySelector("[data-empty-state]");
        if (!list) {
            return;
        }
        const cards = Array.from(list.querySelectorAll(".movie-card"));
        const keyword = panel.querySelector("[data-filter-keyword]");
        const year = panel.querySelector("[data-filter-year]");
        const region = panel.querySelector("[data-filter-region]");
        const type = panel.querySelector("[data-filter-type]");
        const apply = () => {
            const kw = (keyword?.value || "").trim().toLowerCase();
            const selectedYear = year?.value || "";
            const selectedRegion = region?.value || "";
            const selectedType = type?.value || "";
            let visible = 0;
            cards.forEach((card) => {
                const text = [card.dataset.title, card.dataset.genre, card.dataset.tags].join(" ").toLowerCase();
                const matched = (!kw || text.includes(kw))
                    && (!selectedYear || card.dataset.year === selectedYear)
                    && (!selectedRegion || card.dataset.region === selectedRegion)
                    && (!selectedType || card.dataset.type === selectedType);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        };
        [keyword, year, region, type].forEach((control) => {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });
}

function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach((player) => {
        const video = player.querySelector("video[data-src]");
        const startButton = player.querySelector("[data-player-start]");
        const status = player.querySelector("[data-player-status]");
        if (!video || !startButton) {
            return;
        }
        let prepared = false;
        let preparing = false;
        let hls = null;
        const setStatus = (message) => {
            if (!status) {
                return;
            }
            status.textContent = message;
            status.hidden = !message;
        };
        const prepare = async () => {
            if (prepared || preparing) {
                return;
            }
            preparing = true;
            const source = video.dataset.src;
            setStatus("加载中...");
            try {
                const Hls = await getHls();
                if (Hls && Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        prepared = true;
                        preparing = false;
                        setStatus("");
                    });
                    hls.on(Hls.Events.ERROR, (_event, data) => {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus("网络波动，正在恢复...");
                            hls.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus("媒体加载中断，正在恢复...");
                            hls.recoverMediaError();
                        } else {
                            setStatus("视频暂时无法加载");
                            preparing = false;
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    prepared = true;
                    preparing = false;
                    setStatus("");
                } else {
                    setStatus("视频暂时无法加载");
                    preparing = false;
                }
            } catch (_error) {
                setStatus("视频暂时无法加载");
                preparing = false;
            }
        };
        const start = async () => {
            await prepare();
            try {
                await video.play();
                startButton.classList.add("hidden");
                setStatus("");
            } catch (_error) {
                setStatus("点击播放器可继续播放");
            }
        };
        startButton.addEventListener("click", start);
        video.addEventListener("click", () => {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", () => {
            startButton.classList.add("hidden");
            setStatus("");
        });
        video.addEventListener("ended", () => {
            startButton.classList.remove("hidden");
        });
        window.addEventListener("beforeunload", () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

function createResultCard(movie) {
    const title = escapeHtml(movie.title);
    const desc = escapeHtml(movie.description);
    return `
        <article class="movie-card">
            <a href="${movie.url}" class="poster-link" aria-label="${title}">
                <span class="poster-shell">
                    <img src="${movie.cover}" alt="${title}" loading="lazy" data-cover>
                    <span class="poster-fallback">${title.slice(0, 1)}</span>
                    <span class="card-category">${escapeHtml(movie.category)}</span>
                </span>
            </a>
            <div class="movie-card-body">
                <h3><a href="${movie.url}">${title}</a></h3>
                <p>${desc}</p>
                <div class="card-meta">
                    <span>${escapeHtml(movie.region)}</span>
                    <span>${escapeHtml(movie.year)}</span>
                    <span>★ ${escapeHtml(String(movie.rating))}</span>
                </div>
            </div>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function setupSearchPage() {
    const results = document.querySelector("[data-search-results]");
    const summary = document.querySelector("[data-search-summary]");
    const title = document.querySelector("[data-search-title]");
    const input = document.querySelector("#search-page-input");
    const empty = document.querySelector("[data-search-empty]");
    if (!results || !window.SEARCH_INDEX) {
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    if (input) {
        input.value = query;
    }
    if (!query) {
        results.innerHTML = "";
        if (summary) {
            summary.textContent = "请输入关键词开始查找。";
        }
        return;
    }
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matched = window.SEARCH_INDEX.filter((movie) => {
        const text = [movie.title, movie.description, movie.category, movie.region, movie.year, movie.tags].join(" ").toLowerCase();
        return terms.every((term) => text.includes(term));
    }).slice(0, 120);
    if (title) {
        title.textContent = `“${query}”相关影片`;
    }
    if (summary) {
        summary.textContent = matched.length ? "以下内容按相关度展示。" : "没有找到匹配影片。";
    }
    if (empty) {
        empty.hidden = matched.length !== 0;
    }
    results.innerHTML = matched.map(createResultCard).join("");
    setupImageFallbacks();
}

document.addEventListener("DOMContentLoaded", () => {
    setupMobileMenu();
    setupImageFallbacks();
    setupHero();
    setupFilters();
    setupPlayers();
    setupSearchPage();
});
