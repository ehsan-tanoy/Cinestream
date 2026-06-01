const API_KEY = "d24074791ab99994324a6950e6e0a31a";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/w780";


const searchToggleBtn = document.getElementById("homeSearchBtn"); // header btn
const floatingSearch = document.getElementById("floatingSearch");

const homeInput = document.getElementById("homeSearchInput");
const homeBtn = document.getElementById("rightSearchBtn");
const homeLive = document.getElementById("homeLiveResults");





let isSearchOpen = false;
let debounceTimer;
const icon = document.querySelector("#homeSearchBtn .icon");




/* 🔍 TOGGLE */
searchToggleBtn.addEventListener("click", () => {
  isSearchOpen = !isSearchOpen;

  floatingSearch.classList.toggle("active");

  if (isSearchOpen) {
    icon.textContent = "close";
    homeInput.focus();
  } else {
    icon.textContent = "search";
    homeInput.value = "";
    homeLive.style.display = "none";
  }
});
homeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = homeInput.value.trim();

    if (!query) return;

    window.location.href = `series-search-result.html?query=${query}`;
  }
});

/* LIVE SEARCH */
homeInput.addEventListener("input", () => {
  const query = homeInput.value.trim();

  clearTimeout(debounceTimer);

  if (!query) {
    homeLive.style.display = "none";
    return;
  }

  debounceTimer = setTimeout(() => {
    fetchLiveHome(query);
  }, 300);
});

async function fetchLiveHome(query) {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${query}`
  );

  const data = await res.json();

  homeLive.innerHTML = "";
  homeLive.style.display = "block";

  data.results.slice(0, 15).forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("live-item");

    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" onerror="this.onerror=null; this.src='blank_poster.png';"/>
      <p>${movie.name}</p>
    `;

    div.onclick = () => {
      window.location.href = `series-details.html?id=${movie.id}`;
    };

    homeLive.appendChild(div);
  });
}

homeBtn.addEventListener("click", () => {
  const query = homeInput.value.trim();
  if (!query) return;

  window.location.href = `series-search-result.html?query=${query}`;
});


const params = new URLSearchParams(window.location.search);
const seriesId = params.get("id");

function showSeriesSkeleton() {

  const container = document.getElementById("seriesDetails");

  container.innerHTML = `
    <div class="series-details-skeleton">

      <div class="series-skeleton-backdrop skeleton-shimmer"></div>

      <div class="series-skeleton-content">

        <div class="series-skeleton-header">

          <div class="series-skeleton-poster skeleton-shimmer"></div>

          <div class="series-skeleton-info">
            <div class="series-skeleton-title skeleton-shimmer"></div>
            <div class="series-skeleton-meta skeleton-shimmer"></div>
          </div>

        </div>

        <div class="series-skeleton-genres">
          <div class="series-skeleton-pill skeleton-shimmer"></div>
          <div class="series-skeleton-pill skeleton-shimmer"></div>
          <div class="series-skeleton-pill skeleton-shimmer"></div>
        </div>

        <div class="series-skeleton-buttons">
          <div class="series-skeleton-btn skeleton-shimmer"></div>
          <div class="series-skeleton-btn skeleton-shimmer"></div>
        </div>

        <div class="series-skeleton-text skeleton-shimmer"></div>
        <div class="series-skeleton-text skeleton-shimmer"></div>
        <div class="series-skeleton-text short skeleton-shimmer"></div>

        <div class="series-skeleton-season-tabs">
          <div class="series-skeleton-season skeleton-shimmer"></div>
          <div class="series-skeleton-season skeleton-shimmer"></div>
          <div class="series-skeleton-season skeleton-shimmer"></div>
        </div>

        <div class="series-skeleton-episodes">

          ${Array(4).fill(`
            <div class="series-skeleton-episode skeleton-shimmer">
              <div class="series-skeleton-thumb skeleton-shimmer"></div>

              <div class="series-skeleton-ep-info">
                <div class="series-skeleton-ep-title skeleton-shimmer"></div>
                <div class="series-skeleton-ep-line skeleton-shimmer"></div>
                <div class="series-skeleton-ep-line short skeleton-shimmer"></div>
                <div class="series-skeleton-ep-line skeleton-shimmer"></div>
                <div class="series-skeleton-ep-line short skeleton-shimmer"></div>
              </div>
            </div>
          `).join("")}

        </div>

      </div>

    </div>
  `;
}

