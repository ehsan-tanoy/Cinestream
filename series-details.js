const API_KEY = "d24074791ab99994324a6950e6e0a31a";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/w780";
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
          <button class="series-btn play">
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

        <h3 class="section-title">Episodes</h3>

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
      showToast("Removed from watchlist", "remove");
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
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`
  );

  const data = await res.json();

  const container = document.getElementById("episodeList");

  container.innerHTML = "";

  data.episodes.forEach(ep => {

    const div = document.createElement("div");
    div.className = "episode-card";

    div.innerHTML = `
      <div class="episode-thumb">
        <img src="${ep.still_path ? IMG_URL + ep.still_path : 'blank_poster.png'}" />
      </div>

      <div class="episode-info">
        <h4>Episode ${ep.episode_number} · ${ep.name}</h4>
        <p>${ep.overview || "No overview available."}</p>
      </div>
    `;

    container.appendChild(div);
  });
}

function goSeries(id) {
  window.location.href = `series-details.html?id=${id}`;
}

loadSeriesDetails();
//showSeriesSkeleton();