async function loadSeriesDetails() {
  
  showSeriesSkeleton();
  const detailsRes = await fetch(
    `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${API_KEY}`
  );

  const similarRes = await fetch(
    `https://api.themoviedb.org/3/tv/${seriesId}/similar?api_key=${API_KEY}`
  );

  const series = await detailsRes.json();
  const similar = await similarRes.json();

  renderSeries(series, similar.results);

  loadSeason(1);
}

function renderSeries(series, similar) {

  const container = document.getElementById("seriesDetails");

  container.innerHTML = `
    <div class="series-details">

      <div class="series-backdrop">
        <img src="${series.backdrop_path ? BACKDROP_URL + series.backdrop_path : 'blank_poster.png'}"
             onerror="this.onerror=null; this.src='blank_poster.png';"/>
      </div>

      <div class="series-content">

        <div class="series-poster-wrap">

          <div class="series-poster">
            <img src="${series.poster_path ? IMG_URL + series.poster_path : 'blank_poster.png'}"
                 onerror="this.onerror=null; this.src='blank_poster.png';"/>
          </div>

          <div class="series-main">
            <h1>${series.name}</h1>

            <div class="series-meta">
              <span>⭐ ${series.vote_average.toFixed(1)}</span> |
              <span>${series.first_air_date}</span><br>
              <span>${series.number_of_seasons} Seasons</span>
            </div>
          </div>

        </div>

        <div class="series-genres">
          ${series.genres.map(g => `<span>${g.name}</span>`).join("")}
        </div>

        <div class="series-actions">
          <button class="series-btn play" id="watchNowBtn">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px"
                 viewBox="0 -960 960 960" width="24px" fill="#000">
              <path d="m426-330 195-125q14-9 14-25t-14-25L426-630q-15-10-30.5-1.5T380-605v250q0 18 15.5 26.5T426-330Zm54 250q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
            </svg>
            Watch Now
          </button>

          <button class="series-btn watchlist">
            <img src="icons/bookmark-outline.svg" class="bookmark-icon">
            Watchlist
          </button>
        </div>

        <div class="series-overview">
          ${series.overview}
        </div>

        <h3 class="section-title" id="episodesSection">Episodes</h3>

        <div id="seasonTabs" class="season-tabs"></div>

        <div id="episodeList" class="episode-list"></div>

        <h3 class="section-title">You May Like</h3>

        <div class="similar-row">
          ${similar.slice(0,10).map(show => `
            <div class="similar-card" onclick="goSeries(${show.id})">
              <img src="${show.poster_path ? IMG_URL + show.poster_path : 'blank_poster.png'}"
                   onerror="this.onerror=null; this.src='blank_poster.png';"/>
            </div>
          `).join("")}
        </div>

      </div>
    </div>
  `;

  createSeasonTabs(series.number_of_seasons);

  /* WATCHLIST */
  const bookmarkIcon = document.querySelector(".bookmark-icon");
  const bookmarkCont = document.querySelector(".watchlist");

  function getWatchlist() {
    return JSON.parse(localStorage.getItem("watchlist")) || [];
  }

  function saveWatchlist(list) {
    localStorage.setItem("watchlist", JSON.stringify(list));
  }

  function isInWatchlist(id) {
    return getWatchlist().some(m => m.id == id);
  }

  function toggleWatchlist(seriesData) {
    let list = getWatchlist();

    if (isInWatchlist(seriesData.id)) {
      list = list.filter(m => m.id != seriesData.id);
    } else {
      list.unshift({
        id: seriesData.id,
        type: "Series",
        title: seriesData.name,
        poster: seriesData.poster_path,
        year: seriesData.first_air_date?.split("-")[0],
        rating: seriesData.vote_average
      });
    }

    saveWatchlist(list);
  }

  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = "toast";
    toast.classList.add(type, "show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }

  function updateWatchBtn(id) {
    const already = isInWatchlist(id);

    if (already) {
      bookmarkIcon.src = "icons/bookmark-filled.svg";
      bookmarkCont.classList.add("active");
    } else {
      bookmarkIcon.src = "icons/bookmark-outline.svg";
      bookmarkCont.classList.remove("active");
    }
  }

  updateWatchBtn(series.id);

  bookmarkCont.onclick = () => {
    const already = isInWatchlist(series.id);

    toggleWatchlist(series);
    updateWatchBtn(series.id);

    if (already) {
      showToast("Removed watchlist successfully", "remove");
    } else {
      showToast("Added to watchlist successfully", "success");
    }
  };
}

function createSeasonTabs(total) {

  const tabs = document.getElementById("seasonTabs");

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");

    btn.className = "season-btn";

    if (i === 1) {
      btn.classList.add("active");
    }

    btn.textContent = `Season ${i}`;

    btn.onclick = () => {

      document.querySelectorAll(".season-btn").forEach(b => {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      loadSeason(i);
      
    };

    tabs.appendChild(btn);
  }
}

function showEpisodeSkeleton() {

  const container = document.getElementById("episodeList");

  container.innerHTML = `
    ${Array(5).fill(`
      <div class="series-skeleton-episode skeleton-shimmer">
          
              

        <div class="series-skeleton-thumb skeleton-shimmer"></div>

        <div class="series-skeleton-ep-info">
          <div class="series-skeleton-ep-title skeleton-shimmer"></div>
          <div class="series-skeleton-ep-line skeleton-shimmer"></div>
          <div class="series-skeleton-ep-line short skeleton-shimmer"></div>
          <div class="series-skeleton-ep-line skeleton-shimmer"></div>
          <div class="series-skeleton-ep-line short skeleton-shimmer"></div>
        </div>

      </div>
    `).join("")}
  `;
}

async function loadSeason(seasonNumber) {
  
  showEpisodeSkeleton();

  // TMDB + Supabase একসাথে load করো — skeleton তখনই hide হবে যখন দুটোই ready
  const seriesTitleEl = document.querySelector(".series-main h1");
  const seriesTitle   = seriesTitleEl ? seriesTitleEl.textContent.trim() : "";

  const [tmdbRes, epMap] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`),
    seriesTitle ? fetchSupabaseEpisodes(seriesTitle) : Promise.resolve({})
  ]);

  const data      = await tmdbRes.json();
  const container = document.getElementById("episodeList");
  container.innerHTML = "";

  data.episodes.forEach(ep => {
    const epKey  = `S${String(seasonNumber).padStart(2,'0')}E${String(ep.episode_number).padStart(2,'0')}`;
    const epData = epMap[epKey] || null;
    const link   = epData?.link   || null;
    const quality= epData?.quality|| null;
    const size   = epData?.size   ? `${epData.size}` : null;

    // FTP label
    const ftpLabel = [quality, size].filter(Boolean).join('/');

    const div = document.createElement("div");
    div.className = "episode-card";

    div.innerHTML = `
      <div class="episode-thumb">
        <img src="${ep.still_path ? IMG_URL + ep.still_path : 'blank_poster.png'}"
             onerror="this.onerror=null; this.src='blank_poster.png';"/>
      </div>
      <div class="episode-info">
        <h4>E${ep.episode_number} · ${ep.name}</h4>
        <p>${ep.overview || "No overview available."}</p>
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;">
          <button class="ep-play-btn" onclick="openVidkingEp('${seriesId}','${seasonNumber}','${ep.episode_number}')">
            ▶ Play
          </button>
          ${link ? `
            <button onclick="openWithIntent('${link}')" style="
              padding: 4px 10px;
              background: rgba(255,255,255,0.08);
              color: rgba(255,255,255,0.75);
              border: 1px solid rgba(255,255,255,0.15);
              border-radius: 999px;
              font-size: 10px;
              font-weight: 600;
              font-family: Inter;
              cursor: pointer;
              white-space: nowrap;
            ">FTP${ftpLabel ? ' · ' + ftpLabel : ''}</button>
          ` : ''}
        </div>
      </div>
    `;

    container.appendChild(div);
  });
  
  document.getElementById("watchNowBtn").onclick = () => {
    const epSection = document.getElementById("episodesSection");
    const top = epSection.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };
}

function goSeries(id) {
  window.location.href = `series-details.html?id=${id}`;
}

function openVidkingEp(tmdbId, season, episode) {
  window.open(
    `stream.html?type=tv&id=${tmdbId}&s=${season}&e=${episode}`,
    '_blank'
  );
}



/*

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📡 SUPABASE — SERIES TABLE INTEGRATION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SUPA_URL = "https://uhkkfuitiuykndhyzgrs.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoa2tmdWl0aXV5a25kaHl6Z3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDczNDcsImV4cCI6MjA5MzgyMzM0N30.o-r5B3hUtaW6HbXR7QZvcCt1diM__aMPKEgI5jN9Kig";

const SUPA_HEADERS = {
  "apikey":        SUPA_KEY,
  "Authorization": `Bearer ${SUPA_KEY}`
};

// Cache — same series এ season switch করলে আবার API call হবে না
let epCache      = null;
let epCacheTitle = null;

async function fetchSupabaseEpisodes(seriesTitle) {
  if (epCacheTitle === seriesTitle && epCache) return epCache;

  try {
    const clean = seriesTitle.replace(/[:\-–—]/g, ' ').replace(/\s+/g, ' ').trim();

    // Step 1 — Exact title match
    let url = `${SUPA_URL}/rest/v1/series`
      + `?select=season,episode,direct_link,quality,file_size`
      + `&title=ilike.${encodeURIComponent(clean)}`
      + `&limit=1000`
      + `&order=season.asc,episode.asc`;

    let res  = await fetch(url, { headers: SUPA_HEADERS, signal: AbortSignal.timeout(6000) });
    let data = await res.json();

    // Step 2 — Fuzzy search
    if (!data?.length) {
      url = `${SUPA_URL}/rest/v1/series`
        + `?select=season,episode,direct_link,quality,file_size`
        + `&title=ilike.*${encodeURIComponent(clean)}*`
        + `&limit=1000`
        + `&order=season.asc,episode.asc`;

      res  = await fetch(url, { headers: SUPA_HEADERS, signal: AbortSignal.timeout(6000) });
      data = await res.json();
    }

    if (!data?.length) {
      console.log(`Supabase: "${clean}" — কোনো episode পাওয়া যায়নি`);
      epCache = {};
      epCacheTitle = seriesTitle;
      return {};
    }

    const map = {};
    data.forEach(f => {
      if (f.season && f.episode) {
        const key = `S${String(f.season).padStart(2,'0')}E${String(f.episode).padStart(2,'0')}`;
        map[key] = {
          link:    f.direct_link,
          quality: f.quality    || null,
          size:    f.file_size  || null
        };
      }
    });

    console.log(`Supabase: "${clean}" — ${Object.keys(map).length} episodes found`);
    epCache      = map;
    epCacheTitle = seriesTitle;
    return map;

  } catch(e) {
    console.warn("Supabase series error:", e.message);
    return {};
  }
}

function openWithIntent(link) {
  const isAndroid = /android/i.test(navigator.userAgent);
  if (isAndroid) {
    window.location.href =
      `intent:${link}#Intent;` +
      `type=video/*;` +
      `package=org.videolan.vlc;` +
      `S.browser_fallback_url=${encodeURIComponent(link)};` +
      `end`;
  } else {
    window.open(link, '_blank');
  }
}




loadSeriesDetails();
